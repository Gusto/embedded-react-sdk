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
  type SignatureReflection,
  Slugger,
} from 'typedoc'
import {
  MarkdownApplication,
  MarkdownPageEvent,
  MarkdownTheme,
  MarkdownThemeContext,
  MemberRouter,
} from 'typedoc-plugin-markdown'

/**
 * TypeDoc plugin: custom router for @gusto/embedded-react-sdk
 *
 * Register via  "router": "sdk-router"  in the TypeDoc config.
 *
 * URL structure:
 *   Employee/index.md                         ← generated domain hub (namespaces + hooks overview)
 *   Employee/EmployeeManagement/flows.md      ← namespace members whose name ends with 'Flow'
 *   Employee/EmployeeManagement/blocks.md     ← remaining namespace members
 *   Employee/Employee/index.md               ← deprecated Employee namespace (single page)
 *   Employee/hooks.md                         ← all Employee hooks consolidated on one page
 *   Company/hooks.md                          ← all Company hooks consolidated on one page
 *   Payroll/index.md                          ← domain-less namespace (no parent domain prefix)
 *   index.md#reflectionname                  ← all unmapped top-level exports (anchors on the
 *                                              project index page, which renders them inline)
 */

// Maps each namespace to its output directory prefix.
// Journey namespaces nest under their domain; deprecated namespaces nest one level deeper
// so the domain root is free for the generated domain hub page.
const NAMESPACE_PATHS: Record<string, string> = {
  // Journey namespaces
  EmployeeOnboarding: 'Employee/EmployeeOnboarding',
  EmployeeManagement: 'Employee/EmployeeManagement',
  CompanyOnboarding: 'Company/CompanyOnboarding',
  ContractorOnboarding: 'Contractor/ContractorOnboarding',
  // Deprecated — nested under domain so the domain root belongs to the hub page
  Employee: 'Employee/Employee',
  Company: 'Company',
  Contractor: 'Contractor',
}

// Maps each domain to the ordered list of namespaces shown on its generated hub page.
// Deprecated namespaces should come last. When a domain graduates to a hand-authored
// index page, remove it from this map and write Employee/index.md manually instead.
const DOMAIN_HUBS: Record<string, string[]> = {
  Employee: ['EmployeeOnboarding', 'EmployeeManagement', 'Employee'],
}

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
    page.frontmatter = {
      title: pageTitle(page),
      description: pageDescription(page),
      custom_edit_url: null,
      ...page.frontmatter,
    }
  })
  app.renderer.on(MarkdownPageEvent.END, (page: MarkdownPageEvent) => {
    if (!page.frontmatter) return
    const yaml = stringifyYaml(page.frontmatter, { lineWidth: 0 }).trimEnd()
    page.contents = `---\n${yaml}\n---\n\n${page.contents}`
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
 * Derive a human-readable page title for frontmatter from the page model and URL.
 *
 * Synthetic pages (domain hubs, hooks pages, flow/block splits) carry generic
 * model names like "Hooks" or "Flow Components", so we enrich them with the
 * domain or namespace extracted from the page URL.
 */
export function pageTitle(page: MarkdownPageEvent): string {
  const { model, url } = page

  if (model instanceof ProjectReflection) return 'API Reference'

  const decl = model as DeclarationReflection

  if (isDomainHub(decl)) return decl.name

  // Synthetic pages: model.name is a generic label; derive context from the URL.
  // URL examples: "Employee/hooks.md", "Employee/EmployeeManagement/flows.md"
  const parts = url.replace(/\.md$/, '').split('/')

  if (decl.name === 'Hooks') {
    const domain = parts[0] ?? ''
    return `${domain} Hooks`
  }
  if (decl.name === 'Flow Components') {
    const ns = parts[parts.length - 2] ?? decl.name
    return `${ns} Flows`
  }
  if (decl.name === 'Block Components') {
    const ns = parts[parts.length - 2] ?? decl.name
    return `${ns} Blocks`
  }

  return decl.name
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
      'API reference for @gusto/embedded-react-sdk — components, hooks, and utilities for Gusto Embedded Payroll.'
    )
  }

  const decl = model as DeclarationReflection
  const fromComment =
    decl.comment?.summary && Comment.combineDisplayParts(decl.comment.summary).trim()
  if (fromComment) return fromComment

  const title = pageTitle(page)
  return `${title} API reference.`
}

