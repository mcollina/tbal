import tbal from '../tbal.js'
import { parentPort } from 'node:worker_threads'

const server = await tbal.worker(parentPort)

server.on('request', (req, res) => {
  parentPort.postMessage({ command: 'request' })
  res.end('hello world')
})
