/**
 * Governs how a hook's ready-state type that builds on `BaseHookReady` /
 * `BaseFormHookReady` must be declared, so the doc pipeline can model it.
 *
 * The TypeDoc plugin resolves a hook's ready state by finding the union member
 * whose reflection is an `interface` (see `getHookReadyInterface` in
 * `docs-site/plugins/typedoc-custom/hook-model.ts`). A `type` alias is a
 * `TypeAlias` reflection, not an `Interface`, so a ready state written as a bare
 * alias is invisible to the model and the hook page fails to generate.
 *
 * Two valid shapes, mirroring the two ways the alias is written:
 *  - **Intersection that adds members** (`BaseHookReady<…> & { extra: T }`):
 *    declare it as `interface X extends BaseHookReady<…> { extra: T }`. The
 *    interface both satisfies the model and renders its own members.
 *  - **Pure reference** (`BaseHookReady<…>` with nothing added): an empty
 *    `interface X extends BaseHookReady<…> {}` trips `no-empty-object-type`, so
 *    keep the alias and add the `@interface` TSDoc modifier — TypeDoc then
 *    resolves it through the checker and renders it as a property table.
 *    Auto-fixable.
 */

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import { getTagName, getTSDocComment } from './utils'

const BASE_READY_TYPES = new Set(['BaseHookReady', 'BaseFormHookReady'])

/** The referenced base name when `node` is a `BaseHookReady`/`BaseFormHookReady` reference, else null. */
function baseReadyName(node: TSESTree.TypeNode): string | null {
  if (
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    BASE_READY_TYPES.has(node.typeName.name)
  ) {
    return node.typeName.name
  }
  return null
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
        'Require a hook ready-state type built on BaseHookReady/BaseFormHookReady to be an interface (intersection) or carry @interface (pure alias) so it is documentable',
    },
    schema: [],
    messages: {
      shouldBeInterface:
        '`{{name}}` intersects `{{base}}` with additional members. Declare it as `interface {{name}} extends {{base}}<…>` so the docs model resolves its ready state and renders its members.',
      missingInterface:
        '`{{name}}` is a pure `{{base}}` alias and must carry the `@interface` TSDoc modifier so the docs model resolves its ready state and renders it as a property table.',
    },
  },

  create(context) {
    const { sourceCode } = context

    return {
      TSTypeAliasDeclaration(node) {
        const body = node.typeAnnotation

        // Intersection adding members onto a hook-ready base → must be an interface.
        if (body.type === AST_NODE_TYPES.TSIntersectionType) {
          const base = body.types.map(baseReadyName).find(name => name !== null)
          if (base === undefined) return
          context.report({
            node: node.id,
            messageId: 'shouldBeInterface',
            data: { name: node.id.name, base },
          })
          return
        }

        // Pure `BaseHookReady<…>` alias → must carry @interface.
        const base = baseReadyName(body)
        if (base === null) return

        // The TSDoc comment sits before the `export` wrapper when present.
        const commented =
          node.parent?.type === AST_NODE_TYPES.ExportNamedDeclaration ? node.parent : node
        const comment = getTSDocComment(sourceCode, commented)
        // A missing comment is the require-comment rule's concern, not ours.
        if (comment === null || hasInterfaceTag(comment)) return

        context.report({
          node: node.id,
          messageId: 'missingInterface',
          data: { name: node.id.name, base },
          fix: fixer => fixer.replaceText(comment, withInterfaceTag(comment)),
        })
      },
    }
  },
})
