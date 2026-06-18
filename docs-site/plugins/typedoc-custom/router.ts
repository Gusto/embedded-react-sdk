import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import {
  Comment,
  CommentTag,
  type Context,
  DeclarationReflection,
  PageKind,
  type PageDefinition,
  ProjectReflection,
  ReferenceType,
  type Reflection,
  ReflectionGroup,
  ReflectionKind,
  RendererEvent,
  Slugger,
} from 'typedoc'
import { MemberRouter } from 'typedoc-plugin-markdown'
import { DOMAINS, NAMESPACE_PATHS, STANDALONE_PAGES } from './router.config.ts'
import {
  componentPropsInterfaces,
  domainFromSources,
  hookDirFromSources,
  isHookSourceFile,
  pathToSourceDir,
  readFlowReadme,
  reparentDeprecatedMembers,
  standalonePageFromSources,
} from './utils.ts'

/** Convert a PascalCase name to kebab-case.
 *  'OnboardingFlow' → 'onboarding-flow',  'PayrollRunFlow' → 'payroll-run-flow' */
function toKebabCase(name: string): string {
  return name.replace(
    /([A-Z])/g,
    (_, letter: string, offset: number) => (offset > 0 ? '-' : '') + letter.toLowerCase(),
  )
}

/**
 * Return the slug for a namespace's own hub page.
 *
 * Multi-namespace domains (namespace has a subpath) → 'index'
 *   e.g. EmployeeManagement (subpath 'management') → 'index'
 *        → employee/management/index.md
 *
 * Single-namespace domains (no subpath) → 'namespace'
 *   e.g. Payroll (no subpath) → 'namespace'
 *        → payroll/namespace.md  (distinct from the domain hub at payroll/index.md)
 *
 * Falls back to 'index' for unknown namespaces (not in DOMAINS).
 */
function getNamespaceIndexSlug(namespaceName: string): string {
  for (const domain of DOMAINS) {
    const ns = domain.namespaces.find(n => n.id === namespaceName)
    if (ns) return ns.subpath ? 'index' : 'namespace'
  }
  return 'index'
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
  // Emit _category_.json files for each domain directory and namespace subdirectory
  // so Docusaurus uses our labels and ordering in the sidebar rather than inferring
  // them from directory names.
  static emitCategoryFiles(event: RendererEvent): void {
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
  }

  // Must run before CommentPlugin's RESOLVE_BEGIN handler (priority 0) so that
  // ReferenceReflections in non-deprecated namespaces haven't yet been removed by
  // excludeNotDocumented. Priority 50 = after protectPropsInterfaces (100) but
  // before CommentPlugin (0).
  static reparentDeprecated(context: Context): void {
    reparentDeprecatedMembers(context.project)
  }

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
  static stampGroupTags(context: Context): void {
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
  }

  // Populated at the start of buildPages; hooks here are anchors on a synthetic
  // domain hooks page and must be skipped when buildChildPages encounters them.
  private readonly handledHooks = new Set<DeclarationReflection>()

  // Populated at the start of buildPages; members here get a standalone page
  // and must be skipped when buildChildPages would otherwise anchor them on index.md.
  private readonly handledStandalone = new Set<DeclarationReflection>()

  // Keyed by domain.path; populated in buildPages so renderDomainHub can list hooks.
  readonly hooksNsByDomain = new Map<string, DeclarationReflection>()

  // Keyed by the flow DeclarationReflection; populated before sources are cleared
  // so the renderer can inject README prose at the top of each flow page.
  readonly flowReadmes = new Map<DeclarationReflection, string>()

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

    // Read README files for Flow components before sources are cleared. Sources
    // are the only way to locate the flow directory at this stage.
    for (const ns of project.children ?? []) {
      if (!(ns instanceof DeclarationReflection)) continue
      if (ns.kind !== ReflectionKind.Namespace) continue
      for (const member of ns.children ?? []) {
        if (!(member instanceof DeclarationReflection)) continue
        if (!member.name.endsWith('Flow')) continue
        const fp = member.sources?.[0]?.fullFileName ?? member.sources?.[0]?.fileName
        if (!fp) continue
        const readme = readFlowReadme(fp)
        if (readme) this.flowReadmes.set(member, readme)
      }
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
        // Each Flow component gets its own page; block components share sub-components.md.
        // The namespace's canonical URL points to index.md for cross-references.
        const nsBasePath = NAMESPACE_PATHS[reflection.name] ?? reflection.name
        const ns = reflection as DeclarationReflection

        // Props interfaces are inlined by the parametersTable override; exclude them
        // from .children so they don't also appear as standalone entries. Map each flow's
        // props to that flow's page; block props go on sub-components.md.
        const allPropsSet = componentPropsInterfaces(ns)
        const flowPropsMap = new Map<DeclarationReflection, DeclarationReflection[]>()
        const blockProps: DeclarationReflection[] = []
        for (const propsIface of allPropsSet) {
          const ownerFlow = flows.find(flow =>
            flow.signatures?.some(sig =>
              sig.parameters?.some(
                p => p.type instanceof ReferenceType && p.type.reflection === propsIface,
              ),
            ),
          )
          if (ownerFlow) {
            const list = flowPropsMap.get(ownerFlow) ?? []
            list.push(propsIface)
            flowPropsMap.set(ownerFlow, list)
          } else {
            blockProps.push(propsIface)
          }
        }
        const blocks = children.filter(c => !c.name.endsWith('Flow') && !allPropsSet.has(c))

        // Register each flow as its own page with its props as anchors.
        for (const flow of flows) {
          const flowUrl = this.getFileName(`${nsBasePath}/${toKebabCase(flow.name)}`)
          this.fullUrls.set(flow, flowUrl)
          const slugger = new Slugger(this.sluggerConfiguration)
          this.sluggers.set(flow, slugger)
          outPages.push({ kind: PageKind.Reflection, model: flow, url: flowUrl })
          for (const propsIface of flowPropsMap.get(flow) ?? []) {
            const slug = slugger.slug(propsIface.name)
            this.anchors.set(propsIface, slug)
            this.fullUrls.set(propsIface, `${flowUrl}#${slug}`)
            // Re-parent so TypeDoc's relativeUrl walk finds flow (which has an own URL)
            // before reaching Project. Without this, cross-references generate same-page
            // hash links instead of cross-page URLs.
            propsIface.parent = flow
          }
        }

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
        const nsIndexSlug = getNamespaceIndexSlug(ns.name)
        const indexUrl = this.buildSyntheticPage(
          `${nsBasePath}/${nsIndexSlug}`,
          indexNs,
          [],
          outPages,
        )
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
      const slug = getNamespaceIndexSlug(reflection.name)
      // Multi-namespace domains use the configured entry file name (e.g. 'index').
      // Single-namespace domains use the fixed slug 'namespace' so the namespace
      // hub (e.g. payroll/namespace.md) is distinct from the domain hub (payroll/index.md).
      return slug === 'index' ? `${base}/${this.entryFileName}` : `${base}/${slug}`
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
