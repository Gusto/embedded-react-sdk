import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Project, SyntaxKind } from 'ts-morph'
import { format, resolveConfig } from 'prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = join(__dirname, '..')
const SRC_GLOB = join(ROOT, 'src/**/*.{ts,tsx}')
const OUTPUT_PATH = join(ROOT, 'src/models/external.ts')
const RELATIVE_OUTPUT = 'src/models/external.ts'

const isVerifyMode = process.argv.includes('--verify')

const PACKAGE_NAME = '@gusto/embedded-api'
const COMPONENT_IMPORT = new RegExp(
  `^${PACKAGE_NAME.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')}/models/components/([a-z0-9]+)$`,
)

function dtsFor(moduleName: string): string {
  const dtsPath = join(
    ROOT,
    'node_modules',
    PACKAGE_NAME,
    'esm/models/components',
    `${moduleName}.d.ts`,
  )
  return existsSync(dtsPath) ? readFileSync(dtsPath, 'utf8') : ''
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** A module's component .d.ts declares a symbol as a *value* (not just a type) when it appears as a runtime declaration. */
function isValueSymbol(moduleName: string, symbol: string): boolean {
  // Negative lookahead excludes identifier chars *and* `$`, so the entity name `Employee`
  // does not match speakeasy's `Employee$inboundSchema` / `Employee$outboundSchema` helpers.
  const declaration = new RegExp(
    `export declare (const|function|class|enum) ${escapeRegExp(symbol)}(?![\\w$])`,
  )
  return declaration.test(dtsFor(moduleName))
}

/**
 * TypeDoc's `excludeNotDocumented: true` drops any re-exported symbol that lacks its own
 * top-level doc comment. Speakeasy only emits a type-level summary when the OpenAPI spec
 * carries a description, so we detect the gap here and the barrel supplies a summary for the
 * ones it's missing — otherwise those entities silently vanish from the reference.
 */
function hasTopLevelDoc(moduleName: string, symbol: string): boolean {
  const lines = dtsFor(moduleName).split('\n')
  const escaped = escapeRegExp(symbol)
  const declaration = new RegExp(
    `^export (type ${escaped}\\b|declare (const|function|class|enum) ${escaped}(?![\\w$]))`,
  )
  const declIndex = lines.findIndex(line => declaration.test(line))
  if (declIndex <= 0) return false
  let prev = declIndex - 1
  while (prev >= 0 && lines[prev]!.trim() === '') prev--
  return prev >= 0 && lines[prev]!.trim().endsWith('*/')
}

/** Collect the set of component-entity symbols referenced across non-test src, grouped by module. */
function collectReferencedSymbols(): Map<string, Set<string>> {
  const project = new Project({ skipAddingFilesFromTsConfig: true })
  project.addSourceFilesAtPaths([
    SRC_GLOB,
    `!${join(ROOT, 'src/**/*.test.{ts,tsx}')}`,
    `!${join(ROOT, 'src/**/*.stories.{ts,tsx}')}`,
    `!${join(ROOT, 'src/test/**')}`,
    `!${OUTPUT_PATH}`,
  ])

  const byModule = new Map<string, Set<string>>()
  for (const sourceFile of project.getSourceFiles()) {
    for (const importDecl of sourceFile.getImportDeclarations()) {
      const match = COMPONENT_IMPORT.exec(importDecl.getModuleSpecifierValue())
      if (!match) continue
      const moduleName = match[1]!
      const symbols = byModule.get(moduleName) ?? new Set<string>()
      for (const named of importDecl.getNamedImports()) {
        symbols.add(named.getName())
      }
      if (symbols.size > 0) byModule.set(moduleName, symbols)
    }
  }
  return byModule
}

/**
 * Expand the directly-referenced set to include every models/components type those entities
 * transitively reference, so property tables link to (rather than render bare) sub-types like
 * `DepartmentEmployees` or `Job`. A referenced type name resolves to a module via either a
 * same-file export or the file's `./<module>.js` import map; refs outside models/components
 * (zod, RFCDate, errors, …) are ignored.
 */
function expandToReferencedTypes(seed: Map<string, Set<string>>): Map<string, Set<string>> {
  const componentsDir = join(ROOT, 'node_modules', PACKAGE_NAME, 'esm/models/components')
  const project = new Project({ skipAddingFilesFromTsConfig: true })
  project.addSourceFilesAtPaths(join(componentsDir, '*.d.ts'))

  const result = new Map<string, Set<string>>()
  const queue: Array<{ module: string; symbol: string }> = []
  const enqueue = (module: string, symbol: string) => {
    const bucket = result.get(module) ?? new Set<string>()
    if (bucket.has(symbol)) return
    bucket.add(symbol)
    result.set(module, bucket)
    queue.push({ module, symbol })
  }
  for (const [module, symbols] of seed) for (const symbol of symbols) enqueue(module, symbol)

  while (queue.length > 0) {
    const { module, symbol } = queue.shift()!
    const sourceFile = project.getSourceFile(join(componentsDir, `${module}.d.ts`))
    if (!sourceFile) continue
    const declaration =
      sourceFile.getTypeAlias(symbol) ??
      sourceFile.getInterface(symbol) ??
      sourceFile.getEnum(symbol)
    if (!declaration) continue

    const ownExports = new Set<string>([
      ...sourceFile.getTypeAliases().map(t => t.getName()),
      ...sourceFile.getInterfaces().map(i => i.getName()),
      ...sourceFile.getEnums().map(e => e.getName()),
    ])
    const moduleByImportedName = new Map<string, string>()
    for (const importDecl of sourceFile.getImportDeclarations()) {
      const sibling = /^\.\/([a-z0-9]+)\.js$/.exec(importDecl.getModuleSpecifierValue())
      if (!sibling) continue
      for (const named of importDecl.getNamedImports()) {
        moduleByImportedName.set(named.getName(), sibling[1]!)
      }
    }

    for (const ref of declaration.getDescendantsOfKind(SyntaxKind.TypeReference)) {
      const name = ref.getTypeName().getText()
      if (ownExports.has(name)) enqueue(module, name)
      else if (moduleByImportedName.has(name)) enqueue(moduleByImportedName.get(name)!, name)
    }
  }
  return result
}

function render(byModule: Map<string, Set<string>>): string {
  const header = `// AUTOGENERATED by build/deriveExternalModels.ts — do not edit by hand.
// Re-exports the Gusto Embedded API entity types referenced across src so they are
// documented in the SDK reference (surfaced as the \`APIModels\` namespace from src/index.ts).
// Regenerate with \`npm run models:derive\`.
`

  const blocks = [...byModule.keys()]
    .sort()
    .map(moduleName => {
      const from = `from '${PACKAGE_NAME}/models/components/${moduleName}'`
      // Documented upstream → grouped plain re-export so the upstream summary flows through.
      // Missing upstream → one per line, each with a generated summary so it isn't dropped.
      const documentedTypes: string[] = []
      const documentedValues: string[] = []
      const undocumented: string[] = []
      for (const symbol of [...byModule.get(moduleName)!].sort()) {
        if (hasTopLevelDoc(moduleName, symbol)) {
          ;(isValueSymbol(moduleName, symbol) ? documentedValues : documentedTypes).push(symbol)
        } else {
          undocumented.push(symbol)
        }
      }

      const lines: string[] = []
      for (const symbol of undocumented) {
        const keyword = isValueSymbol(moduleName, symbol) ? 'export' : 'export type'
        lines.push(`/** \`${symbol}\` entity from the Gusto Embedded API. */`)
        lines.push(`${keyword} { ${symbol} } ${from}`)
      }
      if (documentedTypes.length > 0) {
        lines.push(`export type { ${documentedTypes.join(', ')} } ${from}`)
      }
      if (documentedValues.length > 0) {
        lines.push(`export { ${documentedValues.join(', ')} } ${from}`)
      }
      return lines.join('\n')
    })
    .join('\n')

  return `${header}\n${blocks}\n`
}

// Format with the repo's Prettier config so the output matches format:check — otherwise
// CI regenerates an unformatted barrel and the format job fails on the auto-committed file.
const prettierConfig = await resolveConfig(OUTPUT_PATH)
const output = await format(render(expandToReferencedTypes(collectReferencedSymbols())), {
  ...prettierConfig,
  filepath: OUTPUT_PATH,
})

if (isVerifyMode) {
  const current = existsSync(OUTPUT_PATH) ? readFileSync(OUTPUT_PATH, 'utf8') : ''
  if (current !== output) {
    console.error(
      `${RELATIVE_OUTPUT} is out of date. Run \`npm run models:derive\` and commit the result.`,
    )
    process.exit(1)
  }
  console.log(`${RELATIVE_OUTPUT} is up to date.`)
} else {
  writeFileSync(OUTPUT_PATH, output)
  console.log(`Wrote ${RELATIVE_OUTPUT}`)
}
