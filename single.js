import { createServer } from 'http'

const server = createServer((req, res) => {
  res.end('Hello, World!')
})

server.listen(3000)

