import fs from 'fs'
import path from 'path'
import { componentEvents } from '../src/shared/constants'

const outputPath = path.resolve('./docs/04/01/event-types.md')

let md = '<!--Generated file: do not modify-->\n'
md += `All of the events emitted by sdk components are listed in the following table:\n\n| Key | Value |\n|-----|-------|\n`
for (const [key, value] of Object.entries(componentEvents).sort(([aKey], [bKey]) =>
  aKey.localeCompare(bKey),
)) {
  md += `| ${key} | ${value} |\n`
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, md, 'utf-8')

console.log(`📄 Event types documentation written to: ${outputPath}`)
