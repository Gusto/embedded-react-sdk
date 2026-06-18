import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { stringify as stringifyYaml } from 'yaml'
import {
  Comment,
  CommentTag,
  Converter,
  DeclarationReflection,
  PageKind,
  type PageDefinition,
  ParameterReflection,
  ProjectReflection,
  ReferenceReflection,
  ReferenceType,
  type Reflection,
  ReflectionGroup,
  ReflectionKind,
  RendererEvent,
  type SignatureReflection,
  Slugger,
} from 'typedoc'
import {
  type MarkdownApplication,
  MarkdownPageEvent,
  MarkdownTheme,
  MarkdownThemeContext,
  MemberRouter,
} from 'typedoc-plugin-markdown'
import {
  DOMAINS,
  NAMESPACE_PATHS,
  STANDALONE_PAGES as _STANDALONE_PAGES,
} from './sdk-router-config.mjs'

type StandalonePageConfig = Record<
  string,
  { sources: string[]; groups?: string[]; displayName: string; sidebarPosition: number }
>
const STANDALONE_PAGES = _STANDALONE_PAGES as StandalonePageConfig

/**
 * TypeDoc plugin: custom router for @gusto/embedded-react-sdk
 *
 * Register via  "router": "sdk-router"  in the TypeDoc config.
 *
 * URL structure:
 *   employee/index.md                      ← generated domain hub (namespaces + hooks index)
 *   employee/management/index.md              ← namespace index (links to workflows + sub-components)
 *   employee/management/workflows.md          ← namespace members whose name ends with 'Flow'
 *   employee/management/sub-components.md     ← remaining namespace members
 *   employee/hooks.md                         ← all Employee hooks consolidated on one page
 *   company/hooks.md                          ← all Company hooks consolidated on one page
 *   payroll/README.md                         ← flat namespace (no subpath in DOMAINS)
 *   theme-variables.md                        ← ThemeProvider exports (GustoSDKTheme, createTheme, …)
 *   component-inventory.md                    ← Common UI component inventory
 *   utilities.md                              ← partner hook utilities (composeErrorHandler, …)
 *   index.md#reflectionname                  ← all unmapped top-level exports (anchors on the
 *                                              project index page, which renders them inline)
 */

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
  for (const [page, { sources, groups }] of Object.entries(STANDALONE_PAGES)) {
    if (!sources.some(pattern => fp.includes(pattern))) continue
    if (groups) {
      const inGroup = (reflection as DeclarationReflection).comment?.blockTags.some(
        t => t.tag === '@group' && groups.includes(Comment.combineDisplayParts(t.content).trim()),
      )
      if (!inGroup) continue
    }
    return page
  }
  return null
}

/** Convert a domain output path to its TypeDoc source directory name.
 *  'employee' → 'Employee',  'time-off' → 'TimeOff' */
function pathToSourceDir(domainPath: string): string {
  return domainPath
    .split('-')
    .map(s => s[0]!.toUpperCase() + s.slice(1))
    .join('')
}

function isNamespaceIndex(model: DeclarationReflection): boolean {
  return model.comment?.blockTags.some(tag => tag.tag === '@namespaceIndex') ?? false
}

function getDomainPath(model: DeclarationReflection): string {
  const tag = model.comment?.blockTags.find(t => t.tag === '@domainPath')
  return tag ? Comment.combineDisplayParts(tag.content) : ''
}

