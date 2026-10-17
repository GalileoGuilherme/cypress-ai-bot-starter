#!/usr/bin/env node
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function stripCodeFences(text = '') {
  return text
    .replace(/^```[a-zA-Z0-9]*\r?\n/, '')
    .replace(/\r?\n?```\s*$/, '')
}

export function slugify(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
}

export function parseArgs(args) {
  const [rawType = 'ui', ...options] = args
  const mock = options.includes('--mock')
  const description = options.filter((arg) => arg !== '--mock').join(' ').trim()
  const type = rawType.toLowerCase()

  if (!['ui', 'api'].includes(type)) {
    throw new Error('Tipo inválido. Use "ui" ou "api".')
  }

  if (!description) {
    throw new Error('Informe uma descrição para o teste.')
  }

  return { type, description, mock }
}

export function getOutputDirectory() {
  return path.resolve(__dirname, '../e2e/generated')
}

export function createMockTest(type, description) {
  const title = JSON.stringify(description)

  if (type === 'ui') {
    return `describe('Demo de login', () => {
  it(${title}, () => {
    cy.visit('/login')
    cy.intercept('POST', '/api/login').as('login')
    cy.get('[data-testid=email]').type('demo@example.com')
    cy.get('[data-testid=password]').type('Cypress123!')
    cy.get('[data-testid=submit]').click()
    cy.wait('@login').its('response.statusCode').should('eq', 200)
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid=welcome]').should('contain', 'Bem-vindo')
  })
})
`
  }

  if (type === 'api') {
    return `describe('Demo de API de carteira', () => {
  it(${title}, () => {
    cy.request('GET', '/api/wallet/balance/demo-wallet').then(({ status, body }) => {
      expect(status).to.eq(200)
      expect(body).to.have.all.keys('walletId', 'balance', 'currency')
      expect(body).to.deep.equal({
        walletId: 'demo-wallet',
        balance: 125.5,
        currency: 'BRL',
      })
    })
  })
})
`
  }

  throw new Error(`Tipo inválido: ${type}`)
}

function readPrompt(type) {
  const promptPath = path.resolve(__dirname, 'prompts', `${type}.md`)
  return fs.readFileSync(promptPath, 'utf8')
}

async function generateWithOpenAI({ type, description }) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'coloque_sua_chave_aqui') {
    throw new Error('Configure uma chave válida em OPENAI_API_KEY no arquivo .env ou use a opção --mock.')
  }

  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.1,
    messages: [
      { role: 'system', content: readPrompt(type) },
      { role: 'user', content: description },
    ],
  })

  const content = response.choices?.[0]?.message?.content
  if (!content?.trim()) {
    throw new Error('A API de IA retornou uma resposta vazia.')
  }

  return stripCodeFences(content).trim()
    .replace(/cy\.wait\(\s*\d+\s*\)/g, '/* TODO: substitua por intercept + wait */')
}

export async function generate({
  type,
  description,
  mock = false,
  outputDirectory = getOutputDirectory(),
}) {
  if (!['ui', 'api'].includes(type)) {
    throw new Error('Tipo inválido. Use "ui" ou "api".')
  }
  if (!description?.trim()) {
    throw new Error('Informe uma descrição para o teste.')
  }

  const code = mock
    ? createMockTest(type, description.trim())
    : await generateWithOpenAI({ type, description: description.trim() })
  const slug = slugify(description) || 'teste'
  const filename = `${Date.now()}_${slug}.cy.js`
  const outputPath = path.join(outputDirectory, filename)

  fs.mkdirSync(outputDirectory, { recursive: true })
  fs.writeFileSync(outputPath, `${code.trim()}\n`, { flag: 'wx' })
  return outputPath
}

export async function main(args = process.argv.slice(2)) {
  let options
  try {
    options = parseArgs(args)
  } catch (error) {
    console.error(`${error.message}\nUso: node cypress/bot/index.mjs <ui|api> [--mock] "Descrição do teste"`)
    return 1
  }

  try {
    const outputPath = await generate(options)
    console.log(`✅ Teste gerado em: ${outputPath}`)
    return 0
  } catch (error) {
    console.error(`❌ Falha ao gerar teste: ${error.message}`)
    return 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await main()
}
