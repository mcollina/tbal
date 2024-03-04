import { worker } from '../tbal.js'

const server = await worker()

server.on('request', (req, res) => {
  res.end('hello, world')
})
