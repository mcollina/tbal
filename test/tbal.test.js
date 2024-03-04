'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { Worker } = require('node:worker_threads')
const tbal = require('../')
const { join } = require('node:path')
const { request } = require('undici')
const { on } = require('node:events')
const { setTimeout: sleep } = require('node:timers/promises')

test('spawn 2 threads', async (t) => {
  const control = await tbal.main({
    port: 0
  })

  let worker1Messages = 0
  let worker2Messages = 0
  const worker1 = new Worker(join(__dirname, 'worker.mjs'))
  worker1.on('message', (message) => {
    worker1Messages++
  })
  const worker2 = new Worker(join(__dirname, 'worker.mjs'))
  worker2.on('message', (message) => {
    worker2Messages++
  })

  await control.add(worker1)
  await control.add(worker2)

  let promises = []
  for (let i = 0; i < 100; i++) {
    promises.push((async () => {
      const url = `http://127.0.0.1:${control.address().port}?i=${i}`
      const r = await request(url)
      await r.body.text()
    })())
  }

  await Promise.all(promises)

  t.diagnostic(`worker1Messages: ${worker1Messages}`)
  t.diagnostic(`worker2Messages: ${worker2Messages}`)
  assert.ok(worker1Messages >= 2)
  assert.ok(worker2Messages >= 2)
  worker1.terminate()
  worker2.terminate()
})
