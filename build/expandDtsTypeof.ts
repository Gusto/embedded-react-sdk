/**
 * Post-build transform: expands `typeof <unexported-const>` references in
 * exported type aliases within generated .d.ts files, replacing them with
 * the TypeScript-resolved concrete types.
 *
 * Background: TypeScript preserves `typeof <const>` in declaration files
 * rather than expanding mapped types. API Extractor flags these as
 * ae-forgotten-export because the referenced constant isn't exported from
 * the package entry point. This transform resolves each such type alias to
 * its concrete form and removes the now-orphaned `declare const` statements.
 *
 * Invoked automatically by `expandDtsTypeofPlugin` during `vite build`.
 *
 * Safety: the .reports/embedded-react-sdk.api.md file is tracked in source
 * control and regenerated in CI. Any incorrect output will appear as an
 * unexpected diff in that report.
 */
import {
  Node,
  ts,
  type SourceFile,
  type TypeAliasDeclaration,
  type VariableStatement,
} from 'ts-morph'
import { relative } from 'path'

function buildTypeofPattern(names: Set<string>): RegExp {
  const escaped = [...names].map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`\\btypeof\\s+(${escaped.join('|')})\\b`)
}

function rel(filePath: string): string {
  return relative(process.cwd(), filePath)
}

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

// Returns the name of the single unexported const referenced via `typeof` in
// the type node text, or undefined if zero or multiple consts are referenced.
function findSingleReferencedConst(
  typeNodeText: string,
  unexportedVarNames: Set<string>,
): string | undefined {
  let found: string | undefined
  for (const name of unexportedVarNames) {
    if (new RegExp(`\\btypeof\\s+${name}\\b`).test(typeNodeText)) {
      if (found !== undefined) return undefined
      found = name
    }
  }
  return found
}

// Builds a multi-line object type text with JSDoc prepended to each property
// whose name appears in propJsDocs. Returns null if the type has no properties.
function buildTypeWithPropertyJsDocs(
  rawType: ts.Type,
  contextNode: ts.Node,
  checker: ts.TypeChecker,
  propJsDocs: Map<string, string>,
): string | null {
  const props = rawType.getProperties()
  if (props.length === 0) return null

  const lines: string[] = ['{']
  for (const prop of props) {
    const isOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0
    const propType = checker.getTypeOfSymbolAtLocation(prop, contextNode)
    const propTypeText = checker.typeToString(
      propType,
      contextNode,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias,
    )
    const jsdoc = propJsDocs.get(prop.getName())
    if (jsdoc) lines.push(`  ${jsdoc}`)
    lines.push(`  ${prop.getName()}${isOptional ? '?' : ''}: ${propTypeText}`)
  }
  lines.push('}')
  return lines.join('\n')
}

// Returns true when the declaration carries an `@internal` JSDoc tag.
function hasInternalTag(node: TypeAliasDeclaration): boolean {
  return node.getJsDocs().some(doc => doc.getTags().some(tag => tag.getTagName() === 'internal'))
}

// Within an exported type alias, rewrites references to `@internal` type aliases
// (e.g. `FederalTaxFormInputs['taxPayerType']`) to their concrete resolved types,
// leaving the surrounding structure — generics like `RequireAtLeastOne<…>`, object
// shape, comments — intact. Returns the rewritten type-node text, or null if there
// was nothing to safely replace.
//
// Unlike the whole-alias `typeof`-const expansion, this resolves individual sub-nodes
// because the internal reference is typically nested inside a generic wrapper whose
// full resolution would both lose the wrapper and fail to resolve the inner reference.
function expandInternalTypeRefs(
  typeNode: Node,
  internalTypeNames: Set<string>,
  checker: ts.TypeChecker,
  contextNode: ts.Node,
): string | null {
  const escaped = [...internalTypeNames].map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const internalPattern = new RegExp(`\\b(${escaped.join('|')})\\b`)

  // Collect nodes referencing an @internal type alias.
  const candidates: Node[] = []
  typeNode.forEachDescendant(node => {
    if (Node.isIndexedAccessTypeNode(node)) {
      if (internalPattern.test(node.getObjectTypeNode().getText())) candidates.push(node)
    } else if (Node.isTypeReference(node) && internalTypeNames.has(node.getTypeName().getText())) {
      candidates.push(node)
    }
  })
  if (candidates.length === 0) return null

  // Keep only outermost candidates so an indexed access and the type reference
  // nested inside it aren't both rewritten (which would corrupt offsets).
  const outermost = candidates.filter(
    candidate =>
      !candidates.some(
        other =>
          other !== candidate &&
          other.getStart() <= candidate.getStart() &&
          candidate.getEnd() <= other.getEnd(),
      ),
  )

  const base = typeNode.getStart()
  const replacements: { start: number; end: number; text: string }[] = []
  for (const node of outermost) {
    let resolved: string
    try {
      resolved = checker.typeToString(
        checker.getTypeFromTypeNode(node.compilerNode as ts.TypeNode),
        contextNode,
        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias,
      )
    } catch {
      return null
    }
    // Bail rather than emit a degraded type that still leaks an internal name or
    // loses concrete union information to `any`.
    if (/\bany\b/.test(resolved) || internalPattern.test(resolved)) return null
    replacements.push({ start: node.getStart() - base, end: node.getEnd() - base, text: resolved })
  }

  // Apply right-to-left so earlier offsets stay valid as text length changes.
  let text = typeNode.getText()
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
    text = text.slice(0, replacement.start) + replacement.text + text.slice(replacement.end)
  }
  return text
}

