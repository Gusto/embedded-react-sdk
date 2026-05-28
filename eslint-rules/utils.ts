import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'

export const FUNCTION_TAGS = ['@typeParam', '@param', '@returns', '@throws']
export const RELEASE_TAGS = ['@public', '@beta', '@alpha', '@internal']
export const TAG_ORDER = [...FUNCTION_TAGS, '@deprecated', ...RELEASE_TAGS]

interface SourceCodeLike {
  getCommentsBefore(node: TSESTree.Node): TSESTree.Comment[]
}

/**
 * Returns the nearest TSDoc block comment (/** ... *\/) immediately before `node`
 * (within 1 line), or null.
 */
export function getTSDocComment(
  sourceCode: SourceCodeLike,
  node: TSESTree.Node,
): TSESTree.BlockComment | null {
  const comments = sourceCode.getCommentsBefore(node)
  if (!comments.length) return null
  const nearest = comments[comments.length - 1]
  if (nearest.type !== AST_TOKEN_TYPES.Block || !nearest.value.startsWith('*')) return null
  if (node.loc.start.line - nearest.loc.end.line > 1) return null
  return nearest
}

/** Given a single comment line, extract a leading TSDoc tag if one exists */
export function getTagName(line: string): string | null {
  return line.replace(/^\s*\*\s?/, '').match(/^(@\S+)/)?.[1] || null
}

/** Given a full comment body, extract all leading TSDoc tags */
export function getTags(content: string): string[] {
  return content
    .split('\n')
    .map(getTagName)
    .filter(tagName => tagName !== null)
}

// ---------------------------------------------------------------------------
// Declaration tracking — shared by both require-tsdoc-* rules so they cover
// the same set of export patterns (inline exports, re-exports, default exports)
// ---------------------------------------------------------------------------

export type SupportedDeclaration =
  | TSESTree.ClassDeclaration
  | TSESTree.FunctionDeclaration
  | TSESTree.TSDeclareFunction
  | TSESTree.TSEnumDeclaration
  | TSESTree.TSInterfaceDeclaration
  | TSESTree.TSModuleDeclaration
  | TSESTree.TSTypeAliasDeclaration
  | TSESTree.VariableDeclaration

const SUPPORTED_TYPES = new Set<string>([
  AST_NODE_TYPES.ClassDeclaration,
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.TSDeclareFunction,
  AST_NODE_TYPES.TSEnumDeclaration,
  AST_NODE_TYPES.TSInterfaceDeclaration,
  AST_NODE_TYPES.TSModuleDeclaration,
  AST_NODE_TYPES.TSTypeAliasDeclaration,
  AST_NODE_TYPES.VariableDeclaration,
])

export function isSupportedDeclaration(node: TSESTree.Node): node is SupportedDeclaration {
  return SUPPORTED_TYPES.has(node.type)
}

export function getDeclarationName(node: SupportedDeclaration): string | undefined {
  switch (node.type) {
    case AST_NODE_TYPES.ClassDeclaration:
    case AST_NODE_TYPES.FunctionDeclaration:
    case AST_NODE_TYPES.TSDeclareFunction:
      return node.id?.name
    case AST_NODE_TYPES.TSEnumDeclaration:
    case AST_NODE_TYPES.TSInterfaceDeclaration:
    case AST_NODE_TYPES.TSTypeAliasDeclaration:
      return node.id.name
    case AST_NODE_TYPES.TSModuleDeclaration: {
      const { id } = node
      return id.type === AST_NODE_TYPES.Identifier ? id.name : undefined
    }
    case AST_NODE_TYPES.VariableDeclaration: {
      const first = node.declarations[0]
      if (!first) return undefined
      return first.id.type === AST_NODE_TYPES.Identifier ? first.id.name : undefined
    }
  }
}

/**
 * Creates a tracker that maps top-level declaration names to their nodes.
 * Call `onProgram` from a `Program` visitor to populate it, then use
 * `declarationsByName` in `ExportNamedDeclaration` and `ExportDefaultDeclaration`
 * visitors to resolve `export { foo }` and `export default foo` re-exports.
 */
export function createDeclarationTracker(): {
  declarationsByName: Map<string, SupportedDeclaration>
  onProgram(programNode: TSESTree.Program): void
} {
  const declarationsByName = new Map<string, SupportedDeclaration>()

  function onProgram(programNode: TSESTree.Program): void {
    declarationsByName.clear()
    for (const statement of programNode.body) {
      if (!isSupportedDeclaration(statement)) continue
      const name = getDeclarationName(statement)
      if (name !== undefined) declarationsByName.set(name, statement)
    }
  }

  return { declarationsByName, onProgram }
}

/**
 * Builds the `ExportNamedDeclaration` and `ExportDefaultDeclaration` visitors
 * shared by both require-tsdoc rules. Handles the routing between inline exports,
 * `export { foo }` re-exports, `export default identifier`, and default expressions.
 */
export function createExportVisitors(
  declarationsByName: Map<string, SupportedDeclaration>,
  handlers: {
    /** Inline `export function/class/const/…` or `export default <decl>` */
    onInlineExport(
      exportNode: TSESTree.ExportNamedDeclaration | TSESTree.ExportDefaultDeclaration,
      declaration: SupportedDeclaration,
    ): void
    /** Re-export specifier (`export { foo }`) or `export default identifier` */
    onReExportDeclaration(decl: SupportedDeclaration): void
    /** `export default () => {}` / `export default {}` — comment lives on the export node */
    onDefaultExpression(exportNode: TSESTree.ExportDefaultDeclaration): void
  },
): {
  ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void
  ExportDefaultDeclaration(node: TSESTree.ExportDefaultDeclaration): void
} {
  return {
    ExportNamedDeclaration(exportNode) {
      if (exportNode.parent?.type !== AST_NODE_TYPES.Program) return

      if (exportNode.declaration !== null && isSupportedDeclaration(exportNode.declaration)) {
        handlers.onInlineExport(exportNode, exportNode.declaration)
        return
      }

      if (exportNode.source === null) {
        for (const specifier of exportNode.specifiers) {
          const decl = declarationsByName.get(specifier.local.name)
          if (decl !== undefined) handlers.onReExportDeclaration(decl)
        }
      }
    },

    ExportDefaultDeclaration(exportNode) {
      if (exportNode.parent?.type !== AST_NODE_TYPES.Program) return
      const { declaration } = exportNode

      if (isSupportedDeclaration(declaration)) {
        handlers.onInlineExport(exportNode, declaration)
        return
      }

      if (declaration.type === AST_NODE_TYPES.Identifier) {
        const decl = declarationsByName.get(declaration.name)
        if (decl !== undefined) handlers.onReExportDeclaration(decl)
        return
      }

      handlers.onDefaultExpression(exportNode)
    },
  }
}
