import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  createMockTest,
  generate,
  getOutputDirectory,
  parseArgs,
  slugify,
  stripCodeFences,
} from './index.mjs'

test('parses UI and API descriptions with the mock option', () => {
  assert.deepEqual(parseArgs(['ui', '--mock', 'Validar login']), {
    type: 'ui',
    description: 'Validar login',
    mock: true,
  })
  assert.deepEqual(parseArgs(['API', 'Validar saldo']), {
    type: 'api',
    description: 'Validar saldo',
    mock: false,
  })
})

test('rejects invalid CLI input', () => {
  assert.throws(() => parseArgs(['other', 'teste']), /Tipo inválido/)
  assert.throws(() => parseArgs(['ui']), /descrição/)
})

test('normalizes Portuguese text for generated filenames', () => {
  assert.equal(slugify('Validar ação: usuário!'), 'validar-acao-usuario')
})

test('removes Markdown code fences from model output', () => {
  assert.equal(stripCodeFences('```javascript\nconst answer = 42\n```'), 'const answer = 42')
})

test('mock specs exercise the demo login and wallet API', () => {
  assert.match(createMockTest('ui', 'Validar login'), /data-testid=email/)
  assert.match(createMockTest('ui', 'Validar login'), /POST', '\/api\/login/)
  assert.match(createMockTest('api', 'Validar saldo'), /\/api\/wallet\/balance\/demo-wallet/)
})

test('writes mock specs to the configured output directory', async (t) => {
  const outputDirectory = mkdtempSync(path.join(os.tmpdir(), 'cypress-ai-bot-'))
  t.after(() => rmSync(outputDirectory, { recursive: true, force: true }))

  const outputPath = await generate({
    type: 'api',
    description: 'Validar saldo',
    mock: true,
    outputDirectory,
  })

  assert.equal(path.dirname(outputPath), outputDirectory)
  assert.match(readFileSync(outputPath, 'utf8'), /demo-wallet/)
})

test('writes generated specs inside Cypress discovery path by default', () => {
  assert.equal(path.basename(getOutputDirectory()), 'generated')
  assert.equal(path.basename(path.dirname(getOutputDirectory())), 'e2e')
})
