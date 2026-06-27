import { existsSync, readFileSync } from 'fs'
import { basename, dirname, join, relative } from 'path'
import { stringify as stringifyYaml } from 'yaml'
import {
  Comment,
  DeclarationReflection,
  ProjectReflection,
  ReferenceReflection,
  ReferenceType,
  type Reflection,
  ReflectionKind,
  type RouterTarget,
} from 'typedoc'
import { MarkdownPageEvent } from 'typedoc-plugin-markdown'
import { DOMAINS, STANDALONE_PAGES } from './router.config.ts'

/** Derived from DOMAINS — do not edit directly.
 *  Maps each namespace id to its output directory prefix. */
export const NAMESPACE_PATHS: Record<string, string> = Object.fromEntries(
  DOMAINS.flatMap(({ path: domainPath, namespaces }) =>
    namespaces.map(ns => [ns.id, ns.subpath ? `${domainPath}/${ns.subpath}` : domainPath]),
  ),
)

/**
 * Derive a domain name from the source file path of a reflection.
 * Expects paths like  src/components/{Domain}/...
 */
export function domainFromSources(reflection: Reflection): string | null {
  const source = (reflection as DeclarationReflection).sources?.[0]
  if (!source) return null
  const fp = source.fullFileName ?? source.fileName ?? ''
  const m = fp.match(/[/\\]src[/\\]components[/\\]([^/\\]+)[/\\]/)
  return m?.[1] ?? null
}

/**
 * Return the hook name derived from the reflection's source path — the first
 * path segment (after stripping its extension) that matches useCamelCase.
 * Returns null when no such segment exists.
 *
 * Examples:
 *   useCompensationForm/compensationSchema.ts → "useCompensationForm"
 *   useEmployeeStateTaxesForm/fields.tsx      → "useEmployeeStateTaxesForm"
 *   useJobForm.ts (flat file)                 → "useJobForm"
 */
export function hookDirFromSources(reflection: Reflection): string | null {
  const source = (reflection as DeclarationReflection).sources?.[0]
  if (!source) return null
  const fp = source.fullFileName ?? source.fileName ?? ''
  const seg = fp.split(/[/\\]/).find(s => /^use[A-Z]/.test(s.replace(/\.[^.]+$/, '')))
  return seg ? seg.replace(/\.[^.]+$/, '') : null
}

/**
 * Return true if the reflection's source file is, or lives inside, a hook
 * directory/file — i.e. any path segment (after stripping its extension)
 * matches useCamelCase. This co-locates companion types from files like
 * `useEmployeeStateTaxesForm/fields.tsx` onto the same domain hooks page as
 * the hook itself.
 */
export function isHookSourceFile(reflection: Reflection): boolean {
  return hookDirFromSources(reflection) !== null
}

/**
 * Return the standalone page key for a project-level reflection, based on its
 * source file path matching a key in STANDALONE_PAGES. Returns null when no
 * key matches.
 */
export function standalonePageFromSources(reflection: Reflection): string | null {
  const source = (reflection as DeclarationReflection).sources?.[0]
  if (!source) return null
  const fp = source.fullFileName ?? source.fileName ?? ''
  for (const { id, sources, groups } of STANDALONE_PAGES) {
    if (!sources.some(pattern => fp.includes(pattern))) continue
    if (groups) {
      const inGroup = (reflection as DeclarationReflection).comment?.blockTags.some(
        t => t.tag === '@group' && groups.includes(Comment.combineDisplayParts(t.content).trim()),
      )
      if (!inGroup) continue
    }
    return id
  }
  return null
}

/** Convert a domain output path to its TypeDoc source directory name.
 *  'employee' → 'Employee',  'time-off' → 'TimeOff' */
export function pathToSourceDir(domainPath: string): string {
  return domainPath
    .split('-')
    .map(s => s[0]!.toUpperCase() + s.slice(1))
    .join('')
}

/**
 * Author-only guide content lives in a GUIDE.md alongside a component (or in a
 * domain's source dir). Each `##` section carries a `<!-- slot: name -->` tag
 * naming its purpose; the theme decides where each slot lands in the generated
 * page. These are the recognized slots — extend deliberately.
 */
