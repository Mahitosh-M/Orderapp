import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dist = path.join(root, 'dist')
const serverDir = path.join(dist, 'server')
const hostingSource = path.join(root, '.openai', 'hosting.json')
const hostingTargetDir = path.join(dist, '.openai')

fs.mkdirSync(serverDir, { recursive: true })
fs.mkdirSync(hostingTargetDir, { recursive: true })
fs.copyFileSync(hostingSource, path.join(hostingTargetDir, 'hosting.json'))

fs.writeFileSync(
  path.join(serverDir, 'index.js'),
  `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404) return response

    const accept = request.headers.get('accept') || ''
    if (!accept.includes('text/html')) return response

    const url = new URL(request.url)
    url.pathname = '/index.html'
    return env.ASSETS.fetch(new Request(url, request))
  },
}
`,
  'utf8',
)
