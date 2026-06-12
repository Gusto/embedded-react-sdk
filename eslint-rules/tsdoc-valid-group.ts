import { ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import { getTSDocComment } from './utils'
import { COMPONENT_GROUPS, HOOK_GROUPS } from '../docs-site/typedoc-utils.mjs'

const VALID_GROUPS = new Set([...COMPONENT_GROUPS, ...HOOK_GROUPS])

interface GroupMatch {
  value: string
  loc: TSESTree.SourceLocation
}

/** Extract @group tag values with their source locations from a TSDoc comment */
function getGroupValues(comment: TSESTree.BlockComment): GroupMatch[] {
  const results: GroupMatch[] = []
  const lines = comment.value.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const stripped = line.replace(/^\s*\*\s?/, '')
    const m = stripped.match(/^@group\s+(.+)/)
    if (m) {
      const absLine = comment.loc.start.line + i
      const valueCol = line.indexOf(m[1]!)
      const value = m[1]!.trim()
      results.push({
        value,
        loc: {
          start: { line: absLine, column: valueCol },
          end: { line: absLine, column: valueCol + value.length },
        },
      })
    }
  }
  return results
}

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    docs: {
      description: `Require @group tag values to be one of the SDK's custom groups (${[...COMPONENT_GROUPS, ...HOOK_GROUPS].join(', ')})`,
    },
    schema: [],
    messages: {
      invalidGroup: '"{{value}}" is not a valid @group. Must be one of: {{valid}}',
    },
  },

  create(context) {
    const { sourceCode } = context

    function check(node: TSESTree.Node): void {
      const comment = getTSDocComment(sourceCode, node)
      if (!comment) return

      for (const { value, loc } of getGroupValues(comment)) {
        if (!VALID_GROUPS.has(value)) {
          context.report({
            loc,
            messageId: 'invalidGroup',
            data: {
              value,
              valid: [...VALID_GROUPS].join(', '),
            },
          })
        }
      }
    }

    return {
      FunctionDeclaration: check,
      TSDeclareFunction: check,
      ClassDeclaration: check,
      TSInterfaceDeclaration: check,
      TSTypeAliasDeclaration: check,
      TSEnumDeclaration: check,
      VariableDeclaration: check,
      ExportNamedDeclaration: check,
      ExportDefaultDeclaration: check,
    }
  },
})
