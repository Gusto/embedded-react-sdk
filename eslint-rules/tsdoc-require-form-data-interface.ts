/**
 * Requires every `*FormData` object type alias derived from a Zod schema
 * (its body references `z.infer`) to carry the `@interface` TSDoc modifier.
 *
 * These aliases are computed shapes — typically
 * `{ [K in keyof typeof fieldValidators]: z.infer<…> }` — so without
 * `@interface` TypeDoc renders them as an opaque mapped-type expression instead
 * of a property table. The tag makes TypeDoc resolve the shape via the checker
 * and render it as a proper interface, matching what the published `.d.ts`
 * already expands these to. Enforced here so it can't be forgotten on a new
 * form hook; auto-fixable.
 *
 * Only fires on `type` aliases — hand-authored `interface` FormData types
 * already render correctly and need no tag.
 */

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import { getTagName, getTSDocComment } from './utils'

/** Whether a type-alias body is an object shape (literal or mapped). */
function isObjectShape(typeNode: TSESTree.TypeNode): boolean {
  return (
    typeNode.type === AST_NODE_TYPES.TSTypeLiteral || typeNode.type === AST_NODE_TYPES.TSMappedType
  )
}

/** Whether a TSDoc block comment already carries the `@interface` modifier. */
function hasInterfaceTag(comment: TSESTree.BlockComment): boolean {
  return comment.value.split('\n').some(line => getTagName(line) === '@interface')
}

/**
 * Insert an `@interface` modifier line into a block comment, immediately before
 * its closing delimiter and matching the comment's own indentation. Returns the
 * full `/* … *\/` replacement text.
 */
function withInterfaceTag(comment: TSESTree.BlockComment): string {
  const lines = comment.value.split('\n')
  // Match a content line's indentation (whitespace before `*`), not the opening
  // `*` of the `/**` delimiter, which sits flush at column 0.
  const indented = lines.find(line => /^\s+\*/.test(line))
  const prefix = `${indented?.match(/^(\s+)\*/)?.[1] ?? ' '}*`
  lines.splice(lines.length - 1, 0, `${prefix} @interface`)
  return `/*${lines.join('\n')}*/`
}

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        'Require Zod-derived `*FormData` object type aliases to carry the @interface TSDoc modifier',
    },
    schema: [],
    messages: {
      missingInterface:
        '`{{name}}` is a Zod-derived FormData object alias and must carry the `@interface` TSDoc modifier so it renders as a property table.',
    },
  },

  create(context) {
    const { sourceCode } = context

    return {
      TSTypeAliasDeclaration(node) {
        if (!/FormData$/.test(node.id.name)) return
        if (!isObjectShape(node.typeAnnotation)) return
        if (!/\bz\.infer\b/.test(sourceCode.getText(node.typeAnnotation))) return

        // The TSDoc comment sits before the `export` wrapper when present.
        const commented =
          node.parent?.type === AST_NODE_TYPES.ExportNamedDeclaration ? node.parent : node
        const comment = getTSDocComment(sourceCode, commented)
        // A missing comment is the require-comment rule's concern, not ours.
        if (comment === null || hasInterfaceTag(comment)) return

        context.report({
          node: node.id,
          messageId: 'missingInterface',
          data: { name: node.id.name },
          fix: fixer => fixer.replaceText(comment, withInterfaceTag(comment)),
        })
      },
    }
  },
})
