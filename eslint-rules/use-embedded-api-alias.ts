/**
 * Steers every import of the Gusto Embedded API package to the version-agnostic
 * `@gusto/embedded-api` alias (declared in package.json as
 * `npm:@gusto/embedded-api-v-<date>`) instead of the dated package specifier.
 *
 * With every source file importing through the alias, bumping the pinned API
 * version stays a two-line change — repoint the alias target in package.json and
 * update `API_VERSION` — rather than a rewrite across hundreds of import paths.
 *
 * The rule is version-agnostic on purpose: it matches any
 * `@gusto/embedded-api-v-YYYY-MM-DD` specifier, so it keeps auto-fixing forward
 * through future version bumps. It rewrites static import/export sources, dynamic
 * `import()`, and `vi.mock`-style call sites. It never touches bare namespace
 * strings without a package specifier position (e.g. TanStack query-key arrays),
 * which key off the dated string deliberately.
 */

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'

const ALIAS = '@gusto/embedded-api'
const DATED_SPECIFIER = /^@gusto\/embedded-api-v-\d{4}-\d{2}-\d{2}(\/.*)?$/

/** Module-mocking helpers whose first argument is a module specifier string. */
const MODULE_SPECIFIER_CALLEES = new Set(['mock', 'doMock', 'importActual', 'importMock'])

function aliasedSpecifier(value: string): string | null {
  const match = DATED_SPECIFIER.exec(value)
  if (!match) return null
  return `${ALIAS}${match[1] ?? ''}`
}

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: [],
    docs: {
      description:
        'Import the Gusto Embedded API through the version-agnostic `@gusto/embedded-api` alias rather than the dated package specifier',
    },
    messages: {
      useAlias:
        "Import from the version-agnostic '@gusto/embedded-api' alias instead of the dated '{{dated}}' specifier, so an API version bump stays a two-line change.",
    },
  },

  create(context) {
    function checkSource(source: TSESTree.Node | null | undefined) {
      if (source?.type !== AST_NODE_TYPES.Literal || typeof source.value !== 'string') return

      const aliased = aliasedSpecifier(source.value)
      if (!aliased) return

      const quote = source.raw[0]
      context.report({
        node: source,
        messageId: 'useAlias',
        data: { dated: source.value },
        fix: fixer => fixer.replaceText(source, `${quote}${aliased}${quote}`),
      })
    }

    return {
      ImportDeclaration: node => checkSource(node.source),
      ExportNamedDeclaration: node => checkSource(node.source),
      ExportAllDeclaration: node => checkSource(node.source),
      ImportExpression: node => checkSource(node.source),
      CallExpression(node) {
        const { callee } = node
        const firstArg = node.arguments[0]

        const isViHelper =
          callee.type === AST_NODE_TYPES.MemberExpression &&
          callee.object.type === AST_NODE_TYPES.Identifier &&
          callee.object.name === 'vi' &&
          callee.property.type === AST_NODE_TYPES.Identifier &&
          MODULE_SPECIFIER_CALLEES.has(callee.property.name)

        const isRequire = callee.type === AST_NODE_TYPES.Identifier && callee.name === 'require'

        if (isViHelper || isRequire) checkSource(firstArg)
      },
    }
  },
})
