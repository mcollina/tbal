import { createServer } from 'node:http'
import { parentPort } from 'node:worker_threads'
import { once } from 'node:events'

const server = createServer((req, res) => {
  res.end('hello, world')
})

process.on('uncaughtException', (error) => {
  process._rawDebug(error)
  process.exit(1)
})

process.on('unhandledRejection', (error) => {
  process._rawDebug(error)
  process.exit(1)
})

const [msg] = await once(parentPort, 'message')

server.listen({
  fd: msg.fd,
  readableAll: true,
  writableAll: true,
})
server.on('listening', () => {
  console.log('worker is ready')
  parentPort.postMessage('ready')
})

