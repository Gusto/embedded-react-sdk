#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, relative, resolve } from 'node:path'
import Ajv from 'ajv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const scenariosRoot = resolve(__dirname, '..')
const schemaPath = resolve(scenariosRoot, 'schema/scenario.schema.json')
const repoRoot = resolve(scenariosRoot, '../..')

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
const ajv = new Ajv({ allErrors: true, strict: false })
const validateScenario = ajv.compile(schema)

const subSchemas = {
  location: ajv.compile({
    ...schema.definitions.locationFragment,
    definitions: schema.definitions,
  }),
  employee: ajv.compile({
    ...schema.definitions.employeeFragment,
    definitions: schema.definitions,
  }),
  contractor: ajv.compile({
    ...schema.definitions.contractorFragment,
    definitions: schema.definitions,
  }),
}

const fragmentDomains = {
  'w2-salaried-employee.json': 'employee',
  'w2-hourly-employee.json': 'employee',
  'contractor-1099.json': 'contractor',
}

let failed = 0

const scenarioFiles = globSync('**/*.json', { cwd: scenariosRoot })
  .filter(p => !p.startsWith('schema/'))
  .filter(p => !p.startsWith('fragments/'))
  .filter(p => !p.startsWith('scripts/'))

for (const rel of scenarioFiles) {
  const abs = resolve(scenariosRoot, rel)
  const data = JSON.parse(readFileSync(abs, 'utf8'))
  if (!validateScenario(data)) {
    failed++
    console.error(`FAIL ${relative(repoRoot, abs)}`)
    for (const err of validateScenario.errors ?? []) {
      console.error(`  ${err.instancePath || '/'} ${err.message}`)
    }
  } else {
    console.log(`OK   ${relative(repoRoot, abs)}`)
  }
}

const fragmentFiles = globSync('fragments/*.json', { cwd: scenariosRoot })
for (const rel of fragmentFiles) {
  const abs = resolve(scenariosRoot, rel)
  const data = JSON.parse(readFileSync(abs, 'utf8'))
  const name = rel.replace(/^fragments\//, '')
  const domain = fragmentDomains[name]
  if (!domain) {
    console.log(`SKIP ${relative(repoRoot, abs)} (no domain mapping)`)
    continue
  }
  const validator = subSchemas[domain]
  if (!validator(data)) {
    failed++
    console.error(`FAIL ${relative(repoRoot, abs)} (as ${domain}Decoration)`)
    for (const err of validator.errors ?? []) {
      console.error(`  ${err.instancePath || '/'} ${err.message}`)
    }
  } else {
    console.log(`OK   ${relative(repoRoot, abs)} (as ${domain}Decoration)`)
  }
}

if (failed > 0) {
  console.error(`\n${failed} file(s) failed validation`)
  process.exit(1)
}
console.log(`\nAll ${scenarioFiles.length + fragmentFiles.length} files valid`)
