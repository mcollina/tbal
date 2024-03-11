import { listen} from '../tbal.js'
import { createServer } from 'node:http'

const server = createServer()

await listen(server, {
  port: 3000
})

server.on('request', (req, res) => {
  res.end('hello, world')
})
