'use strict'

const http = require('node:http')
const { parentPort } = require('node:worker_threads')
const { on } = require('node:events')

async function main (opts) {
  const port = opts.port || 0
  const address = opts.address || '127.0.0.1'

  let fd
  let _address

  return {
    add (worker) {
      if (fd) {
        worker.postMessage({
          command: 'tbal:start',
          fd
        })
      } else {
        worker.postMessage({
          command: 'tbal:start',
          port,
          address
        })
      }
      let resolve
      const p = new Promise((_resolve) => { resolve = _resolve })
      const listener = (message) => {
        if (message.command === 'tbal:listening') {
          fd = message.fd
          _address = message.address
          worker.off('message', listener)
          resolve()
        }
      }
      worker.on('message', listener)
      return p
    },

    close () {

    },

    address () {
      return _address
    }
  }
}

async function worker () {
  let port
  let address
  let fd
  for await (const [message] of on(parentPort, 'message')) {
    if (message.command === 'tbal:start') {
      port = message.port
      address = message.address
      fd = message.fd
      break
    }
  }

  const server = http.createServer()

  server.listen({
    fd,
    port,
    address
  })

  await new Promise((resolve) => server.on('listening', resolve))
  parentPort.postMessage({
    command: 'tbal:listening',
    fd: server._handle.fd,
    address: server.address()
  })
  return server
}

module.exports.main = main
module.exports.worker = worker
