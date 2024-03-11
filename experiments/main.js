import { Worker } from 'node:worker_threads'
import { join } from 'node:path'
import { main } from '../tbal.js'

const control = await main()

for (let i = 0; i < 4; i++) {
  const worker = new Worker(join(import.meta.dirname, 'worker.js'))
  await control.add(worker)

  worker.on('error', (error) => {
    console.error(error)
  })

  worker.on('exit', (code) => {
    console.error(new Error(`Worker stopped with exit code ${code}`))
  })
}
