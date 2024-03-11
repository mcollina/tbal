import tbal from '../tbal.js'
import { createServer } from 'node:http'
import { parentPort } from 'node:worker_threads'

const server = createServer()


server.on('request', (req, res) => {
  parentPort.postMessage({ command: 'request' })
  res.end('hello world')
})

await tbal.listen(server, {
  port: 0
})
