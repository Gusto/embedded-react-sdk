import {
  DeclarationReflection,
  PageKind,
  type PageDefinition,
  ProjectReflection,
  type Reflection,
  ReflectionKind,
  Slugger,
} from 'typedoc'
import type { Application } from 'typedoc'
import { MemberRouter } from 'typedoc-plugin-markdown'

/**
 * TypeDoc plugin: custom router for @gusto/embedded-react-sdk
 *
 * Register via  "router": "sdk-router"  in the TypeDoc config.
 *
 * URL structure:
 *   Employee/EmployeeManagement/index.md   ← namespace page; all members are anchors
 *   Employee/EmployeeOnboarding/index.md
 *   Employee/hooks.md                      ← all Employee hooks consolidated on one page
 *   Company/hooks.md                       ← all Company hooks consolidated on one page
 *   Payroll/index.md                       ← domain-less namespace (no parent domain prefix)
 *   index.md#reflectionname               ← all unmapped top-level exports (anchors on the
 *                                           project index page, which renders them inline)
 */

// Maps each namespace to its output directory prefix.
// Journey namespaces nest under their domain; deprecated namespaces sit at the
// domain root so removing them later only deletes a single file, not a directory.
const NAMESPACE_PATHS: Record<string, string> = {
  // Journey namespaces
  EmployeeOnboarding: 'Employee/EmployeeOnboarding',
  EmployeeManagement: 'Employee/EmployeeManagement',
  CompanyOnboarding: 'Company/CompanyOnboarding',
  ContractorOnboarding: 'Contractor/ContractorOnboarding',
  // Deprecated — live at the domain root index
  Employee: 'Employee',
  Company: 'Company',
  Contractor: 'Contractor',
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

export function load(app: Application): void {
  app.renderer.defineRouter('sdk-router', SDKRouter)
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

    for (const child of project.children ?? []) {
      if (child.kind === ReflectionKind.Function) {
        const domain = domainFromSources(child)
        if (domain) {
          const bucket = hooksByDomain.get(domain) ?? []
          bucket.push(child)
          hooksByDomain.set(domain, bucket)
          this.handledHooks.add(child)
        }
      }
    }

    const pages = super.buildPages(project)

    for (const [domain, hooks] of hooksByDomain) {
      const hooksNs = new DeclarationReflection('hooks', ReflectionKind.Namespace, project)
      hooksNs.children = hooks

      const url = this.getFileName(`${domain}/hooks`)
      this.fullUrls.set(hooksNs, url)
      const slugger = new Slugger(this.sluggerConfiguration)
      this.sluggers.set(hooksNs, slugger)

      pages.push({ kind: PageKind.Reflection, model: hooksNs, url })

      for (const hook of hooks) {
        const slug = slugger.slug(hook.name)
        this.anchors.set(hook, slug)
        this.fullUrls.set(hook, `${url}#${slug}`)
      }
    }

    return pages
  }

  /**
   * Override page building for namespaces and unmapped project-level members.
   *
   * - Namespace: one page, all children become anchors.
   * - Domain hook (in handledHooks): skip — already registered in buildPages.
   * - Other project-level reflection: anchor onto the project's index page.
   */
  override buildChildPages(reflection: Reflection, outPages: PageDefinition[]): void {
    // Domain hooks are handled in buildPages; skip them here.
    if (reflection instanceof DeclarationReflection && this.handledHooks.has(reflection)) {
      return
    }

    if (reflection.kind === ReflectionKind.Namespace) {
      const url = this.getFileName(this.getIdealBaseName(reflection))
      this.fullUrls.set(reflection, url)
      this.sluggers.set(reflection, new Slugger(this.sluggerConfiguration))
      outPages.push({ kind: PageKind.Reflection, model: reflection, url })

      // Anchor every direct child; buildAnchors recurses into their children.
      for (const child of (reflection as DeclarationReflection).children ?? []) {
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
}
