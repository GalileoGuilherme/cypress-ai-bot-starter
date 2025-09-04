#!/usr/bin/env node
import 'dotenv/config'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })


function stripCodeFences(text = '') {
// Remove cercas ``` e linguagens, mantendo apenas o código
return text
.replace(/^```[a-zA-Z0-9]*\n/, '')
.replace(/```\s*$/, '')
}


function slugify(str = '') {
return str
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/(^-|-$)/g, '')
.slice(0, 60)
}


function readPrompt(type) {
const p = path.resolve(__dirname, 'prompts', `${type}.md`)
if (fs.existsSync(p)) return fs.readFileSync(p, 'utf-8')
return 'Você é um assistente de QA. Gere testes Cypress válidos.'
}


async function generate({ type, description }) {
const system = readPrompt(type)
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'


const resp = await client.chat.completions.create({
model,
temperature: 0.1,
messages: [
{ role: 'system', content: system },
{ role: 'user', content: description },
],
})


const content = resp.choices?.[0]?.message?.content || ''
let code = stripCodeFences(content).trim()


// Pequeno saneamento: evita waits fixos, sinalizando para revisão
code = code.replace(/cy\.wait\(\s*\d+\s*\)/g, '/* TODO: substitua por intercept + wait */')


const outDir = path.resolve(__dirname, '../../e2e/generated')
fs.mkdirSync(outDir, { recursive: true })


const filename = `${Date.now()}_${slugify(description)}.cy.js`
const outPath = path.join(outDir, filename)
fs.writeFileSync(outPath, code + '\n')


console.log(`✅ Teste gerado em: ${outPath}`)
}


const [,, argType, ...rest] = process.argv
const type = (argType || 'ui').toLowerCase() // ui | api
const description = rest.join(' ').trim()


if (!description) {
console.error('Uso: node cypress/bot/index.mjs <ui|api> "Descrição do teste"')
process.exit(1)
}


generate({ type, description }).catch(err => {
console.error('❌ Falha ao gerar teste:\n', err)
process.exit(1)
})