export const GUIDE_SLOTS = ['overview', 'appendix', 'advanced'] as const
export type GuideSlot = (typeof GUIDE_SLOTS)[number]
export type GuideSlots = Partial<Record<GuideSlot, string>>

/** A parsed GUIDE.md: its tagged slots plus the repo-relative source path, so
 *  the renderer can fence injected content with a provenance comment. */
export interface Guide {
  source: string
  slots: GuideSlots
}

const SLOT_TAG = /<!--\s*slot:\s*([\w-]+)\s*-->/

/**
 * Read guide prose from src/components/<Domain>/GUIDE.md if it exists. TypeDoc
 * is run from docs-site/, so src/ is one level up via process.cwd().
 */
export function readDomainGuide(domainPath: string): Guide | null {
  const sourceDir = pathToSourceDir(domainPath)
  return readGuideFile(join(process.cwd(), '../src/components', sourceDir, 'GUIDE.md'))
}

/**
 * Read guide prose from GUIDE.md in the same directory as a flow component's
 * source file. Returns null if no GUIDE exists there.
 */
export function readFlowGuide(sourceFilePath: string): Guide | null {
  return readGuideFile(join(dirname(sourceFilePath), 'GUIDE.md'))
}

/**
 * Read guide prose from GUIDE.md at the root of a hook directory. The source
 * file may be nested (e.g. `useEmployeeStateTaxesForm/fields.tsx`), so resolve
 * up to the `hookDir` path segment rather than using the file's own directory.
 * Returns null for flat-file hooks (no dedicated dir segment) or when absent.
 */
export function readHookGuide(sourceFilePath: string, hookDir: string): Guide | null {
  let dir = dirname(sourceFilePath)
  while (dir !== dirname(dir)) {
    // Hook guides use a single `advanced` slot: all prose nests under one
    // section, so the whole file is collected regardless of any slot tags.
    if (basename(dir) === hookDir) return readGuideFile(join(dir, 'GUIDE.md'), 'advanced')
    dir = dirname(dir)
  }
  return null
}

/**
 * Parse a GUIDE.md into its tagged slots. Everything up to and including the
 * first h1 is dropped (the file carries a standalone title + maintainer comment
 * that must not reach the page). Each subsequent `##` section is bucketed by its
 * `<!-- slot: name -->` tag, with the tag stripped from the rendered heading.
 * Untagged or unknown-slot sections are routed to `appendix` with a warning so
 * content is never silently lost. Returns null if the file is missing or empty.
 *
 * When `forcedSlot` is given, slot tags are ignored: the entire body (minus the
 * h1) is collected into that one slot, with any `<!-- slot: … -->` tags stripped
 * from headings. Used by hook guides, which carry a single `advanced` slot.
 */
