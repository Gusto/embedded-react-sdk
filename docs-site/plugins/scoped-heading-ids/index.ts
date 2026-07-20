import type { Plugin } from 'unified'
import type { Root, Heading, Parent, Node } from 'mdast'

/**
 * Remark plugin (beforeDefaultRemarkPlugins) that:
 *
 * 1. Scopes generated sub-heading anchors by their nearest ancestor member.
 *    TypeDoc emits repeated section headings (Remarks, Example, Events, Endpoints,
 *    Properties, Returns, …) under every documented symbol. Docusaurus's text-slugger
 *    deduplicates these as #remarks-1, #remarks-2, which are meaningless. This plugin
 *    sets heading.data.hProperties.id = "${memberId}-${slug}" so Docusaurus uses the
 *    pre-computed id instead of the deduped text slug.
 *
 * 2. Strips emoji (and other non-ASCII punctuation) from any heading whose anchor
 *    would otherwise contain them. E.g. "🪝 Hooks" → #hooks, "🧩 Blocks" → #blocks.
 *
 * A "member heading" is one that has an adjacent <a id="…"></a> anchor (prev sibling
 * for most TypeDoc members, next sibling for inline-props interfaces where the anchor
 * follows the heading). Member headings are left alone — Docusaurus slugs their text
 * to the same value TypeDoc wrote in the <a id>. They're also pushed onto an ancestor
 * stack so subsequent shallower/same-depth headings can reference them.
 *
 * Headings with a baked {#id} comment are skipped entirely — Docusaurus handles them.
 */
const scopedHeadingIds: Plugin<[], Root> = () => {
  return tree => {
    processLevel(tree)
  }
}

export default scopedHeadingIds

type StackEntry = { depth: number; id: string }
type AnyNode = Node & Record<string, unknown>

function processLevel(parent: Parent): void {
  const children = parent.children as AnyNode[]
  const stack: StackEntry[] = []

  for (let i = 0; i < children.length; i++) {
    const node = children[i]!
    if (node.type !== 'heading') continue

    const heading = node as unknown as Heading
    const depth = heading.depth

    // Pop stack entries shallower or same depth — a new heading at this level
    // ends the scope of all prior entries at >= this depth.
    while (stack.length > 0 && stack[stack.length - 1]!.depth >= depth) {
      stack.pop()
    }

    // Headings with a baked {#id} comment: Docusaurus extractCommentId() handles them.
    if (hasBakedId(heading)) continue

    const headingText = extractHeadingText(heading)
    const headingSlug = cleanSlug(headingText)

    // Detect member heading: adjacent <a id> whose id matches the heading's clean slug.
    // Prev sibling covers H2 members (TypeDoc puts anchor before the heading).
    // Next sibling covers H1 and inline-props H3 members (anchor follows the heading).
    const prevId = getAnchorId(children[i - 1])
    const nextId = getAnchorId(children[i + 1])

    const isMember = prevId !== null || (nextId !== null && nextId === headingSlug)

    if (isMember) {
      // Use the actual <a id> value (not our re-slug) as the stack id, so cross-links
      // that target the <a id> remain valid. Don't touch hProperties.id here.
      const memberId = prevId ?? nextId!
      stack.push({ depth, id: memberId })
      continue
    }

    // Generated/section heading — scope or clean.
    const ancestor = stack[stack.length - 1]

    if (ancestor) {
      setHeadingId(heading, `${ancestor.id}-${headingSlug}`)
    } else if (hasEmojiOrSpecial(headingText)) {
      // No ancestor, but emoji in text would produce a garbled Docusaurus slug.
      setHeadingId(heading, headingSlug)
    }
    // Plain heading with no ancestor: leave it for Docusaurus's text slugger.
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanSlug(text: string): string {
  return (
    text
      // Strip emoji (Emoji_Presentation covers standalone emoji; Extended_Pictographic
      // covers the full set including modifiers and sequences).
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
      .toLowerCase()
      // Remove everything that isn't a word char, space, or hyphen.
      .replace(/[^\w\s-]/g, '')
      // Collapse whitespace / underscores to hyphens.
      .replace(/[\s_]+/g, '-')
      // Collapse runs of hyphens left behind by stripped characters.
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
  )
}

function hasEmojiOrSpecial(text: string): boolean {
  return /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(text)
}

function hasBakedId(heading: Heading): boolean {
  return heading.children.some(
    child => child.type === 'text' && /\{#[^}]+\}/.test((child as { value: string }).value),
  )
}

function extractHeadingText(heading: Heading): string {
  const parts: string[] = []
  for (const child of heading.children) {
    if (child.type === 'text') {
      // Strip any trailing {#id} baked-id comment before slugifying.
      parts.push((child as { value: string }).value.replace(/\s*\{#[^}]+\}\s*$/, ''))
    } else if (child.type === 'inlineCode') {
      parts.push((child as { value: string }).value)
    }
  }
  return parts.join('').trim()
}

function getAnchorId(node: AnyNode | undefined): string | null {
  if (!node) return null

  // Generated .md files: <a id="foo"></a> is a paragraph whose first inline
  // child is an html node containing the opening tag (the closing </a> is a
  // separate sibling html node within the same paragraph).
  if (node.type === 'paragraph') {
    const children = (node.children as AnyNode[] | undefined) ?? []
    const first = children[0]
    if (first?.type === 'html') {
      const m = String(first.value).match(/^<a\s+id="([^"]+)">?$/)
      return m ? m[1]! : null
    }
  }

  // Top-level HTML block (unlikely in practice but handle for completeness).
  if (node.type === 'html') {
    const m = String(node.value).match(/<a\s+id="([^"]+)"/)
    return m ? m[1]! : null
  }

  // MDX JSX (.mdx files with format: 'detect'):  <a id="foo"></a>
  if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
    if (node.name !== 'a') return null
    const attrs = node.attributes as Array<{ type: string; name: string; value: unknown }>
    const idAttr = attrs?.find(a => a.type === 'mdxJsxAttribute' && a.name === 'id')
    return idAttr ? String(idAttr.value) : null
  }

  return null
}

function setHeadingId(heading: Heading, id: string): void {
  if (!heading.data) heading.data = {}
  if (!heading.data.hProperties) heading.data.hProperties = {}
  ;(heading.data.hProperties as Record<string, unknown>).id = id
}