function renderDomainHub(context: SDKThemeContext, model: DeclarationReflection): string {
  const parts: string[] = [`# ${model.name}`, '']

  const namespaces = (model.children ?? []).filter(c => c.kind === ReflectionKind.Namespace)

  if (namespaces.length > 0) {
    parts.push('## Namespaces', '')
    parts.push('| Namespace | Description |')
    parts.push('| --------- | ----------- |')

    for (const ns of namespaces) {
      const url = context.urlTo(ns)
      const label = ns.isDeprecated() ? `~~${ns.name}~~` : ns.name
      const description = ns.comment
        ? (context.helpers.getDescriptionForComment(ns.comment) ?? '')
        : ''
      parts.push(`| [${label}](${url}) | ${description} |`)
    }
    parts.push('')
  }

  parts.push('## Hooks', '', `See [${model.name} Hooks](./hooks).`)

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
        if (isDomainHub(page.model)) {
          return renderDomainHub(this, page.model)
        }
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
  for (const [title, groupMembers] of byTitle) {
    if (/^use[A-Z]/.test(title)) {
      groupMembers.sort((a, b) => {
        if (a.name === title) return -1
        if (b.name === title) return 1
        return 0
      })
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

  /**
   * Pre-scan for domain hooks and consolidate them into one synthetic namespace
   * page per domain (e.g. Employee/hooks.md), then delegate everything else to
   * super. Each individual hook becomes an anchor on its domain's hooks page
   * rather than getting its own file.
   */
  override buildPages(project: ProjectReflection): PageDefinition[] {
    const hooksByDomain = new Map<string, DeclarationReflection[]>()
    // Capture hook directory affiliation here, before SDKRouter.clearSources
    // wipes reflection.sources. groupSyntheticMembers uses this map to group
    // each hooks-page member under its hook's name rather than a kind section.
    const hookGroupMap = new Map<DeclarationReflection, string>()

    for (const child of project.children ?? []) {
      if (child.kind === ReflectionKind.Namespace) continue

      // Route to the domain hooks page only for hooks (use[A-Z] functions) and
      // companion exports from hook files (useCamelCase.ts). Other domain exports
      // fall through to the project index as anchors.
      const isHookFn = child.kind === ReflectionKind.Function && /^use[A-Z]/.test(child.name)
      if (!isHookFn && !isHookSourceFile(child)) continue

      const domain = domainFromSources(child)
      if (domain) {
        const bucket = hooksByDomain.get(domain) ?? []
        bucket.push(child)
        hooksByDomain.set(domain, bucket)
        this.handledHooks.add(child)

        const hookDir = hookDirFromSources(child)
        if (hookDir) hookGroupMap.set(child, hookDir)
      }
    }

    // Remove reflections routed to synthetic domain pages from the project's
    // groups so they don't also render inline on the project index page.
    // GroupPlugin populates these groups before buildPages runs, so we strip
    // the handled members here rather than in a converter event.
    for (const group of project.groups ?? []) {
      group.children = group.children.filter(
        c => !this.handledHooks.has(c as DeclarationReflection),
      )
    }
    if (project.groups) {
      project.groups = project.groups.filter(g => g.children.length > 0)
    }

    // Sources were only needed for routing; clear them before rendering so
    // typedoc-plugin-markdown doesn't emit "Defined in: <path>" on every member.
    SDKRouter.clearSources(project)

    const pages = super.buildPages(project)

    for (const [domain, hooks] of hooksByDomain) {
      const hooksNs = new DeclarationReflection('Hooks', ReflectionKind.Namespace, project)
      hooksNs.children = hooks
      hooksNs.groups = groupSyntheticMembers(hooks, hooksNs, hookGroupMap)
      this.buildSyntheticPage(`${domain}/hooks`, hooksNs, hooks, pages)
    }

    for (const [domain, nsNames] of Object.entries(DOMAIN_HUBS)) {
      const nsReflections = nsNames
        .map(name =>
          project.children?.find(c => c.name === name && c.kind === ReflectionKind.Namespace),
        )
        .filter((r): r is DeclarationReflection => r !== undefined)

      const hubNs = new DeclarationReflection(domain, ReflectionKind.Namespace, project)
      hubNs.comment = new Comment()
      hubNs.comment.blockTags.push(new CommentTag('@domainHub', []))
      hubNs.children = nsReflections
      this.buildSyntheticPage(`${domain}/index`, hubNs, [], pages)
    }

    return pages
  }

  /**
   * Override page building for namespaces and unmapped project-level members.
   *
   * - Namespace with Flow children: split into flows.md and blocks.md pages.
   * - Namespace without Flow children: one page, all children as anchors.
   * - Domain hook (in handledHooks): skip — already registered in buildPages.
   * - Other project-level reflection: anchor onto the project's index page.
   */
  override buildChildPages(reflection: Reflection, outPages: PageDefinition[]): void {
    // Domain hooks are handled in buildPages; skip them here.
    if (reflection instanceof DeclarationReflection && this.handledHooks.has(reflection)) {
      return
    }

    if (reflection.kind === ReflectionKind.Namespace) {
      const children = (reflection as DeclarationReflection).children ?? []
      const flows = children.filter(c => c.name.endsWith('Flow'))

      if (flows.length > 0) {
        // Split namespace into flows and blocks pages.
        // The namespace's canonical URL points to flows.md for cross-references.
        const nsBasePath = NAMESPACE_PATHS[reflection.name] ?? reflection.name
        const ns = reflection as DeclarationReflection

        // Props interfaces are inlined by the parametersTable override; exclude them
        // from .children so they don't also appear as standalone entries. Register
        // them as anchors on the correct page so cross-references still resolve:
        // props for a flow component → flows.md; props for a block component → blocks.md.
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
        const flowsUrl = this.buildSyntheticPage(
          `${nsBasePath}/flows`,
          flowsNs,
          [...flows, ...flowProps],
          outPages,
        )
        this.fullUrls.set(reflection, flowsUrl)

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
            `${nsBasePath}/blocks`,
            blocksNs,
            [...blocks, ...blockProps],
            outPages,
          )
        }
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