/** sidebar_position for a generated page, derived from its URL. */
function getSidebarPosition(url: string): number | undefined {
  if (url === 'index.md') return 1
  const key = url.replace(/\.md$/, '')
  const standalone = STANDALONE_PAGES[key]
  if (standalone?.sidebarPosition !== undefined) return standalone.sidebarPosition
  const parts = key.split('/')
  const filename = parts[parts.length - 1]!
  const depth = parts.length // 2 = domain-level file, 3 = namespace subdir file
  if (filename === 'index') return 1
  if (filename === 'workflows') return depth >= 3 ? 1 : 2
  if (filename === 'sub-components') return depth >= 3 ? 2 : 3
  if (filename === 'hooks') return 100
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

export function load(app: MarkdownApplication): void {
  app.renderer.defineRouter('sdk-router', SDKRouter)
  app.renderer.defineTheme('sdk-theme', SDKTheme)

  // Inject Docusaurus-compatible frontmatter into every generated page.
  // custom_edit_url is null because these files are autogenerated — partners
  // should not see an "Edit this page" link pointing at our TypeScript source.
  //
  // We set page.frontmatter in BEGIN (so other plugins can read/override it),
  // then serialize to YAML and prepend to page.contents in END (after rendering).
  app.renderer.on(MarkdownPageEvent.BEGIN, (page: MarkdownPageEvent) => {
    const sidebarPosition = getSidebarPosition(page.url)
    page.frontmatter = {
      title: pageTitle(page),
      description: pageDescription(page),
      custom_edit_url: null,
      ...(sidebarPosition !== undefined && { sidebar_position: sidebarPosition }),
      ...page.frontmatter,
    }
  })
  app.renderer.on(MarkdownPageEvent.END, (page: MarkdownPageEvent) => {
    if (!page.frontmatter) return
    page.contents = `${serializeFrontmatter(page.frontmatter)}\n\n${page.contents}`
  })

  // Emit _category_.json files for each domain directory and namespace subdirectory.
  app.renderer.on(RendererEvent.END, (event: RendererEvent) => {
    const outDir = event.outputDirectory
    for (const [idx, domain] of DOMAINS.entries()) {
      const domainDir = join(outDir, domain.path)
      mkdirSync(domainDir, { recursive: true })
      writeFileSync(
        join(domainDir, '_category_.json'),
        JSON.stringify({ label: domain.label, position: idx + 1 }, null, 2) + '\n',
      )
      for (const [nsIdx, ns] of domain.namespaces.entries()) {
        if (!ns.subpath) continue
        const nsDir = join(domainDir, ns.subpath)
        mkdirSync(nsDir, { recursive: true })
        writeFileSync(
          join(nsDir, '_category_.json'),
          // index.md = position 1; namespace subdirs start at position 2
          JSON.stringify({ label: ns.id, position: nsIdx + 2 }, null, 2) + '\n',
        )
      }
    }
  })

  // Must run before CommentPlugin's RESOLVE_BEGIN handler (priority 0) so that
  // Props interfaces without a JSDoc comment are not removed by excludeNotDocumented
  // before we can inline them. We attach a minimal auto-generated comment so
  // TypeDoc treats them as documented — the comment is rendered inline inside
  // the component's Parameters section by the parametersTable theme override.
  app.converter.on(
    Converter.EVENT_RESOLVE_BEGIN,
    context => {
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
    },
    100,
  )

  // Must run before CommentPlugin's RESOLVE_BEGIN handler (priority 0) so that
  // ReferenceReflections in non-deprecated namespaces haven't yet been removed by
  // excludeNotDocumented. Priority 50 = after auto-comment injection (100) but
  // before CommentPlugin (0).
  app.converter.on(
    Converter.EVENT_RESOLVE_BEGIN,
    context => {
      reparentDeprecatedMembers(context.project)
    },
    50,
  )

  // Must run before GroupPlugin (priority -100). EventDispatcher fires higher priorities first,
  // so priority 0 (default) runs before GroupPlugin's -100.
  //
  // Auto-stamps @group tags so GroupPlugin places each member in the right section:
  //   Components in a namespace  → Flow Components (*Flow) or Block Components (other)
  //   Components at project level → Components
  //   Hooks ending with Form      → Form Hooks  (Data Hooks / Utility Hooks come from JSDoc)
  //   Other hooks                 → Hooks (fallback)
  // Skips reflections that already carry an explicit @group tag from their JSDoc.
  // NOTE: TypeDoc places @group block tags on SignatureReflections, not the parent
  // DeclarationReflection. We copy any signature-level @group to the declaration so
  // the skip check fires and groupSyntheticMembers can read the group from member.comment.
  app.converter.on(
    Converter.EVENT_RESOLVE_END,
    context => {
      for (const reflection of Object.values(context.project.reflections)) {
        if (!(reflection instanceof DeclarationReflection)) continue
        if (reflection.kind !== ReflectionKind.Function) continue
        if (reflection.comment?.blockTags.some(t => t.tag === '@group')) continue

        // TypeDoc places @group block tags on the SignatureReflection, not the
        // DeclarationReflection. Copy any explicit tag to the declaration so the
        // check above fires on the next pass and groupSyntheticMembers can read it.
        const sigGroupTag = reflection.signatures
          ?.flatMap(sig => sig.comment?.blockTags ?? [])
          .find(t => t.tag === '@group')
        if (sigGroupTag) {
          if (!reflection.comment) reflection.comment = new Comment()
          reflection.comment.blockTags.push(sigGroupTag)
          continue
        }

        let group: string
        if (/^[A-Z]/.test(reflection.name)) {
          const inNamespace =
            reflection.parent instanceof DeclarationReflection &&
            reflection.parent.kind === ReflectionKind.Namespace
          group = inNamespace
            ? /Flow$/.test(reflection.name)
              ? 'Flow Components'
              : 'Block Components'
            : 'Components'
        } else if (/^use[A-Z]/.test(reflection.name)) {
          group = /Form$/.test(reflection.name) ? 'Form Hooks' : 'Hooks'
        } else {
          continue
        }

        if (!reflection.comment) reflection.comment = new Comment()
        reflection.comment.blockTags.push(new CommentTag('@group', [{ kind: 'text', text: group }]))
      }
    },
    0,
  )

  // Must run after GroupPlugin (priority -100) so that groups already exist.
  // Remove component-props interfaces from their parent's groups — they are
  // rendered inline inside their component's Parameters section instead.
  // Applies at both namespace level and project level.
  app.converter.on(
    Converter.EVENT_RESOLVE_END,
    context => {
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
    },
    -200,
  )
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

function isComponent(reflection: DeclarationReflection): boolean {
  return (
    reflection.comment?.blockTags.some(
      tag =>
        tag.tag === '@group' && /Components$/.test(Comment.combineDisplayParts(tag.content).trim()),
    ) ?? false
  )
}

function isDomainHub(model: DeclarationReflection): boolean {
  return model.comment?.blockTags.some(tag => tag.tag === '@domainHub') ?? false
}

/**
 * Return the summary text for a reflection. Function summaries live on the
 * first SignatureReflection, not the DeclarationReflection, so we check there
 * first before falling back to the declaration's own comment.
 */
function getReflectionDescription(
  reflection: DeclarationReflection,
  context: SDKThemeContext,
): string {
  const comment = reflection.signatures?.[0]?.comment ?? reflection.comment
  if (!comment) return ''
  return context.helpers.getDescriptionForComment(comment) ?? ''
}

/** Resolve a human-readable namespace name from URL parts using DOMAINS config. */
function resolveNsName(parts: string[]): string {
  const domainPath = parts[0] ?? ''
  const domain = DOMAINS.find(d => d.path === domainPath)
  if (!domain) return parts[parts.length - 2] ?? ''
  if (parts.length >= 3) {
    const sub = parts[parts.length - 2]!
    return domain.namespaces.find(n => n.subpath === sub)?.id ?? sub
  }
  return domain.namespaces[0]?.id ?? domainPath
}

/**
 * Derive a human-readable page title for frontmatter from the page model and URL.
 *
 * Synthetic pages (domain hubs, hooks pages, flow/block splits) carry generic
 * model names like "Hooks" or "Flow Components", so we enrich them with the
 * domain or namespace extracted from the page URL.
 */
export function pageTitle(page: MarkdownPageEvent): string {
  const { model, url } = page

  if (model instanceof ProjectReflection) return 'Reference'

  const decl = model as DeclarationReflection

  if (isDomainHub(decl)) return decl.name

  // Synthetic pages: model.name is a generic label; derive context from the URL.
  // URL examples: "employee/hooks.md", "employee/management/workflows.md"
  const parts = url.replace(/\.md$/, '').split('/')

  if (decl.name === 'Hooks') {
    return `Hooks`
  }
  if (decl.name === 'Flow Components') {
    return `Workflows`
  }
  if (decl.name === 'Block Components') {
    return `Sub-components`
  }

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
  return `---\n# Autogenerated by TypeDoc from TSDoc comments in the source code.\n# To update content: edit TSDoc comments in src/.\n# To update structure: edit docs-site/typedoc.config.ts or docs-site/plugins/sdk-router.ts.\n# Then run \`npm run docs:api:generate\` to regenerate.\n${yaml}\n---`
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

function renderDomainHub(context: SDKThemeContext, model: DeclarationReflection): string {
  const parts: string[] = [`# ${model.name}`, '']

  const namespaces = (model.children ?? []).filter(
    (c): c is DeclarationReflection =>
      c instanceof DeclarationReflection && c.kind === ReflectionKind.Namespace,
  )

  for (const ns of namespaces) {
    const nsUrl = context.urlTo(ns)
    const nsLabel = ns.isDeprecated() ? `~~${ns.name}~~` : ns.name
    parts.push(`## [${nsLabel}](${nsUrl})`, '')

    const nsDescription = ns.comment
      ? (context.helpers.getDescriptionForComment(ns.comment) ?? '')
      : ''
    if (nsDescription) parts.push(nsDescription, '')

    // isComponent filters out interfaces (props types), hooks, and other non-component exports.
    const componentChildren = (ns.children ?? []).filter(
      (c): c is DeclarationReflection => c instanceof DeclarationReflection && isComponent(c),
    )
    const flows = componentChildren.filter(c => c.name.endsWith('Flow'))
    const blocks = componentChildren.filter(c => !c.name.endsWith('Flow'))

    // if (flows.length > 0) {
    //   parts.push('### Workflow components', '')
    //   parts.push('| Component | Description |')
    //   parts.push('| --------- | ----------- |')
    //   for (const flow of flows) {
    //     const url = context.urlTo(flow)
    //     const description = getReflectionDescription(flow, context)
    //     parts.push(`| [${flow.name}](${url}) | ${description} |`)
    //   }
    //   parts.push('')
    // }

    // if (blocks.length > 0) {
    //   parts.push('### Sub-components', '')
    //   parts.push('| Component | Description |')
    //   parts.push('| --------- | ----------- |')
    //   for (const block of blocks) {
    //     const url = context.urlTo(block)
    //     const description = getReflectionDescription(block, context)
    //     parts.push(`| [${block.name}](${url}) | ${description} |`)
    //   }
    //   parts.push('')
    // }
  }

  const hooksNs = (context.router as SDKRouter).hooksNsByDomain.get(getDomainPath(model))
  const hookGroups = (hooksNs?.groups ?? []).filter(g => /^use[A-Z]/.test(g.title))

  if (hookGroups.length > 0) {
    parts.push('## Hooks', '')
    parts.push('| Hook | Description |')
    parts.push('| ---- | ----------- |')
    for (const group of hookGroups) {
      // groupSyntheticMembers sorts the primary hook function to the top of each group.
      const primaryHook = group.children[0] as DeclarationReflection | undefined
      if (!primaryHook) continue
      const url = context.urlTo(primaryHook)
      const description = getReflectionDescription(primaryHook, context)
      parts.push(`| [${group.title}](${url}) | ${description} |`)
    }
  }

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

  for (const [heading, items] of [
    ['Workflow components', flows],
    ['Block components', blocks],
  ] as const) {
    if (items.length === 0) continue
    parts.push(`## ${heading}`, '')
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

class SDKTheme extends MarkdownTheme {
  override getRenderContext(
    page: ConstructorParameters<typeof MarkdownThemeContext>[1],
  ): SDKThemeContext {
    return new SDKThemeContext(this, page, this.application.options)
  }
}

class SDKThemeContext extends MarkdownThemeContext {
  constructor(...args: ConstructorParameters<typeof MarkdownThemeContext>) {
    super(...args)

    const origMemberTitle = this.partials.memberTitle.bind(this)
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
        if (
          !(propsRef instanceof DeclarationReflection) ||
          propsRef.kind !== ReflectionKind.Interface ||
          propsRef.parent !== model.parent.parent
        ) {
          return result
        }
        const hashes = '#'.repeat(options.headingLevel)
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
      parametersTable: (params: ParameterReflection[]) => {
        // For a Component whose single parameter is an interface sibling in the
        // same namespace, inline the interface's properties directly instead of
        // showing a bare type reference. This renders: anchor + interface comment
        // (if any) + properties table — keeping the Props type co-located with
        // the component that uses it.
        if (params.length !== 1) return origParametersTable(params)

        const param = params[0]!
        const component = param.parent?.parent
        if (
          !(component instanceof DeclarationReflection) ||
          !isComponent(component) ||
          !(param.type instanceof ReferenceType)
        ) {
          return origParametersTable(params)
        }

        const propsRef = param.type.reflection
        if (
          !(propsRef instanceof DeclarationReflection) ||
          propsRef.kind !== ReflectionKind.Interface ||
          propsRef.parent !== component.parent
        ) {
          return origParametersTable(params)
        }

        const parts: string[] = []

        // Emit the anchor so that cross-references to this Props type still resolve.
        if (this.router.hasUrl(propsRef) && this.options.getValue('useHTMLAnchors')) {
          parts.push(`<a id="${this.router.getAnchor(propsRef)}"></a>`)
        }

        // Include any summary/remarks on the Props interface itself.
        if (propsRef.comment) {
          const commentMd = this.partials.comment(propsRef.comment, {
            showSummary: true,
            showTags: true,
          })
          if (commentMd.trim()) parts.push(commentMd)
        }

        const properties = (propsRef.children ?? []).filter(c => c.isDeclaration())
        if (properties.length > 0) {
          parts.push(
            this.partials.propertiesTable(properties, {
              isEventProps: false,
              kind: ReflectionKind.Interface,
            }),
          )
        }

        return parts.join('\n\n')
      },
    }

    const origReflectionTemplate = this.templates.reflection.bind(this)
    this.templates = {
      ...this.templates,
      reflection: (page: MarkdownPageEvent<DeclarationReflection>) => {
        if (isDomainHub(page.model)) return renderDomainHub(this, page.model)
        if (isNamespaceIndex(page.model)) return renderNamespaceIndex(this, page.model)
        return origReflectionTemplate(page)
      },
    }
  }
}

// Group order mirrors typedoc.config.ts so synthetic pages stay consistent.
const SYNTHETIC_GROUP_ORDER = [
  'Flow Components',
  'Block Components',
  'Components',
  'Form Hooks',
  'Data Hooks',
  'Utility Hooks',
  'Hooks',
  'Events',
  'Functions',
  'Variables',
  'Interfaces',
  'Type Aliases',
  'Enumerations',
]

function kindGroupName(kind: ReflectionKind): string {
  switch (kind) {
    case ReflectionKind.Function:
      return 'Functions'
    case ReflectionKind.Interface:
      return 'Interfaces'
    case ReflectionKind.TypeAlias:
      return 'Type Aliases'
    case ReflectionKind.Enum:
      return 'Enumerations'
    case ReflectionKind.Variable:
      return 'Variables'
    case ReflectionKind.Class:
      return 'Classes'
    default:
      return 'Other'
  }
}

/**
 * Build ReflectionGroups for a synthetic namespace. GroupPlugin only runs
 * during conversion, so synthetic namespaces created in buildPages need their
 * groups constructed manually.
 *
 * For the domain hooks page, pass `hookGroupMap` (built before sources are
 * cleared) so each member is grouped under its hook directory name rather than
 * a kind-based section. Priority: hookGroupMap entry → @group tag → kind name.
 *
 * Within each hook-named group the primary hook function (member whose name
 * matches the group title) is sorted to the top.
 */
function groupSyntheticMembers(
  members: DeclarationReflection[],
  owner: DeclarationReflection,
  hookGroupMap?: Map<DeclarationReflection, string>,
): ReflectionGroup[] {
  const byTitle = new Map<string, DeclarationReflection[]>()
  for (const member of members) {
    const hookGroup = hookGroupMap?.get(member)
    const tag = member.comment?.blockTags.find(t => t.tag === '@group')
    const title = hookGroup ?? tag?.content[0]?.text?.trim() ?? kindGroupName(member.kind)
    const bucket = byTitle.get(title) ?? []
    bucket.push(member)
    byTitle.set(title, bucket)
  }

  // Within each hook-named group, sort the primary hook function to the top.
  // Within all other groups, sort alphabetically by name.
  for (const [title, groupMembers] of byTitle) {
    if (/^use[A-Z]/.test(title)) {
      groupMembers.sort((a, b) => {
        if (a.name === title) return -1
        if (b.name === title) return 1
        return 0
      })
    } else {
      groupMembers.sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  const ordered = [
    ...SYNTHETIC_GROUP_ORDER.filter(t => byTitle.has(t)),
    ...Array.from(byTitle.keys()).filter(t => !SYNTHETIC_GROUP_ORDER.includes(t)),
  ]
  return ordered.map(title => {
    const group = new ReflectionGroup(title, owner)
    group.children = byTitle.get(title)!
    return group
  })
}

export class SDKRouter extends MemberRouter {
  // Populated at the start of buildPages; hooks here are anchors on a synthetic
  // domain hooks page and must be skipped when buildChildPages encounters them.
  private readonly handledHooks = new Set<DeclarationReflection>()

  // Populated at the start of buildPages; members here get a standalone page
  // and must be skipped when buildChildPages would otherwise anchor them on index.md.
  private readonly handledStandalone = new Set<DeclarationReflection>()

  // Keyed by domain.path; populated in buildPages so renderDomainHub can list hooks.
  readonly hooksNsByDomain = new Map<string, DeclarationReflection>()

  /**
   * Pre-scan for domain hooks and consolidate them into one synthetic namespace
   * page per domain (e.g. employee/hooks.md), then delegate everything else to
   * super. Each individual hook becomes an anchor on its domain's hooks page
   * rather than getting its own file.
   */
  override buildPages(project: ProjectReflection): PageDefinition[] {
    const hooksByDomain = new Map<string, DeclarationReflection[]>()
    // Capture hook directory affiliation here, before SDKRouter.clearSources
    // wipes reflection.sources. groupSyntheticMembers uses this map to group
    // each hooks-page member under its hook's name rather than a kind section.
    const hookGroupMap = new Map<DeclarationReflection, string>()

    const standaloneGroups = new Map<string, DeclarationReflection[]>()

    // Maps source directory name (e.g. 'Employee') to domain path (e.g. 'employee').
    const domainPathBySourceDir = new Map(DOMAINS.map(d => [pathToSourceDir(d.path), d.path]))

    for (const child of project.children ?? []) {
      if (child.kind === ReflectionKind.Namespace) continue

      // Standalone pages take priority: check them before the hook-file heuristic so
      // that types from files named useX.ts (e.g. ComponentsContextType from
      // useComponentContext.ts) are routed to their designated page rather than being
      // caught by isHookSourceFile and silently skipped.
      const page = standalonePageFromSources(child)
      if (page) {
        const bucket = standaloneGroups.get(page) ?? []
        bucket.push(child)
        standaloneGroups.set(page, bucket)
        this.handledStandalone.add(child)
        continue
      }

      // Route to the domain hooks page only for hooks (use[A-Z] functions) and
      // companion exports from hook files (useCamelCase.ts). Other domain exports
      // fall through to the project index as anchors.
      const isHookFn = child.kind === ReflectionKind.Function && /^use[A-Z]/.test(child.name)
      if (isHookFn || isHookSourceFile(child)) {
        const sourceDir = domainFromSources(child)
        if (sourceDir) {
          const domainPath = domainPathBySourceDir.get(sourceDir)
          if (domainPath) {
            const bucket = hooksByDomain.get(domainPath) ?? []
            bucket.push(child)
            hooksByDomain.set(domainPath, bucket)
            this.handledHooks.add(child)

            const hookDir = hookDirFromSources(child)
            if (hookDir) hookGroupMap.set(child, hookDir)
          }
        }
        continue
      }
    }

    // Remove reflections routed to synthetic pages from the project's groups so
    // they don't also render inline on the project index page. GroupPlugin
    // populates these groups before buildPages runs, so we strip handled members
    // here rather than in a converter event.
    for (const group of project.groups ?? []) {
      group.children = group.children.filter(
        c =>
          !this.handledHooks.has(c as DeclarationReflection) &&
          !this.handledStandalone.has(c as DeclarationReflection),
      )
    }
    if (project.groups) {
      project.groups = project.groups.filter(g => g.children.length > 0)
    }

    // Sources were only needed for routing; clear them before rendering so
    // typedoc-plugin-markdown doesn't emit "Defined in: <path>" on every member.
    SDKRouter.clearSources(project)

    const pages = super.buildPages(project)

    for (const [domainPath, hooks] of hooksByDomain) {
      const hooksNs = new DeclarationReflection('Hooks', ReflectionKind.Namespace, project)
      hooksNs.children = hooks
      hooksNs.groups = groupSyntheticMembers(hooks, hooksNs, hookGroupMap)
      this.buildSyntheticPage(`${domainPath}/hooks`, hooksNs, hooks, pages)
      this.hooksNsByDomain.set(domainPath, hooksNs)
    }

    for (const [page, members] of standaloneGroups) {
      const { displayName } = STANDALONE_PAGES[page]!
      const ns = new DeclarationReflection(displayName, ReflectionKind.Namespace, project)
      ns.children = members
      ns.groups = groupSyntheticMembers(members, ns)
      this.buildSyntheticPage(page, ns, members, pages)
    }

    for (const domain of DOMAINS) {
      const nsReflections = domain.namespaces
        .map(ns =>
          project.children?.find(c => c.name === ns.id && c.kind === ReflectionKind.Namespace),
        )
        .filter((r): r is DeclarationReflection => r !== undefined)

      const hubNs = new DeclarationReflection(domain.label, ReflectionKind.Namespace, project)
      hubNs.comment = new Comment()
      hubNs.comment.blockTags.push(new CommentTag('@domainHub', []))
      hubNs.comment.blockTags.push(
        new CommentTag('@domainPath', [{ kind: 'text', text: domain.path }]),
      )
      hubNs.children = nsReflections
      this.buildSyntheticPage(`${domain.path}/index`, hubNs, [], pages)
    }

    return pages
  }

  /**
   * Override page building for namespaces and unmapped project-level members.
   *
   * - Namespace with Flow children: split into workflows.md, sub-components.md, and index.md.
   * - Namespace without Flow children: one page, all children as anchors.
   * - Domain hook (in handledHooks): skip — already registered in buildPages.
   * - Other project-level reflection: anchor onto the project's index page.
   */
  override buildChildPages(reflection: Reflection, outPages: PageDefinition[]): void {
    // Domain hooks and standalone page members are handled in buildPages; skip them here.
    if (reflection instanceof DeclarationReflection && this.handledHooks.has(reflection)) {
      return
    }
    if (reflection instanceof DeclarationReflection && this.handledStandalone.has(reflection)) {
      return
    }

    if (reflection.kind === ReflectionKind.Namespace) {
      const children = (reflection as DeclarationReflection).children ?? []
      const flows = children.filter(c => c.name.endsWith('Flow'))

      if (flows.length > 0) {
        // Split namespace into workflows, sub-components, and an index page.
        // The namespace's canonical URL points to index.md for cross-references.
        const nsBasePath = NAMESPACE_PATHS[reflection.name] ?? reflection.name
        const ns = reflection as DeclarationReflection

        // Props interfaces are inlined by the parametersTable override; exclude them
        // from .children so they don't also appear as standalone entries. Register
        // them as anchors on the correct page so cross-references still resolve:
        // props for a flow component → workflows.md; props for a block component → sub-components.md.
        const allPropsSet = componentPropsInterfaces(ns)
        const flowProps: DeclarationReflection[] = []
        const blockProps: DeclarationReflection[] = []
        for (const propsIface of allPropsSet) {
          const isFlowProp = flows.some(flow =>
            flow.signatures?.some(sig =>
              sig.parameters?.some(
                p => p.type instanceof ReferenceType && p.type.reflection === propsIface,
              ),
            ),
          )
          ;(isFlowProp ? flowProps : blockProps).push(propsIface)
        }
        const blocks = children.filter(c => !c.name.endsWith('Flow') && !allPropsSet.has(c))

        const flowsNs = new DeclarationReflection(
          'Flow Components',
          ReflectionKind.Namespace,
          reflection.parent,
        )
        flowsNs.children = flows
        const flowsGroups = groupSyntheticMembers(flows, flowsNs)
        if (flowsGroups.length > 1) flowsNs.groups = flowsGroups
        this.buildSyntheticPage(
          `${nsBasePath}/workflows`,
          flowsNs,
          [...flows, ...flowProps],
          outPages,
        )

        if (blocks.length > 0) {
          const blocksNs = new DeclarationReflection(
            'Block Components',
            ReflectionKind.Namespace,
            reflection.parent,
          )
          blocksNs.children = blocks
          const blocksGroups = groupSyntheticMembers(blocks, blocksNs)
          if (blocksGroups.length > 1) blocksNs.groups = blocksGroups
          this.buildSyntheticPage(
            `${nsBasePath}/sub-components`,
            blocksNs,
            [...blocks, ...blockProps],
            outPages,
          )
        }

        // Build namespace index page; its URL becomes the canonical URL for the namespace.
        const indexNs = new DeclarationReflection(
          ns.name,
          ReflectionKind.Namespace,
          reflection.parent,
        )
        indexNs.comment = ns.comment ? ns.comment.clone() : new Comment()
        indexNs.comment.blockTags.push(new CommentTag('@namespaceIndex', []))
        indexNs.children = [...flows, ...blocks]
        const indexUrl = this.buildSyntheticPage(`${nsBasePath}/index`, indexNs, [], outPages)
        this.fullUrls.set(reflection, indexUrl)
        return
      }

      // Default: single index page with all children as anchors.
      const url = this.getFileName(this.getIdealBaseName(reflection))
      this.fullUrls.set(reflection, url)
      this.sluggers.set(reflection, new Slugger(this.sluggerConfiguration))
      outPages.push({ kind: PageKind.Reflection, model: reflection, url })
      for (const child of children) {
        this.buildAnchors(child, reflection)
      }
      return
    }

    // Anchor all remaining project-level reflections to the project's index page.
    // buildAnchors requires pageTarget to be an ancestor of the target, so passing
    // reflection.parent (the Project) keeps the slug to just the reflection's name.
    if (reflection.parent?.kind === ReflectionKind.Project) {
      this.buildAnchors(reflection, reflection.parent)
      return
    }

    super.buildChildPages(reflection, outPages)
  }

  override getIdealBaseName(reflection: Reflection): string {
    // Namespace → mapped path or bare name  (no @gusto prefix)
    if (reflection.kind === ReflectionKind.Namespace) {
      const base = NAMESPACE_PATHS[reflection.name] ?? reflection.name
      return `${base}/${this.entryFileName}`
    }

    return super.getIdealBaseName(reflection)
  }

  private static clearSources(reflection: ProjectReflection | DeclarationReflection): void {
    if (reflection instanceof DeclarationReflection) {
      reflection.sources = undefined
      for (const sig of reflection.signatures ?? []) {
        sig.sources = undefined
      }
    }
    for (const child of reflection.children ?? []) {
      SDKRouter.clearSources(child)
    }
  }

  /**
   * Register a synthetic namespace page and make every member an anchor on it.
   * Returns the page's URL.
   */
  private buildSyntheticPage(
    basePath: string,
    ns: DeclarationReflection,
    members: DeclarationReflection[],
    outPages: PageDefinition[],
  ): string {
    const url = this.getFileName(basePath)
    this.fullUrls.set(ns, url)
    const slugger = new Slugger(this.sluggerConfiguration)
    this.sluggers.set(ns, slugger)
    outPages.push({ kind: PageKind.Reflection, model: ns, url })
    for (const member of members) {
      const slug = slugger.slug(member.name)
      this.anchors.set(member, slug)
      this.fullUrls.set(member, `${url}#${slug}`)
      // Re-parent to the synthetic namespace so TypeDoc's relativeUrl walk
      // finds ns (which hasOwnDocument) before reaching Project. Without this,
      // cross-references from non-hook pages (e.g. BaseFormHookReady "Extended
      // by" on index.md) generate same-page hash links instead of cross-page URLs.
      member.parent = ns
    }
    return url
  }
}
