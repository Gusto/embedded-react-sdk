/**
 * Requires a TSDoc comment on every exported symbol.
 *
 * Covers:
 * - export function/class/interface/type/enum/const declarations
 * - export { foo } re-exports of locally-declared symbols
 * - export default declarations and expressions
 * - function overload deduplication (comment on first signature suffices)
 *
 * Use alongside tsdoc/syntax to validate comment syntax.
 */

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import {
  getTSDocComment,
  createDeclarationTracker,
  createExportVisitors,
  getDeclarationName,
  type SupportedDeclaration,
} from './utils'

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    docs: { description: 'Require a TSDoc comment (/** ... */) on every exported symbol' },
    schema: [],
    messages: {
      missingTSDoc: 'Exported symbol is missing a TSDoc comment.',
    },
  },

  create(context) {
    const { sourceCode } = context
    const { declarationsByName, onProgram } = createDeclarationTracker()
    // Tracks names already checked to deduplicate function overloads
    const checkedNames = new Set<string>()

    function checkExport(
      declaration: SupportedDeclaration,
      exportNode: TSESTree.ExportNamedDeclaration | TSESTree.ExportDefaultDeclaration,
    ): void {
      if (declaration.type === AST_NODE_TYPES.VariableDeclaration) {
        for (const declarator of declaration.declarations) {
          if (declarator.id.type !== AST_NODE_TYPES.Identifier) continue
          if (getTSDocComment(sourceCode, exportNode) === null) {
            context.report({ node: declarator, messageId: 'missingTSDoc' })
          }
        }
        return
      }

      const name = getDeclarationName(declaration)
      if (name !== undefined && checkedNames.has(name)) return
      if (name !== undefined) checkedNames.add(name)

      if (getTSDocComment(sourceCode, exportNode) === null) {
        context.report({ node: declaration, messageId: 'missingTSDoc' })
      }
    }

    return {
      Program(programNode) {
        onProgram(programNode)
        checkedNames.clear()
      },
      ...createExportVisitors(declarationsByName, {
        onInlineExport(exportNode, declaration) {
          checkExport(declaration, exportNode)
        },
        onReExportDeclaration(decl) {
          if (getTSDocComment(sourceCode, decl) === null) {
            context.report({ node: decl, messageId: 'missingTSDoc' })
          }
        },
        onDefaultExpression(exportNode) {
          if (getTSDocComment(sourceCode, exportNode) === null) {
            context.report({ node: exportNode.declaration, messageId: 'missingTSDoc' })
          }
        },
      }),
    }
  },
})
