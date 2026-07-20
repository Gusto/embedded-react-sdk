/**
 * Bans re-exporting a hook's `@internal` building blocks from the public package
 * entry (`src/index.ts`). Three families leak today and each trips
 * api-extractor's `ae-internal-missing-underscore` (or would, once tagged
 * `@internal`) because an `@internal` symbol is reachable from the public entry:
 *
 *  - **`{Domain}FormOutputs`** — the resolver-output type seam (`useForm`'s third
 *    generic). Partners type `defaultValues` against `{Domain}FormData` and read
 *    parsed values from `form.getFormSubmissionValues`; the input/output seam
 *    stays ours.
 *  - **`create{Domain}Schema`** — the schema factory. Partners build forms through
 *    the hook, not the raw factory; `{Domain}FormData` is the type they need.
 *  - **`{Field}Field` components** — reached only via `form.Fields`. Only their
 *    `{Field}FieldProps` types are public.
 *
 * The field-component ban keys on the export being a **value** export
 * (`export { NameField }`), which distinguishes the component from the identically
 * suffixed field-name union **type** (`export type { BankFormField }`), which is
 * public and stays. Scope the rule to `src/index.ts` in the eslint config.
 */

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'

/** Effective export kind of a specifier, honoring both the block and inline `type` modifier. */
function specifierKind(
  specifier: TSESTree.ExportSpecifier,
  declaration: TSESTree.ExportNamedDeclaration,
): 'type' | 'value' {
  return specifier.exportKind === 'type' || declaration.exportKind === 'type' ? 'type' : 'value'
}

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description:
        'Ban re-exporting @internal hook building blocks (FormOutputs types, schema factories, field components) from the public package entry',
    },
    messages: {
      formOutputs:
        '`{{name}}` is the @internal resolver-output seam. Do not re-export it from src/index.ts — partners use `{Domain}FormData` and `form.getFormSubmissionValues`.',
      schemaFactory:
        '`{{name}}` is the @internal schema factory. Do not re-export it from src/index.ts — partners build forms through the hook, not the raw factory.',
      fieldComponent:
        '`{{name}}` is an @internal field component reached via `form.Fields`. Do not re-export it from src/index.ts — export only its `{{name}}Props` type.',
    },
  },

  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (node.parent?.type !== AST_NODE_TYPES.Program) return

        for (const specifier of node.specifiers) {
          const name =
            specifier.exported.type === AST_NODE_TYPES.Identifier
              ? specifier.exported.name
              : specifier.exported.value
          const kind = specifierKind(specifier, node)

          if (/FormOutputs$/.test(name)) {
            context.report({ node: specifier, messageId: 'formOutputs', data: { name } })
          } else if (/^create[A-Z]\w*Schema$/.test(name)) {
            context.report({ node: specifier, messageId: 'schemaFactory', data: { name } })
          } else if (kind === 'value' && /Field$/.test(name)) {
            context.report({ node: specifier, messageId: 'fieldComponent', data: { name } })
          }
        }
      },
    }
  },
})
