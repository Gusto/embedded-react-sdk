/**
 * Post-build script: expands `typeof <unexported-const>` references in
 * exported type aliases within generated .d.ts files, replacing them with
 * the TypeScript-resolved concrete types.
 *
 * Background: TypeScript preserves `typeof <const>` in declaration files
 * rather than expanding mapped types. API Extractor flags these as
 * ae-forgotten-export because the referenced constant isn't exported from
 * the package entry point. This script resolves each such type alias to its
 * concrete form and removes the now-orphaned `declare const` statements.
 *
 * Safety: the .reports/embedded-react-sdk.api.md file is tracked in source
 * control and regenerated in CI. Any incorrect output from this script will
 * appear as an unexpected diff in that report.
 *
 * Run: npx tsx build/expandDtsTypeof.ts
 * Integrated via the `derive` script, after build, before api-report:derive.
 */
import { Project, ts, type SourceFile, type VariableStatement } from 'ts-morph'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = join(__dirname, '..')
const DIST_DIR = join(ROOT, 'dist')

function buildTypeofPattern(names: Set<string>): RegExp {
  const escaped = [...names].map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`\\btypeof\\s+(${escaped.join('|')})\\b`)
}

function rel(filePath: string): string {
  return relative(ROOT, filePath)
}

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

export function processSourceFile(sourceFile: SourceFile, checker: ts.TypeChecker): boolean {
  // Collect names of unexported variable declarations in this file.
  // These are the `declare const fieldValidators: {...}` statements that
  // appear alongside exported type aliases referencing them via `typeof`.
  const unexportedVarNames = new Set<string>()
  for (const stmt of sourceFile.getVariableStatements()) {
    if (stmt.hasExportKeyword()) continue
    for (const decl of stmt.getDeclarations()) {
      unexportedVarNames.add(decl.getName())
    }
  }

  if (unexportedVarNames.size === 0) return false

  const unexportedTypeofPattern = buildTypeofPattern(unexportedVarNames)
  let fileModified = false

  for (const typeAlias of sourceFile.getTypeAliases()) {
    if (!typeAlias.isExported()) continue
    // Generic type aliases can't be fully resolved to a concrete type —
    // resolution depends on type arguments supplied at usage sites.
    if (typeAlias.getTypeParameters().length > 0) continue

    const typeNode = typeAlias.getTypeNodeOrThrow()
    if (!unexportedTypeofPattern.test(typeNode.getText())) continue

    // getTypeFromTypeNode resolves the raw type node directly, bypassing
    // the alias symbol. Without this, typeToString returns the alias name
    // itself (e.g. "JobFormData") rather than the concrete expanded type.
    // Mapped types with complex type parameters can crash the checker when
    // the program context doesn't fully resolve cross-file symbols — skip
    // those gracefully; the API report surfaces any missed expansions.
    let rawType: ts.Type
    try {
      rawType = checker.getTypeFromTypeNode(typeNode.compilerNode)
    } catch {
      console.warn(
        `[expand-dts-typeof] ${rel(sourceFile.getFilePath())}: ${typeAlias.getName()} — type resolution threw, skipping`,
      )
      continue
    }
    const resolvedText = checker.typeToString(
      rawType,
      typeAlias.compilerNode,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias,
    )

    // Skip if resolution didn't help.
    if (resolvedText === typeAlias.getName()) {
      console.warn(
        `[expand-dts-typeof] ${rel(sourceFile.getFilePath())}: ${typeAlias.getName()} resolved to its own alias name — skipping`,
      )
      continue
    }
    // Skip if the resolved text still references an unexported const.
    if (unexportedTypeofPattern.test(resolvedText)) {
      console.warn(
        `[expand-dts-typeof] ${rel(sourceFile.getFilePath())}: ${typeAlias.getName()} resolved type still contains unexported typeof — skipping`,
      )
      continue
    }
    // Skip if resolution degraded to `any`. This indicates the type checker
    // couldn't fully resolve a cross-file dependency (e.g. a function-predicate
    // field in requiredFieldsConfig). Applying `any` would strip concrete union
    // information that partners rely on for type-safe field lists.
    if (/\bany\b/.test(resolvedText)) {
      console.warn(
        `[expand-dts-typeof] ${rel(sourceFile.getFilePath())}: ${typeAlias.getName()} resolved to a type containing \`any\` — skipping`,
      )
      continue
    }

    typeAlias.setType(resolvedText)
    fileModified = true
    console.log(
      `[expand-dts-typeof] ${rel(sourceFile.getFilePath())}: ${typeAlias.getName()} → ${truncate(resolvedText)}`,
    )
  }

  if (!fileModified) return false

  // After type alias expansion, remove any unexported variable declarations
  // that are no longer referenced anywhere in the file.
  const updatedText = sourceFile.getFullText()
  const stmtsToRemove: VariableStatement[] = []
  for (const stmt of sourceFile.getVariableStatements()) {
    if (stmt.hasExportKeyword()) continue
    const name = stmt.getDeclarations()[0]?.getName()
    if (!name || !unexportedVarNames.has(name)) continue
    if (!new RegExp(`\\btypeof\\s+${name}\\b`).test(updatedText)) {
      stmtsToRemove.push(stmt)
    }
  }
  for (const stmt of stmtsToRemove) {
    const name = stmt.getDeclarations()[0]?.getName() ?? '?'
    stmt.remove()
    console.log(
      `[expand-dts-typeof] ${rel(sourceFile.getFilePath())}: removed orphaned declare const ${name}`,
    )
  }

  return true
}

function main() {
  // Use the project tsconfig for correct moduleResolution/target settings,
  // but load only the generated dist .d.ts files — not the source tree.
  const project = new Project({
    tsConfigFilePath: join(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })
  project.addSourceFilesAtPaths(`${DIST_DIR}/**/*.d.ts`)

  // Access the raw TypeScript type checker for getTypeFromTypeNode, which
  // bypasses the alias wrapper and gives us the concrete resolved type.
  const checker = project.getTypeChecker().compilerObject

  let totalModified = 0
  for (const sourceFile of project.getSourceFiles()) {
    const modified = processSourceFile(sourceFile, checker)
    if (modified) {
      sourceFile.saveSync()
      totalModified++
    }
  }

  console.log(`\n[expand-dts-typeof] Done. Modified ${totalModified} file(s).`)
}

main()
