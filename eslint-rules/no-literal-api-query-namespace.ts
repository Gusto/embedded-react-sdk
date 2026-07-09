/**
 * Bans hardcoded `@gusto/embedded-api-v-<YYYY-MM-DD>` namespace string literals in
 * source, steering them to the `API_QUERY_NAMESPACE` constant from
 * `@/contexts/ApiProvider/apiVersion`.
 *
 * The TanStack query namespace is the real dated package name the library bakes
 * into every query key. Hand-written `queryKey` / `invalidateQueries` literals must
 * read `API_QUERY_NAMESPACE` (which derives from `API_VERSION`) rather than
 * repeating the dated string — otherwise a version bump moves `API_VERSION` while
 * the stray literal stays behind, silently keying invalidations under the old
 * namespace. That drift is invisible to typecheck and tests, so a lint rule is the
 * only reliable guard.
 *
 * Complements `use-embedded-api-alias`, which owns *import specifiers*. This rule
 * owns the **bare** namespace literal (no subpath), which appears as a plain
 * string in query-key arrays. A bare-root import (`import x from
 * '@gusto/embedded-api-v-<date>'`, no subpath) matches the bare pattern too, so
 * the rule skips module-specifier positions (see `isModuleSpecifier`) to avoid
 * emitting an identifier where a string is required and colliding with the alias
 * rule's fix.
 *
 * @remarks
 * Covers SDK `src/` and the `sdk-app` dev app — both resolve `@/` to the SDK
 * `src` (sdk-app via its Vite alias and `tsconfig` `baseUrl: '..'`), so both can
 * import `API_QUERY_NAMESPACE`. Skips:
 * - **Test files** — the drift-prone sites are `vi.mock` factories, which vitest
 *   hoists above imports, so referencing the imported `API_QUERY_NAMESPACE` there
 *   throws "cannot access before initialization".
 *
 * Drift in test files is instead caught by the api-version-upgrade skill's
 * verification greps. The `apiVersion.ts` definition uses a template literal (not
 * a plain string), so it never matches; it is also config-excluded.
 */

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'

const BARE_NAMESPACE = /^@gusto\/embedded-api-v-\d{4}-\d{2}-\d{2}$/
const CONSTANT = 'API_QUERY_NAMESPACE'
const MODULE = '@/contexts/ApiProvider/apiVersion'
const EXCLUDED_FILE = /\.test\.[cm]?[jt]sx?$/

/**
 * True when the literal sits in a module-specifier position (import/export source
 * or dynamic `import()`). Those are owned by `use-embedded-api-alias`; rewriting
 * them to the `API_QUERY_NAMESPACE` identifier here would emit invalid syntax and
 * collide with that rule's fix. The bare namespace literal is only legitimate in
 * query-key arrays.
 */
function isModuleSpecifier(node: TSESTree.Literal): boolean {
  const { parent } = node
  return (
    (parent.type === AST_NODE_TYPES.ImportDeclaration ||
      parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
      parent.type === AST_NODE_TYPES.ExportAllDeclaration ||
      parent.type === AST_NODE_TYPES.ImportExpression) &&
    parent.source === node
  )
}

function importsConstant(program: TSESTree.Program): boolean {
  return program.body.some(
    stmt =>
      stmt.type === AST_NODE_TYPES.ImportDeclaration &&
      stmt.specifiers.some(
        spec =>
          spec.type === AST_NODE_TYPES.ImportSpecifier &&
          spec.imported.type === AST_NODE_TYPES.Identifier &&
          spec.imported.name === CONSTANT,
      ),
  )
}

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: [],
    docs: {
      description:
        'Use the API_QUERY_NAMESPACE constant instead of a hardcoded dated query-key namespace literal',
    },
    messages: {
      useConstant:
        "Use `API_QUERY_NAMESPACE` from '@/contexts/ApiProvider/apiVersion' instead of the hardcoded '{{value}}' namespace literal, so query keys track the pinned API version and don't drift on an upgrade.",
    },
  },

  create(context) {
    if (EXCLUDED_FILE.test(context.filename)) return {}

    return {
      Literal(node) {
        if (typeof node.value !== 'string' || !BARE_NAMESPACE.test(node.value)) return
        if (isModuleSpecifier(node)) return

        context.report({
          node,
          messageId: 'useConstant',
          data: { value: node.value },
          fix(fixer) {
            const fixes = [fixer.replaceText(node, CONSTANT)]
            const program = context.sourceCode.ast
            if (!importsConstant(program) && program.body.length > 0) {
              fixes.push(
                fixer.insertTextBefore(
                  program.body[0]!,
                  `import { ${CONSTANT} } from '${MODULE}'\n`,
                ),
              )
            }
            return fixes
          },
        })
      },
    }
  },
})
