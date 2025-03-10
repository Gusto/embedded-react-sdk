import { watch } from 'fs'
import { exec } from 'child_process'
import { join } from 'path'

const WATCH_DIR = './src/i18n'
const COMMAND = 'npm run i18n:generate'

console.log(`Watching for changes in ${WATCH_DIR}...`)

watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
  if (filename) {
    const filePath = join(WATCH_DIR, filename)
    console.log(`File changed: ${filePath}`)
    console.log(`Executing: ${COMMAND}`)

    const process = exec(COMMAND)

    process.stdout.on('data', data => console.log(data))
    process.stderr.on('data', data => console.error(data))

    process.on('close', code => {
      if (code === 0) {
        console.log('Command executed successfully.')
      } else {
        console.log(`Command exited with code ${code}.`)
      }
    })
  }
})
