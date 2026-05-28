/**
 * Requires a release-visibility tag in every TSDoc comment on an exported symbol. Fires only when a
 * TSDoc comment is already present.
 *
 * Valid tags: `@public`, `@beta`, `@alpha`, `@internal`
 */

import { ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import {
  getTSDocComment,
  RELEASE_TAGS,
  createDeclarationTracker,
  createExportVisitors,
  getTags,
} from './utils'

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require a release tag (@public, @beta, @alpha, @internal) in TSDoc comments on exported symbols',
    },
    schema: [],
    messages: {
      missingReleaseTag:
        'TSDoc comment is missing a release tag. Add one of: @public, @beta, @alpha, @internal',
    },
  },

  create(context) {
    const { sourceCode } = context
    const { declarationsByName, onProgram } = createDeclarationTracker()

    function check(node: TSESTree.Node): void {
      const comment = getTSDocComment(sourceCode, node)
      if (comment === null) return
      const tags = getTags(comment.value)
      if (!RELEASE_TAGS.some(tag => tags.includes(tag))) {
        context.report({ node, messageId: 'missingReleaseTag' })
      }
    }

    return {
      Program: onProgram,
      ...createExportVisitors(declarationsByName, {
        onInlineExport: check,
        onReExportDeclaration: check,
        onDefaultExpression: check,
      }),
    }
  },
})