export function processSourceFile(sourceFile: SourceFile, checker: ts.TypeChecker): string | null {
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

  // Type aliases marked @internal leak as ae-forgotten-export when referenced by
  // an exported @public alias. Collect them so those references can be expanded to
  // their concrete types in place, leaving the source's @internal reference intact.
  const internalTypeNames = new Set<string>()
  for (const typeAlias of sourceFile.getTypeAliases()) {
    if (hasInternalTag(typeAlias)) internalTypeNames.add(typeAlias.getName())
  }

  if (unexportedVarNames.size === 0 && internalTypeNames.size === 0) return null

  // For each unexported const with a TypeLiteralNode type, collect JSDoc for
  // each property so we can re-attach them after expansion.
  // Map: constName → (propName → jsdoc text e.g. "/** The title. */")
  const constPropJsDocs = new Map<string, Map<string, string>>()
  for (const stmt of sourceFile.getVariableStatements()) {
    if (stmt.hasExportKeyword()) continue
    for (const decl of stmt.getDeclarations()) {
      const constName = decl.getName()
      if (!unexportedVarNames.has(constName)) continue
      const typeNode = decl.getTypeNode()
      if (!typeNode || !Node.isTypeLiteral(typeNode)) continue
      const propMap = new Map<string, string>()
      for (const member of typeNode.getMembers()) {
        if (!Node.isPropertySignature(member)) continue
        const jsDocs = member.getJsDocs()
        if (jsDocs.length === 0) continue
        propMap.set(member.getName(), jsDocs[0]!.getText().trim())
      }
      if (propMap.size > 0) constPropJsDocs.set(constName, propMap)
    }
  }

  const unexportedTypeofPattern =
    unexportedVarNames.size > 0 ? buildTypeofPattern(unexportedVarNames) : null

  // Two-pass approach: resolve all types first (using the original checker
  // against the unmodified AST), then apply mutations. Mutating mid-loop via
  // typeAlias.setType() causes ts-morph to reparse the source file, making
  // subsequent compilerNodes come from a new program while the checker still
  // belongs to the original — a mismatch that degrades typeof references to any.
  type Expansion = {
    typeAlias: ReturnType<typeof sourceFile.getTypeAliases>[number]
    resolvedText: string
  }
  const expansions: Expansion[] = []

  for (const typeAlias of sourceFile.getTypeAliases()) {
    if (!typeAlias.isExported()) continue
    // Generic type aliases can't be fully resolved to a concrete type —
    // resolution depends on type arguments supplied at usage sites.
    if (typeAlias.getTypeParameters().length > 0) continue

    const typeNode = typeAlias.getTypeNodeOrThrow()

    // Path 2: when the alias doesn't reference an unexported `typeof` const but
    // does reference an @internal type alias, rewrite just those references to
    // their concrete types in place and leave the rest of the alias unchanged.
    if (!unexportedTypeofPattern || !unexportedTypeofPattern.test(typeNode.getText())) {
      if (internalTypeNames.size > 0 && !hasInternalTag(typeAlias)) {
        const expanded = expandInternalTypeRefs(
          typeNode,
          internalTypeNames,
          checker,
          typeAlias.compilerNode,
        )
        if (expanded !== null && expanded !== typeNode.getText()) {
          expansions.push({ typeAlias, resolvedText: expanded })
        }
      }
      continue
    }

    // getTypeFromTypeNode resolves the raw type node directly, bypassing
    // the alias symbol. Without this, typeToString returns the alias name
    // itself (e.g. "JobFormData") rather than the concrete expanded type.
    // Mapped types with complex type parameters can crash the checker when
    // the program context doesn't fully resolve cross-file symbols — skip
    // those gracefully; the API report surfaces any missed expansions.
    let rawType: ts.Type
    try {
      rawType = checker.getTypeFromTypeNode(typeNode.compilerNode)
    } catch (e) {
      console.warn(
        `[expand-dts-typeof] ${rel(sourceFile.getFilePath())}: ${typeAlias.getName()} — type resolution threw, skipping`,
        `\n  typeNode: ${truncate(typeNode.getText(), 200)}`,
        `\n  error: ${e instanceof Error ? e.message : String(e)}`,
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
        `\n  typeNode: ${truncate(typeNode.getText(), 200)}`,
      )
      continue
    }
    // Skip if the resolved text still references an unexported const.
    if (unexportedTypeofPattern && unexportedTypeofPattern.test(resolvedText)) {
      console.warn(
        `[expand-dts-typeof] ${rel(sourceFile.getFilePath())}: ${typeAlias.getName()} resolved type still contains unexported typeof — skipping`,
        `\n  resolved: ${truncate(resolvedText, 200)}`,
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
        `\n  resolved: ${truncate(resolvedText, 200)}`,
      )
      continue
    }

    // If the resolved type is an object type and we have property JSDoc for
    // the referenced const, build a multi-line type with the comments preserved.
    let finalResolvedText = resolvedText
    if (resolvedText.startsWith('{')) {
      const referencedConst = findSingleReferencedConst(typeNode.getText(), unexportedVarNames)
      const propJsDocs = referencedConst ? constPropJsDocs.get(referencedConst) : undefined
      if (propJsDocs) {
        const enhanced = buildTypeWithPropertyJsDocs(
          rawType,
          typeAlias.compilerNode,
          checker,
          propJsDocs,
        )
        if (enhanced) finalResolvedText = enhanced
      }
    }

    expansions.push({ typeAlias, resolvedText: finalResolvedText })
  }

  if (expansions.length === 0) return null

  for (const { typeAlias, resolvedText } of expansions) {
    typeAlias.setType(resolvedText)
    console.log(
      `[expand-dts-typeof] ${rel(sourceFile.getFilePath())}: ${typeAlias.getName()} → ${truncate(resolvedText)}`,
    )
  }

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

  return sourceFile.getFullText()
}
