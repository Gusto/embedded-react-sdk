/**
 * Requires every interface member typed as `typeof {Field}Field` to instead be
 * typed as `ComponentType<{Field}FieldProps>`. This targets the `form.Fields`
 * interface a hook exposes (canonically `{Domain}FormFields`, but the rule is
 * not name-gated so misnamed variants like `PayScheduleFields` are caught too).
 *
 * `*FormFields` is the `@public` interface partners see on `form.Fields`, and it
 * is the documentation home for each field's behavior. The `{Field}Field`
 * components themselves are `@internal` (reached only through `form.Fields`, not
 * exported from `src/index.ts`). Typing a member as `typeof {Field}Field` makes
 * the public interface reference the internal function — api-extractor then
 * flags `ae-forgotten-export`, and the reference docs point partners at a symbol
 * they can't import. `ComponentType<{Field}FieldProps>` keeps the public surface
 * self-contained: the props type is public, the component stays internal.
 *
 * `useContractorBankAccountForm` / `useContractorPaymentMethodForm` are the
 * reference examples. Report-only — the fix also needs a `ComponentType` import,
 * so it's left to the author rather than risking a half-applied autofix.
 */

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'

/** The `typeof {Field}` identifier name if `node` is such a query, else null. */
function fieldTypeQueryName(node: TSESTree.TypeNode): string | null {
  if (
    node.type === AST_NODE_TYPES.TSTypeQuery &&
    node.exprName.type === AST_NODE_TYPES.Identifier &&
    /Field$/.test(node.exprName.name)
  ) {
    return node.exprName.name
  }
  return null
}

/**
 * Finds a `typeof {Field}` reference anywhere in a member's type annotation —
 * bare (`typeof NameField`) or inside a union (`typeof NameField | undefined`,
 * used for conditionally rendered fields).
 */
function findFieldTypeQuery(node: TSESTree.TypeNode): string | null {
  const direct = fieldTypeQueryName(node)
  if (direct !== null) return direct
  if (node.type === AST_NODE_TYPES.TSUnionType) {
    for (const member of node.types) {
      const found = fieldTypeQueryName(member)
      if (found !== null) return found
    }
  }
  return null
}

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description:
        'Require `*FormFields` interface members to be typed as ComponentType<{Field}FieldProps>, not typeof {Field}Field',
    },
    messages: {
      useComponentType:
        "`{{member}}` is typed as `typeof {{field}}`, which references the @internal `{{field}}` component from the @public {{iface}} interface. Type it as `ComponentType<{{field}}Props>` (add `import type { ComponentType } from 'react'`).",
    },
  },

  create(context) {
    return {
      TSInterfaceDeclaration(node) {
        for (const member of node.body.body) {
          if (
            member.type !== AST_NODE_TYPES.TSPropertySignature ||
            member.key.type !== AST_NODE_TYPES.Identifier ||
            member.typeAnnotation === undefined
          ) {
            continue
          }

          const field = findFieldTypeQuery(member.typeAnnotation.typeAnnotation)
          if (field === null) continue

          context.report({
            node: member,
            messageId: 'useComponentType',
            data: { member: member.key.name, field, iface: node.id.name },
          })
        }
      },
    }
  },
})
