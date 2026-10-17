import { createServer as createHttpServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pagePath = path.join(__dirname, 'index.html')

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

async function readJson(request) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 10_000) {
      throw new Error('Request body is too large.')
    }
  }
  return JSON.parse(body)
}

export function createServer() {
  return createHttpServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost')

    if (request.method === 'GET' && url.pathname.startsWith('/api/wallet/balance/')) {
      const walletId = decodeURIComponent(url.pathname.slice('/api/wallet/balance/'.length))
      if (!walletId) {
        sendJson(response, 400, { error: 'walletId is required.' })
        return
      }
      sendJson(response, 200, { walletId, balance: 125.5, currency: 'BRL' })
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/login') {
      let credentials
      try {
        credentials = await readJson(request)
      } catch {
        sendJson(response, 400, { error: 'A valid JSON body is required.' })
        return
      }

      if (credentials.email !== 'demo@example.com' || credentials.password !== 'Cypress123!') {
        sendJson(response, 401, { error: 'Invalid email or password.' })
        return
      }
      sendJson(response, 200, { user: { name: 'Demo' }, token: 'demo-token' })
      return
    }

    if (request.method === 'GET' && !url.pathname.startsWith('/api/')) {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      response.end(await readFile(pagePath))
      return
    }

    sendJson(response, 404, { error: 'Not found.' })
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 3000)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.')
  }

  createServer().listen(port, '127.0.0.1', () => {
    console.log(`Demo app running at http://localhost:${port}`)
  })
}
