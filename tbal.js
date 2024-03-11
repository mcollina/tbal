'use strict'

const { parentPort } = require('node:worker_threads')
const { on } = require('node:events')

async function main (opts) {
  let fd
  let _address

  return {
    add (worker) {
      worker.postMessage({
        command: 'tbal:start',
        fd,
        address: _address,
      })
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

async function listen (server, { port, address }) {
  let fd
  for await (const [message] of on(parentPort, 'message')) {
    if (message.command === 'tbal:start') {
      fd = message.fd
      if (message.address) {
        if (port !== 0 && message.address.port !== port) {
          throw new Error('Port mismatch')
        }
        if (address && message.address?.address !== address) {
          throw new Error('Address mismatch')
        }
      }
      break
    }
  }

  const listenObj = {}

  if (fd) {
    listenObj.fd = fd
  } else {
    listenObj.port = port
    listenObj.address = address
  }

  server.listen(listenObj)

  await new Promise((resolve) => server.on('listening', resolve))
  parentPort.postMessage({
    command: 'tbal:listening',
    fd: server._handle.fd,
    address: server.address()
  })
  return server
}

module.exports.main = main
module.exports.listen = listen
