import { Worker } from 'node:worker_threads'
import { join } from 'node:path'
import { createServer } from 'node:net'
import once from 'node:events'

const server = createServer()
server.listen({
  port: 3000,
  readableAll: true,
  writableAll: true,
})
await new Promise((resolve) => server.on('listening', resolve))

for (let i = 0; i < 4; i++) {
  const worker = new Worker(join(import.meta.dirname, 'worker.js'))
  worker.postMessage({
    fd: server._handle.fd,
  })
  worker.on('message', (message) => {
    console.log(message)
  })

  worker.on('error', (error) => {
    console.error(error)
  })

  worker.on('exit', (code) => {
    console.error(new Error(`Worker stopped with exit code ${code}`))
  })
}
