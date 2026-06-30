import { posix } from 'path'
import {
  Comment,
  type CommentTag,
  type Context,
  DeclarationReflection,
  IntrinsicType,
  ParameterReflection,
  ReferenceType,
  ReflectionKind,
  type SignatureReflection,
  type SomeType,
} from 'typedoc'
import { MarkdownPageEvent, MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown'
import {
  componentPropsInterfaces,
  getDomainPath,
  getSidebarPosition,
  isComponent,
  isDomainHub,
  isHooksIndex,
  isNamespaceIndex,
  NAMESPACE_PATHS,
  pageDescription,
  pageTitle,
  readDomainGuide,
  serializeFrontmatter as buildFrontmatterYaml,
  type Guide,
  type GuideSlot,
} from './utils.ts'
import { SDKRouter } from './router.ts'
import { TYPE_EMOJIS } from './router.config.ts'

function getReflectionDescription(
  reflection: DeclarationReflection,
  context: SDKThemeContext,
): string {
  const comment = reflection.signatures?.[0]?.comment ?? reflection.comment
  if (!comment) return ''
  return context.helpers.getDescriptionForComment(comment) ?? ''
}

function renderDomainHub(context: SDKThemeContext, model: DeclarationReflection): string {
  const parts: string[] = [`# ${model.name}`, '']

  const domainGuide = readDomainGuide(getDomainPath(model))
  if (domainGuide?.slots.overview) {
    parts.push(fenceSlot(domainGuide.slots.overview, domainGuide.source, 'overview', true), '')
  }

  const namespaces = (model.children ?? []).filter(
    (c): c is DeclarationReflection =>
      c instanceof DeclarationReflection && c.kind === ReflectionKind.Namespace,
  )

  const domainPath = getDomainPath(model)
  for (const ns of namespaces) {
    parts.push(`## ${TYPE_EMOJIS.namespace} ${ns.name}`, '')

    const flows = (ns.children ?? []).filter(
      (c): c is DeclarationReflection =>
        c instanceof DeclarationReflection && isComponent(c) && c.name.endsWith('Flow'),
    )
    const blocks = (ns.children ?? []).filter(
      (c): c is DeclarationReflection =>
        c instanceof DeclarationReflection && isComponent(c) && !c.name.endsWith('Flow'),
    )

    const cards: Record<string, string>[] = flows.map(comp => {
      const href = context.urlTo(comp).replace(/\.md$/, '')
      const description = getReflectionDescription(comp, context)
      const item: Record<string, string> = {
        type: 'link',
        href,
        label: `${TYPE_EMOJIS.flow} ${comp.name}`,
      }
      if (description) item.description = description
      return item
    })

    if (blocks.length > 0) {
      const nsPath = NAMESPACE_PATHS[ns.name] ?? ns.name
      const nsRelPath = nsPath.startsWith(domainPath + '/')
        ? nsPath.slice(domainPath.length + 1)
        : ''
      const subComponentsHref = nsRelPath ? `${nsRelPath}/blocks` : 'blocks'
      cards.push({
        type: 'link',
        href: subComponentsHref,
        label: `${TYPE_EMOJIS.block} ${blocks.length} block${blocks.length === 1 ? '' : 's'}`,
      })
    }

    if (cards.length > 0) {
      parts.push(`<DocCardList items={${JSON.stringify(cards)}} />`, '')
    }
  }

  const hooksNs = (context.router as SDKRouter).hooksNsByDomain.get(getDomainPath(model))
  const hookPages = (hooksNs?.children ?? []) as DeclarationReflection[]

  if (hookPages.length > 0) {
    parts.push(`## ${TYPE_EMOJIS.hooks} Hooks`, '')
    const hookItems = hookPages.map(hookNs => {
      const href = context.urlTo(hookNs).replace(/\.md$/, '')
      const primaryHook = (hookNs.children?.find(c => c.name === hookNs.name) ??
        hookNs.children?.[0]) as DeclarationReflection | undefined
      const description = primaryHook ? getReflectionDescription(primaryHook, context) : ''
      const emoji = hookNs.name.endsWith('Form') ? TYPE_EMOJIS.formHook : TYPE_EMOJIS.dataHook
      const item: Record<string, string> = { type: 'link', href, label: `${emoji} ${hookNs.name}` }
      if (description) item.description = description
      return item
    })
    parts.push(`<DocCardList items={${JSON.stringify(hookItems)}} />`, '')
  }

  if (domainGuide?.slots.appendix) {
    parts.push(fenceSlot(domainGuide.slots.appendix, domainGuide.source, 'appendix', true), '')
  }

  return parts.join('\n')
}

function renderHooksIndex(context: SDKThemeContext, model: DeclarationReflection): string {
  const parts: string[] = [`# ${model.name}`, '']
  const hookItems = (model.children ?? ([] as DeclarationReflection[])).map(hookNs => {
    const href = context.urlTo(hookNs).replace(/\.md$/, '')
    const primaryHook = (hookNs.children?.find(c => c.name === hookNs.name) ??
      hookNs.children?.[0]) as DeclarationReflection | undefined
    const description = primaryHook ? getReflectionDescription(primaryHook, context) : ''
    const emoji = hookNs.name.endsWith('Form') ? TYPE_EMOJIS.formHook : TYPE_EMOJIS.dataHook
    const item: Record<string, string> = { type: 'link', href, label: `${emoji} ${hookNs.name}` }
    if (description) item.description = description
    return item
  })
  parts.push(`<DocCardList items={${JSON.stringify(hookItems)}} />`)
  return parts.join('\n')
}

function renderNamespaceIndex(context: SDKThemeContext, model: DeclarationReflection): string {
  const parts: string[] = [`# ${model.name}`, '']

  const nsComment = model.comment
    ? (context.helpers.getDescriptionForComment(model.comment) ?? '')
    : ''
  if (nsComment) parts.push(nsComment, '')

  const components = (model.children ?? []).filter(
    (c): c is DeclarationReflection => c instanceof DeclarationReflection && isComponent(c),
  )
  const flows = components.filter(c => c.name.endsWith('Flow'))
  const blocks = components.filter(c => !c.name.endsWith('Flow'))

  for (const [emoji, heading, items] of [
    [TYPE_EMOJIS.flow, 'Workflows', flows],
    [TYPE_EMOJIS.block, 'Blocks', blocks],
  ] as const) {
    if (items.length === 0) continue
    parts.push(`## ${emoji} ${heading}`, '')
    parts.push('| Component | Description |', '| --------- | ----------- |')
    for (const item of items) {
      parts.push(
        `| [${item.name}](${context.urlTo(item)}) | ${getReflectionDescription(item, context)} |`,
      )
    }
    parts.push('')
  }

  return parts.join('\n')
}

/**
 * Wrap injected guide prose in a provenance comment naming its source GUIDE.md
 * and slot, so the content is traceable from the generated page (whose
 * frontmatter banner otherwise points only at TSDoc). `.md` pages parse as
 * CommonMark (HTML comments); `.mdx` hubs need MDX expression comments.
 */
function fenceSlot(content: string, source: string, slot: GuideSlot, mdx: boolean): string {
  const open = mdx
    ? `{/* guide-source: ${source} (slot: ${slot}) */}`
    : `<!-- guide-source: ${source} (slot: ${slot}) -->`
  const close = mdx
    ? `{/* /guide-source (slot: ${slot}) */}`
    : `<!-- /guide-source (slot: ${slot}) -->`
  return `${open}\n${content}\n${close}`
}

/**
 * Slot GUIDE.md prose into a rendered page (flow or hook). `overview` lands
 * after the summary and any quick-start `## Example`, but before the rest
 * (Remarks, props, …) — so a reader gets the summary, the example, then the
 * conceptual overview. `appendix` lands at the end. Guide content never
 * overrides the autogenerated sections in between. These pages are `.md`
 * (CommonMark), so provenance fences use HTML comments.
 */
function renderGuidePage(rendered: string, guide: Guide): string {
  let result = rendered

  if (guide.slots.overview) {
    const fenced = fenceSlot(guide.slots.overview, guide.source, 'overview', false)
    const lines = result.split('\n')
    // Insert before the first non-Example `##` heading: this keeps the overview
    // below a quick-start Example when one exists, and otherwise right after the
    // H1 + summary. Append if there are no eligible sections.
    const isExampleHeading = (line: string) => /^##\s+Examples?\s*$/.test(line)
    const sectionIndex = lines.findIndex(l => /^##\s/.test(l) && !isExampleHeading(l))
    result =
      sectionIndex === -1
        ? `${result.trimEnd()}\n\n${fenced}`
        : [...lines.slice(0, sectionIndex), fenced, '', ...lines.slice(sectionIndex)].join('\n')
  }

  if (guide.slots.appendix) {
    result = `${result.trimEnd()}\n\n${fenceSlot(guide.slots.appendix, guide.source, 'appendix', false)}\n`
  }

  return result
}

/**
 * Reorder a standalone component page's top-level (`##`) sections so the props
 * reference lands last. The default member template emits Props → Remarks →
 * Example, which fronts a reader with the exhaustive props table before they
 * know what the component is or how to call it. This reorders to Example →
 * Remarks → Props: quick-start first, conceptual detail next, full reference
 * last. Everything above the first `##` (H1 + summary) is untouched, and
 * unknown sections keep their original order ahead of the props table.
 */
function reorderComponentSections(rendered: string): string {
  const lines = rendered.split('\n')
  const firstSection = lines.findIndex(l => /^##\s/.test(l))
  if (firstSection === -1) return rendered

  const preamble = lines.slice(0, firstSection)
  const sections: { title: string; lines: string[] }[] = []
  for (const line of lines.slice(firstSection)) {
    const heading = /^##\s+(.+?)\s*$/.exec(line)
    if (heading) {
      sections.push({ title: heading[1]!, lines: [line] })
    } else {
      sections[sections.length - 1]!.lines.push(line)
    }
  }

  const rank = (title: string): number => {
    if (/^Examples?$/.test(title)) return 0
    if (title === 'Remarks') return 1
    if (/Props$/.test(title)) return 2
    if (title === 'Events') return 3
    return 4
  }
  const ordered = sections
    .map((section, index) => ({ section, index }))
    .sort((a, b) => rank(a.section.title) - rank(b.section.title) || a.index - b.index)
    .map(({ section }) => section)

  return [...preamble, ...ordered.flatMap(section => section.lines)].join('\n')
}

function isBlocksPage(model: DeclarationReflection): boolean {
  return model.name === 'Blocks' && model.kind === ReflectionKind.Namespace
}

function renderBlocksPage(context: SDKThemeContext, model: DeclarationReflection): string {
  const children = model.children ?? []
  const blockComps = children.filter(isComponent).sort((a, b) => a.name.localeCompare(b.name))
  const utilities = children
    .filter(c => !isComponent(c))
    .sort((a, b) => a.name.localeCompare(b.name))

  const parts: string[] = []
  for (const block of blockComps) {
    parts.push(context.partials.memberContainer(block, { headingLevel: 2 }))
  }
  if (utilities.length > 0) {
    parts.push('## Utility types')
    for (const util of utilities) {
      parts.push(context.partials.memberContainer(util, { headingLevel: 3 }))
    }
  }
  return parts.join('\n\n')
}

/**
 * Base-interface props whose type is driven by the component's generic
 * parameter, so they carry component-specific meaning only when specialized.
 */
const SPECIALIZABLE_BASE_PROPS = new Set(['dictionary', 'defaultValues'])

/**
 * The inert types `BaseComponentInterface` falls back to when a prop is not
 * specialized (`dictionary` → `undefined`, `defaultValues` → `unknown`/`undefined`).
 * Such a prop carries no component-specific information.
 */
function isInertType(type: SomeType | undefined): boolean {
  return type instanceof IntrinsicType && (type.name === 'undefined' || type.name === 'unknown')
}

/**
 * Markdown link to the props interface's base type, without type arguments —
 * e.g. `[BaseComponentInterface](…)`. Falls back to the bare name when the base
 * has no documented page.
 */
function baseInterfaceLink(context: SDKThemeContext, propsRef: DeclarationReflection): string {
  const base = (propsRef.extendedTypes ?? []).find(
    (type): type is ReferenceType => type instanceof ReferenceType,
  )
  if (!base) return ''
  const reflection = base.reflection
  if (reflection instanceof DeclarationReflection && context.router.hasUrl(reflection)) {
    return `[${base.name}](${context.urlTo(reflection)})`
  }
  return base.name
}

/**
 * Render the props table for a component whose single parameter is its props
 * interface. Components take one `props` argument typed as a sibling interface
 * (or, on a standalone flow page, one re-parented onto the component). Instead
 * of the default bare `props: XxxProps` parameter row, inline the interface
 * itself — anchor + interface comment (if any) + properties table — so the
 * Props type stays co-located with the component that uses it. Anything that
 * isn't this shape falls back to the default parameters table.
 */
function renderFunctionPropsTable(
  context: SDKThemeContext,
  params: ParameterReflection[],
  fallback: (params: ParameterReflection[]) => string,
): string {
  if (params.length !== 1) return fallback(params)

  const param = params[0]!
  const component = param.parent?.parent
  if (
    !(component instanceof DeclarationReflection) ||
    !isComponent(component) ||
    !(param.type instanceof ReferenceType)
  ) {
    return fallback(params)
  }

  const propsRef = param.type.reflection
  // The props interface is normally a sibling of the component (shared
  // namespace parent). On a standalone flow page the router re-parents the
  // props onto the flow itself so cross-references resolve to a cross-page
  // URL (see SDKRouter.buildChildPages), so also accept that case.
  if (
    !(propsRef instanceof DeclarationReflection) ||
    propsRef.kind !== ReflectionKind.Interface ||
    (propsRef.parent !== component.parent && propsRef.parent !== component)
  ) {
    return fallback(params)
  }

  const parts: string[] = []

  // Emit the anchor so that cross-references to this Props type still resolve.
  if (context.router.hasUrl(propsRef) && context.options.getValue('useHTMLAnchors')) {
    parts.push(`<a id="${context.router.getAnchor(propsRef)}"></a>`)
  }

  // Include any summary/remarks on the Props interface itself.
  if (propsRef.comment) {
    const commentMd = context.partials.comment(propsRef.comment, {
      showSummary: true,
      showTags: true,
    })
    if (commentMd.trim()) parts.push(commentMd)
  }

  // Decide which props earn a row in the main table. An inherited prop is
  // promoted inline when it is required (e.g. `onEvent`) or when it is a
  // base-interface prop the component meaningfully specialized via its generic
  // (`dictionary`/`defaultValues` typed to something other than the inert
  // `undefined`/`unknown` sentinel). Every other inherited prop is identical on
  // every component, so it is summarized in a footer line instead of repeated.
  const declared = (propsRef.children ?? []).filter(c => c.isDeclaration())
  const isPromoted = (c: DeclarationReflection) =>
    !c.inheritedFrom ||
    !c.flags.isOptional ||
    (SPECIALIZABLE_BASE_PROPS.has(c.name) && !isInertType(c.type))
  const mainProps = declared.filter(isPromoted)
  const inheritedRest = declared.filter(c => !isPromoted(c))

  if (mainProps.length > 0) {
    parts.push(
      context.partials.propertiesTable(mainProps, {
        isEventProps: false,
        kind: ReflectionKind.Interface,
      }),
    )
  }

  if (inheritedRest.length > 0) {
    const names = inheritedRest.map(c => `\`${c.name}\``).join(', ')
    const base = baseInterfaceLink(context, propsRef)
    parts.push(base ? `_Inherits ${names} from ${base}._` : `_Inherits ${names}._`)
  }

  return parts.join('\n\n')
}

/**
 * Find the `@components` block tag on a reflection's own comment or its first
 * signature comment (function components carry their TSDoc on the signature).
 */
function findComponentsTag(
  model: DeclarationReflection,
): { comment: Comment; tag: CommentTag } | null {
  const comments = [model.comment, ...(model.signatures ?? []).map(sig => sig.comment)]
  for (const comment of comments) {
    const tag = comment?.blockTags.find(t => t.tag === '@components')
    if (comment && tag) return { comment, tag }
  }
  return null
}

/**
 * Map a target's resolved (relative) URL back to the namespace id that owns it,
 * e.g. `../../employee/onboarding/onboarding-flow.md` → `EmployeeOnboarding`.
 * Matches the most specific namespace path first so `employee/onboarding` wins
 * over a hypothetical `employee` prefix.
 */
function namespaceFromUrl(url: string): string | null {
  const entries = Object.entries(NAMESPACE_PATHS).sort((a, b) => b[1].length - a[1].length)
  return entries.find(([, path]) => url.includes(`${path}/`))?.[0] ?? null
}

/**
 * Render a `## Sub-components` table from the `{@link}` references inside a
 * `@components` tag. Each linked component or hook becomes a row with its name
 * (linked when documented) and summary description.
 */
function renderComponentsTable(
  context: SDKThemeContext,
  tag: CommentTag,
  pageUrl: string,
): string | null {
  const links = tag.content.filter(part => part.kind === 'inline-tag' && part.tag === '@link')

  const rows: string[] = []
  for (const part of links) {
    const target = part.target
    if (target instanceof DeclarationReflection) {
      // A same-namespace target's page (blocks.md or a sibling flow page) sits
      // in the flow's own directory, so its relative URL never traverses up
      // (`../`) — show it bare. A cross-namespace target's URL does traverse
      // up; qualify it with its own namespace. The relative URL alone can't
      // identify the namespace (a same-domain hop like `../onboarding/...`
      // drops the domain segment), so resolve it to an output-absolute path
      // first. The reflection's getFullName can't help — it resolves to the
      // synthetic "Blocks" page.
      const hasUrl = context.router.hasUrl(target)
      const url = hasUrl ? context.urlTo(target) : ''
      const foreignNamespace = url.includes('../')
        ? namespaceFromUrl(posix.join(posix.dirname(pageUrl), url))
        : null
      const name = foreignNamespace ? `${foreignNamespace}.${target.name}` : target.name
      const label = hasUrl ? `[${name}](${url})` : name
      rows.push(`| ${label} | ${getReflectionDescription(target, context)} |`)
    } else {
      rows.push(`| ${part.text.trim()} | |`)
    }
  }
  if (rows.length === 0) return null
  return [
    '## Sub-components',
    '',
    '| Component | Description |',
    '| ------ | ------ |',
    ...rows,
  ].join('\n')
}

/**
 * Append the components table after the props section. The section reorder
 * places the props table last, so appending keeps Components below it.
 */
function insertComponentsTable(rendered: string, table: string): string {
  return `${rendered.trimEnd()}\n\n${table}\n`
}

export class SDKTheme extends MarkdownTheme {
  override getRenderContext(
    page: ConstructorParameters<typeof MarkdownThemeContext>[1],
  ): SDKThemeContext {
    return new SDKThemeContext(this, page, this.application.options)
  }

  // Populate page.frontmatter from the page model and URL so other plugins can
  // read or override it before END. custom_edit_url is null because these files
  // are autogenerated — partners should not see an "Edit this page" link.
  static injectFrontmatter(page: MarkdownPageEvent): void {
    const sidebarPosition = getSidebarPosition(page.url)
    const isHub = isDomainHub(page.model) || isHooksIndex(page.model)
    page.frontmatter = {
      title: pageTitle(page),
      description: pageDescription(page),
      custom_edit_url: null,
      ...(sidebarPosition !== undefined && { sidebar_position: sidebarPosition }),
      ...(isHub && { hide_table_of_contents: true }),
      ...page.frontmatter,
    }
  }

  // Prepend the YAML frontmatter block to page.contents after rendering is done.
  static serializeFrontmatter(page: MarkdownPageEvent): void {
    if (!page.frontmatter) return
    page.contents = `${buildFrontmatterYaml(page.frontmatter)}\n\n${page.contents}`
  }

  // Must run before CommentPlugin's RESOLVE_BEGIN handler (priority 0) so that
  // Props interfaces without a JSDoc comment are not removed by excludeNotDocumented
  // before we can inline them. We attach a minimal auto-generated comment so
  // TypeDoc treats them as documented — the comment is rendered inline inside
  // the component's Parameters section by the parametersTable theme override.
  static protectPropsInterfaces(context: Context): void {
    for (const reflection of Object.values(context.project.reflections)) {
      if (!(reflection instanceof DeclarationReflection)) continue
      if (reflection.kind !== ReflectionKind.Function) continue
      if (!/^[A-Z]/.test(reflection.name)) continue

      // Only protect props interfaces for components that are themselves documented
      // (have a JSDoc comment on the function or a signature). If the component gets
      // excluded by excludeNotDocumented, its props interface should also be excluded —
      // otherwise it'd appear as an orphaned entry in the ## Interfaces section.
      const isComponentDocumented =
        reflection.comment || reflection.signatures?.some(sig => !!sig.comment)
      if (!isComponentDocumented) continue

      for (const sig of reflection.signatures ?? []) {
        for (const param of sig.parameters ?? []) {
          if (!(param.type instanceof ReferenceType)) continue
          const propsRef = param.type.reflection
          if (
            !(propsRef instanceof DeclarationReflection) ||
            propsRef.kind !== ReflectionKind.Interface ||
            propsRef.parent !== reflection.parent
          ) {
            continue
          }
          // Auto-generate a summary so excludeNotDocumented keeps this interface.
          if (!propsRef.comment) {
            propsRef.comment = new Comment([
              { kind: 'text', text: 'Props for ' },
              { kind: 'inline-tag', tag: '@link', text: reflection.name, target: reflection },
            ])
          }
          // Protect undocumented properties too — excludeNotDocumentedKinds includes
          // Property by default, so properties without JSDoc would be removed otherwise.
          for (const child of propsRef.children ?? []) {
            if (!child.comment) {
              child.comment = new Comment()
            }
          }
        }
      }
    }
  }

  // Must run after GroupPlugin (priority -100) so that groups already exist.
  // Remove component-props interfaces from their parent's groups — they are
  // rendered inline inside their component's Parameters section instead.
  // Applies at both namespace level and project level.
  static removePropsFromGroups(context: Context): void {
    for (const reflection of Object.values(context.project.reflections)) {
      if (!(reflection instanceof DeclarationReflection)) continue
      if (reflection.kind !== ReflectionKind.Namespace) continue
      if (!reflection.groups?.length) continue

      const propsSet = componentPropsInterfaces(reflection)
      if (propsSet.size === 0) continue

      for (const group of reflection.groups) {
        group.children = group.children.filter(c => !propsSet.has(c as DeclarationReflection))
      }
      reflection.groups = reflection.groups.filter(g => g.children.length > 0)
    }

    // Also remove component-props from the project's own groups so they don't
    // render as standalone Interfaces on the project index page.
    const projectPropsSet = componentPropsInterfaces(context.project)
    if (projectPropsSet.size > 0) {
      for (const group of context.project.groups ?? []) {
        group.children = group.children.filter(
          c => !projectPropsSet.has(c as DeclarationReflection),
        )
      }
      if (context.project.groups) {
        context.project.groups = context.project.groups.filter(g => g.children.length > 0)
      }
    }
  }
}

export class SDKThemeContext extends MarkdownThemeContext {
  constructor(...args: ConstructorParameters<typeof MarkdownThemeContext>) {
    super(...args)

    const origMemberTitle = this.partials.memberTitle.bind(this)
    const origPageTitle = this.partials.pageTitle.bind(this)
    const origSignature = this.partials.signature.bind(this)
    const origSignatureTitle = this.partials.signatureTitle.bind(this)
    const origSignatureReturns = this.partials.signatureReturns.bind(this)
    const origParametersTable = this.partials.parametersTable.bind(this)
    const origPropertiesTable = this.partials.propertiesTable.bind(this)

    this.partials = {
      ...this.partials,
      memberTitle: (model: DeclarationReflection) => {
        const title = origMemberTitle(model)
        // Strip trailing () for components. Deprecated titles are wrapped in ~~...~~
        // so the () sits before the closing ~~ rather than at the very end.
        return isComponent(model) ? title.replace(/\(\)(~~)?$/, (_, tilde = '') => tilde) : title
      },
      pageTitle: () => {
        // The standalone page H1 normally comes from the pageTitle partial
        // (e.g. "Function: TerminationFlow()" via the reflection kind). For
        // components, reuse memberTitle so the page H1 matches how the component
        // is titled when listed inline (e.g. on the Blocks page) — no "Function:"
        // prefix and no trailing "()".
        const model = this.page.model
        if (model instanceof DeclarationReflection && isComponent(model)) {
          return this.partials.memberTitle(model)
        }
        return origPageTitle()
      },
      signature: (model: SignatureReflection, options: Parameters<typeof origSignature>[1]) => {
        const result = origSignature(model, options)
        // For a component whose single parameter is an interface sibling in the
        // same namespace, replace the generated "Parameters" heading with the
        // Props type name (e.g. "#### FederalTaxesCardProps").
        if (!(model.parent instanceof DeclarationReflection) || !isComponent(model.parent)) {
          return result
        }
        if (model.parameters?.length !== 1) return result
        const param = model.parameters[0]!
        if (!(param.type instanceof ReferenceType)) return result
        const propsRef = param.type.reflection
        // The props interface is normally a sibling of the component (shared
        // namespace parent). On a standalone flow page the router re-parents the
        // props onto the flow itself so cross-references resolve to a cross-page
        // URL (see SDKRouter.buildChildPages), so also accept that case.
        if (
          !(propsRef instanceof DeclarationReflection) ||
          propsRef.kind !== ReflectionKind.Interface ||
          (propsRef.parent !== model.parent.parent && propsRef.parent !== model.parent)
        ) {
          return result
        }
        const hashes = '#'.repeat((options as { headingLevel: number }).headingLevel)
        return result.replace(`${hashes} Parameters`, `${hashes} ${propsRef.name}`)
      },
      signatureTitle: (
        model: SignatureReflection,
        options?: Parameters<typeof origSignatureTitle>[1],
      ) => {
        if (model.parent instanceof DeclarationReflection && isComponent(model.parent)) {
          return ''
        }
        return origSignatureTitle(model, options)
      },
      signatureReturns: (
        model: SignatureReflection,
        options: Parameters<typeof origSignatureReturns>[1],
      ) => {
        if (model.parent instanceof DeclarationReflection && isComponent(model.parent)) {
          return ''
        }
        return origSignatureReturns(model, options)
      },
      propertiesTable: (...args: Parameters<typeof origPropertiesTable>) => {
        const result = origPropertiesTable(...args)
        const lines = result.split('\n')
        // Find the Default value column index from the header row so this stays
        // correct if other columns are hidden or reordered.
        const headerLine = lines.find(l => l.startsWith('|') && l.includes('Default value'))
        if (!headerLine) return result
        const defaultColIndex = headerLine.split('|').findIndex(h => h.trim() === 'Default value')
        if (defaultColIndex === -1) return result
        return lines
          .map(line => {
            if (!line.startsWith('|')) return line
            const cells = line.split('|')
            if (cells[defaultColIndex]?.trim() === '`undefined`') cells[defaultColIndex] = ' '
            return cells.join('|')
          })
          .join('\n')
      },
      parametersTable: (params: ParameterReflection[]) =>
        renderFunctionPropsTable(this, params, origParametersTable),
    }

    const origReflectionTemplate = this.templates.reflection.bind(this)
    this.templates = {
      ...this.templates,
      reflection: (page: MarkdownPageEvent<DeclarationReflection>) => {
        if (isDomainHub(page.model)) return renderDomainHub(this, page.model)
        if (isHooksIndex(page.model)) return renderHooksIndex(this, page.model)
        if (isNamespaceIndex(page.model)) return renderNamespaceIndex(this, page.model)
        if (isBlocksPage(page.model)) return renderBlocksPage(this, page.model)

        // Build the @components table, then strip the tag so the default
        // renderer doesn't also emit it as a raw block-tag section.
        const componentsTag = findComponentsTag(page.model)
        const componentsTable = componentsTag
          ? renderComponentsTable(this, componentsTag.tag, page.url)
          : null
        if (componentsTag) {
          componentsTag.comment.blockTags = componentsTag.comment.blockTags.filter(
            tag => tag !== componentsTag.tag,
          )
        }

        let rendered = origReflectionTemplate(page)
        // Standalone component pages are flow pages; front the Example and
        // Remarks ahead of the props table for readability.
        if (isComponent(page.model)) rendered = reorderComponentSections(rendered)
        if (componentsTable) rendered = insertComponentsTable(rendered, componentsTable)

        const flowGuide = (this.router as SDKRouter).flowGuides.get(page.model)
        if (flowGuide) return renderGuidePage(rendered, flowGuide)
        const hookGuide = (this.router as SDKRouter).hookGuides.get(page.model)
        if (hookGuide) return renderGuidePage(rendered, hookGuide)
        return rendered
      },
    }
  }
}
