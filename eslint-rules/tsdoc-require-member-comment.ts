/**
 * Requires a TSDoc comment on every member of an exported interface or
 * object-literal type alias, unless the type is tagged @internal.
 */

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import {
  getTSDocComment,
  getTags,
  createDeclarationTracker,
  createExportVisitors,
  type SupportedDeclaration,
} from './utils'

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require a TSDoc comment on every member of a public, exported interface',
    },
    schema: [],
    messages: {
      missingMemberTSDoc: '@public type member is missing a TSDoc comment.',
    },
  },

  create(context) {
    const { sourceCode } = context
    const { declarationsByName, onProgram } = createDeclarationTracker()

    function checkMembers(commentNode: TSESTree.Node, declaration: SupportedDeclaration): void {
      let members: TSESTree.TypeElement[]

      if (declaration.type === AST_NODE_TYPES.TSInterfaceDeclaration) {
        members = declaration.body.body
      } else if (
        declaration.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
        declaration.typeAnnotation.type === AST_NODE_TYPES.TSTypeLiteral
      ) {
        members = declaration.typeAnnotation.members
      } else {
        return
      }

      const comment = getTSDocComment(sourceCode, commentNode)
      if (comment !== null && getTags(comment.value).includes('@internal')) return

      for (const member of members) {
        if (
          member.type !== AST_NODE_TYPES.TSPropertySignature &&
          member.type !== AST_NODE_TYPES.TSMethodSignature
        )
          continue

        if (getTSDocComment(sourceCode, member) === null) {
          context.report({ node: member, messageId: 'missingMemberTSDoc' })
        }
      }
    }

    return {
      Program: onProgram,
      ...createExportVisitors(declarationsByName, {
        onInlineExport(exportNode, declaration) {
          checkMembers(exportNode, declaration)
        },
        onReExportDeclaration(decl) {
          checkMembers(decl, decl)
        },
        onDefaultExpression() {
          // default expressions are never interfaces
        },
      }),
    }
  },
})
