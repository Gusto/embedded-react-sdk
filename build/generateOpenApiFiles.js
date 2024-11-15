/**
 * Use openapi-typescript-codegen to generate our typescript files
 * And transform them to be compatible with Typescript node16/nodenext resolution
 */
import fs from 'node:fs'
import path from 'node:path'
import openapiTS, { astToString } from 'openapi-typescript'

const ast = await openapiTS(new URL('../openapi/api.spec.json', import.meta.url), {
  inject: 'export type Schemas = components["schemas"]\nexport type Operations = operations',
})
const contents = astToString(ast)
const filePath = 'src/types/schema.d.ts'

// Check if the directory exists; if not, create it
const dir = path.dirname(filePath)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

fs.writeFileSync(filePath, contents)

console.log('Gusto Client files correctly generated !')