function readGuideFile(guidePath: string, forcedSlot?: GuideSlot): Guide | null {
  if (!existsSync(guidePath)) return null
  const lines = readFileSync(guidePath, 'utf-8').split('\n')
  const h1Index = lines.findIndex(l => /^#\s/.test(l))
  const body = h1Index === -1 ? lines : lines.slice(h1Index + 1)

  if (forcedSlot) {
    const text = body
      .map(l => l.replace(SLOT_TAG, '').trimEnd())
      .join('\n')
      .trim()
    if (!text) return null
    return { source: relative(join(process.cwd(), '..'), guidePath), slots: { [forcedSlot]: text } }
  }

  const slots: GuideSlots = {}
  let current: GuideSlot | null = null
  let buffer: string[] = []

  const flush = () => {
    if (!current) return
    const text = buffer.join('\n').trim()
    if (text) slots[current] = slots[current] ? `${slots[current]}\n\n${text}` : text
  }

  for (const line of body) {
    if (!/^##\s/.test(line)) {
      buffer.push(line)
      continue
    }
    flush()
    buffer = []
    const slot = line.match(SLOT_TAG)?.[1]
    const heading = line.replace(SLOT_TAG, '').trimEnd()
    if (slot && (GUIDE_SLOTS as readonly string[]).includes(slot)) {
      current = slot as GuideSlot
    } else {
      const title = heading.replace(/^#+\s*/, '')
      const reason = slot ? `unknown slot "${slot}"` : 'no slot tag'
      console.warn(
        `[typedoc-custom] ${guidePath}: section "${title}" has ${reason}; using appendix`,
      )
      current = 'appendix'
    }
    buffer.push(heading)
  }
  flush()

  if (Object.keys(slots).length === 0) return null
  return { source: relative(join(process.cwd(), '..'), guidePath), slots }
}

export function isNamespaceIndex(model: DeclarationReflection): boolean {
  return model.comment?.blockTags.some(tag => tag.tag === '@namespaceIndex') ?? false
}

export function isHooksIndex(model: DeclarationReflection | RouterTarget): boolean {
  if ('comment' in model) {
    return model.comment?.blockTags.some(tag => tag.tag === '@hooksIndex') ?? false
  }

  return false
}

export function getDomainPath(model: DeclarationReflection): string {
  const tag = model.comment?.blockTags.find(t => t.tag === '@domainPath')
  return tag ? Comment.combineDisplayParts(tag.content) : ''
}

/** sidebar_position for a generated page, derived from its URL. */
export function getSidebarPosition(url: string): number | undefined {
  if (url === 'index.md') return 1
  const key = url.replace(/\.md$/, '')
  const standaloneIdx = STANDALONE_PAGES.findIndex(p => p.id === key)
  if (standaloneIdx !== -1) return DOMAINS.length + standaloneIdx + 1
  const parts = key.split('/')
  const filename = parts[parts.length - 1]!
  if (filename === 'index' || filename === 'namespace') return 1
  // Flows share position 2 so they sort alphabetically among themselves (lodash breaks
  // ties with 'source'/filename). blocks gets a high position so it always
  // lands after all flow pages regardless of their names.
  if (filename.endsWith('-flow')) return 2
  if (filename === 'blocks') return 99
  return undefined
}

/**
 * Move DeclarationReflections from deprecated namespaces to non-deprecated ones
 * when the non-deprecated namespace holds a ReferenceReflection pointing at the
 * same canonical declaration.
 *
 * Background: TypeDoc places the canonical DeclarationReflection under whichever
 * namespace it processes first. Since deprecated namespaces (e.g. Employee) are
 * listed before non-deprecated ones (e.g. EmployeeManagement) in
 * src/components/index.ts, symbols exported by both end up documented under the
 * deprecated namespace — the non-deprecated namespace gets only a ReferenceReflection.
 * This function inverts that so documentation lives in the preferred, non-deprecated
 * home. The reference is discarded; the actual declaration is adopted.
 *
 * Call this before CommentPlugin's RESOLVE_BEGIN (priority 0) runs so that
 * excludeNotDocumented hasn't yet had a chance to remove the ReferenceReflections
 * that make the cross-namespace link visible.
 */
export function reparentDeprecatedMembers(project: ProjectReflection): void {
  const namespaces = (project.children ?? []).filter(
    (c): c is DeclarationReflection =>
      c instanceof DeclarationReflection && c.kind === ReflectionKind.Namespace,
  )

  for (const ns of namespaces) {
    if (ns.isDeprecated()) continue
    if (!ns.children?.length) continue

    // Snapshot before mutating — we remove children during this loop.
    for (const child of [...ns.children]) {
      if (!(child instanceof ReferenceReflection)) continue
      const target = child.tryGetTargetReflectionDeep()
      if (!(target instanceof DeclarationReflection)) continue
      if (!(target.parent instanceof DeclarationReflection)) continue
      if (!target.parent.isDeprecated()) continue

      // Detach from the deprecated namespace (children + childrenIncludingDocuments).
      const oldParent = target.parent
      oldParent.removeChild(target)

      // Adopt into the non-deprecated namespace.
      target.parent = ns
      ns.addChild(target)

      // Fully remove the ReferenceReflection from TypeDoc's tracking structures
      // (project.reflections, children, childrenIncludingDocuments, symbol maps).
      // Using project.removeReflection rather than direct array mutation is critical:
      // the link resolver runs at RESOLVE_END -300 and searches childrenIncludingDocuments
      // by name — leaving the reference there would cause getTargetReflectionDeep() to
      // be called on a stale reference, throwing "Reference was unresolved."
      project.removeReflection(child)
    }
  }
}

/**
 * Return the set of interfaces in `parent` that are used as the props type for
 * an exported Component in the same parent. These are inlined into their
 * component's Parameters section rather than rendered as standalone entries.
 *
 * Only interfaces whose type is referenced directly by a Component signature
 * parameter qualify — this intentionally excludes standalone public interfaces
 * like `AlertProps` that live in the parent but aren't component props.
 *
 * Accepts both namespace-level and project-level parents so the same filtering
 * can be applied wherever Components are exported.
 */
export function componentPropsInterfaces(
  parent: DeclarationReflection | ProjectReflection,
): Set<DeclarationReflection> {
  const result = new Set<DeclarationReflection>()
  for (const child of parent.children ?? []) {
    if (!(child instanceof DeclarationReflection)) continue
    if (!isComponent(child)) continue
    for (const sig of child.signatures ?? []) {
      for (const param of sig.parameters ?? []) {
        if (
          param.type instanceof ReferenceType &&
          param.type.reflection instanceof DeclarationReflection &&
          param.type.reflection.kind === ReflectionKind.Interface &&
          param.type.reflection.parent === parent
        ) {
          result.add(param.type.reflection)
        }
      }
    }
  }
  return result
}

export function isComponent(reflection: DeclarationReflection): boolean {
  return (
    reflection.comment?.blockTags.some(
      tag =>
        tag.tag === '@group' && /Components$/.test(Comment.combineDisplayParts(tag.content).trim()),
    ) ?? false
  )
}

/**
 * Return true when the model is an individual hook page — a synthetic namespace
 * whose name is a hook function name (e.g. `useEmployeeDetailsForm`). Distinct
 * from the hooks index page which is detected by `isHooksIndex`.
 */
export function isHookPage(model: DeclarationReflection): boolean {
  if (isHooksIndex(model)) return false
  return model.kind === ReflectionKind.Namespace && /^use[A-Z]/.test(model.name)
}

export function isDomainHub(model: DeclarationReflection | RouterTarget): boolean {
  if ('comment' in model) {
    return model.comment?.blockTags.some(tag => tag.tag === '@domainHub') ?? false
  }

  return false
}

/**
 * Derive a human-readable page title for frontmatter from the page model and URL.
 *
 * Synthetic pages (domain hubs, hooks pages, flow/block splits) carry generic
 * model names like "Hooks" or "Flow Components", so we enrich them with the
 * domain or namespace extracted from the page URL.
 */
export function pageTitle(page: MarkdownPageEvent): string {
  const { model } = page

  if (model instanceof ProjectReflection) return 'Reference'

  const decl = model as DeclarationReflection

  if (isDomainHub(decl)) return decl.name
  if (decl.name === 'Hooks') return 'Hooks'
  if (decl.name === 'Block Components') return 'Sub-components'

  return decl.name
}

/**
 * Serialize a frontmatter object to a complete YAML front-matter block,
 * including the autogeneration comment and `generated_by: typedoc` field.
 *
 * The comment warns editors that the file is generated and should not be
 * edited directly. The `generated_by` field is a machine-readable marker
 * for grepping/filtering when other generators are added later.
 */
export function serializeFrontmatter(frontmatter: Record<string, unknown>): string {
  const { custom_edit_url, ...rest } = frontmatter
  const yaml = stringifyYaml(
    { ...rest, generated_by: 'typedoc', custom_edit_url },
    { lineWidth: 0 },
  ).trimEnd()
  return `---\n# Autogenerated by TypeDoc from TSDoc comments in the source code.\n# To update content: edit TSDoc comments in src/.\n# To update structure: edit docs-site/typedoc.config.ts or docs-site/plugins/typedoc-custom/.\n# Then run \`npm run docs:api:generate\` to regenerate.\n${yaml}\n---`
}

/**
 * Derive a description for frontmatter from the model's comment summary, or
 * fall back to a generated sentence based on the page title.
 */
export function pageDescription(page: MarkdownPageEvent): string {
  const { model } = page

  if (model instanceof ProjectReflection) {
    const fromComment =
      model.comment?.summary && Comment.combineDisplayParts(model.comment.summary).trim()
    return (
      fromComment ||
      'Reference for @gusto/embedded-react-sdk — components, hooks, and utilities for Gusto Embedded Payroll.'
    )
  }

  const decl = model as DeclarationReflection
  const fromComment =
    decl.comment?.summary && Comment.combineDisplayParts(decl.comment.summary).trim()
  if (fromComment) return fromComment

  const title = pageTitle(page)
  return `${title} reference.`
}
