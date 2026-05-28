/**
 * Enforces a canonical group structure in TSDoc block comments, with groups
 * separated by exactly one blank line.
 *
 * Groups (in order):
 *   1. Description / summary prose
 *   2. @remarks
 *   3. All other tags (params, returns, throws, deprecated, release tags, etc.)
 *      sorted by TAG_ORDER; tags not in the list sort to the end (stable)
 *   4. @example — each one is its own group
 *
 * Blank lines within a group's content are preserved; blank lines between
 * tags in the same group are removed.
 */

import { ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import { getTagName, getTSDocComment, TAG_ORDER } from './utils'

function tagRank(name: string | null): number {
  if (name === null) return TAG_ORDER.length
  const idx = TAG_ORDER.indexOf(name)
  return idx === -1 ? TAG_ORDER.length : idx
}

function isBlankCommentLine(line: string): boolean {
  return /^\s*\*?\s*$/.test(line)
}

function stripTrailingBlanks(lines: string[]): string[] {
  let end = lines.length
  while (end > 0 && isBlankCommentLine(lines[end - 1]!)) end--
  return lines.slice(0, end)
}

function firstTagName(lines: string[]): string | null {
  for (const line of lines) {
    const tagName = getTagName(line)
    if (tagName) {
      return tagName
    }
  }
  return null
}

/** Derives the blank-line string that matches the comment's own indentation. */
function blankLineFor(contentLines: string[]): string {
  for (const line of contentLines) {
    const m = line.match(/^(\s+)\*/)
    if (m?.[1]) return `${m[1]}*`
  }
  return ' *'
}

/**
 * Splits the comment value into:
 *   - openingLine: the first line ("*" from the "/**" delimiter)
 *   - closingLine: the last line (whitespace before "* /")
 *   - chunks[0]: description lines (may be empty)
 *   - chunks[1..n]: one array per @tag block
 */
function parseComment(value: string): {
  openingLine: string
  closingLine: string
  contentLines: string[]
  chunks: string[][]
} {
  const lines = value.split('\n')
  const openingLine = lines[0]!
  const closingLine = lines[lines.length - 1]!
  const contentLines = lines.slice(1, -1)

  const chunks: string[][] = [[]]
  let current = chunks[0]!

  for (const line of contentLines) {
    const stripped = line.replace(/^\s*\*\s?/, '')
    if (/^@\S/.test(stripped)) {
      current = [line]
      chunks.push(current)
    } else {
      current.push(line)
    }
  }

  return { openingLine, closingLine, contentLines, chunks }
}

/** Groups tag chunks into [description, remarks, others, ...examples]. */
function buildGroups(chunks: string[][]): string[][] {
  const [description, ...tagChunks] = chunks

  const remarksChunks: string[][] = []
  const otherChunks: string[][] = []
  const exampleChunks: string[][] = []

  for (const chunk of tagChunks) {
    const tag = firstTagName(chunk)
    if (tag === '@remarks') remarksChunks.push(chunk)
    else if (tag === '@example') exampleChunks.push(chunk)
    else otherChunks.push(chunk)
  }

  return [
    stripTrailingBlanks(description ?? []),
    remarksChunks.flatMap(c => stripTrailingBlanks(c)),
    [...otherChunks]
      .sort((a, b) => tagRank(firstTagName(a)) - tagRank(firstTagName(b)))
      .flatMap(c => stripTrailingBlanks(c)),
    ...exampleChunks.map(c => stripTrailingBlanks(c)),
  ]
}

function buildComment(
  openingLine: string,
  groups: string[][],
  closingLine: string,
  blankLine: string,
): string {
  const nonEmpty = groups.filter(g => g.length > 0)
  const contentLines = nonEmpty.flatMap((g, i) => (i < nonEmpty.length - 1 ? [...g, blankLine] : g))
  return [openingLine, ...contentLines, closingLine].join('\n')
}

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Enforce TSDoc comment tag groups (description, @remarks, other tags, @example) separated by blank lines',
    },
    schema: [],
    messages: {
      incorrectGrouping:
        'TSDoc tags are not correctly grouped. Expected: description, @remarks, other tags, then each @example as its own group, each separated by a blank line.',
    },
  },

  create(context) {
    const { sourceCode } = context

    function checkComment(comment: TSESTree.BlockComment, reportNode: TSESTree.Node): void {
      const { openingLine, closingLine, contentLines, chunks } = parseComment(comment.value)
      if (chunks.length <= 1) return

      const blankLine = blankLineFor(contentLines)
      const groups = buildGroups(chunks)
      const expected = buildComment(openingLine, groups, closingLine, blankLine)

      if (expected === comment.value) return

      context.report({
        node: reportNode,
        messageId: 'incorrectGrouping',
        fix: fixer => fixer.replaceText(comment, `/*${expected}*/`),
      })
    }

    function check(node: TSESTree.Node): void {
      const comment = getTSDocComment(sourceCode, node)
      if (comment !== null) checkComment(comment, node)
    }

    return {
      FunctionDeclaration: check,
      ClassDeclaration: check,
      TSInterfaceDeclaration: check,
      TSTypeAliasDeclaration: check,
      TSEnumDeclaration: check,
      VariableDeclaration: check,
      ExportDefaultDeclaration: check,
      ExportNamedDeclaration: check,
    }
  },
})
