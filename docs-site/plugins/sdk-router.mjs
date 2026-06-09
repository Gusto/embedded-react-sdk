import { MemberRouter } from 'typedoc-plugin-markdown'
import { PageKind, ReflectionKind, Slugger } from 'typedoc'

/**
 * TypeDoc plugin: custom router for @gusto/embedded-react-sdk
 *
 * Register via  "router": "sdk-router"  in the TypeDoc config.
 *
 * URL structure:
 *   Employee/EmployeeManagement/index.md   ← namespace page; all members are anchors
 *   Employee/EmployeeOnboarding/index.md
 *   Employee/hooks/useHomeAddressForm.md   ← top-level hook, domain derived from source path
 *   Company/CompanyOnboarding/index.md
 *   Company/hooks/usePayScheduleForm.md
 *   Payroll/index.md                       ← domain-less namespace (no parent domain prefix)
 *   index.md#reflectionname               ← all unmapped top-level exports (anchors on the
 *                                           project index page, which renders them inline)
 */

// Maps each namespace to its output directory prefix.
// Journey namespaces nest under their domain; deprecated namespaces sit at the
// domain root so removing them later only deletes a single file, not a directory.
const NAMESPACE_PATHS = {
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
function domainFromSources(reflection) {
  const source = reflection.sources?.[0]
  if (!source) return null
  const fp = source.fullFileName ?? source.fileName ?? ''
  const m = fp.match(/[/\\]src[/\\]components[/\\]([^/\\]+)[/\\]/)
  return m?.[1] ?? null
}

export function load(app) {
  app.renderer.defineRouter('sdk-router', SDKRouter)
}

class SDKRouter extends MemberRouter {
  /**
   * Override page building for namespaces: the namespace itself owns one page
   * and every member (Function, Interface, TypeAlias, Variable, …) becomes an
   * anchor on that page rather than getting its own file.
   *
   * All unmapped project-level reflections (no-domain functions, interfaces,
   * type aliases, variables) anchor onto the project's index page. The project
   * template renders them all there already; we just need the anchor URLs to
   * point at the right page with the right slug.
   */
  buildChildPages(reflection, outPages) {
    if (reflection.kind === ReflectionKind.Namespace) {
      const url = this.getFileName(this.getIdealBaseName(reflection))
      this.fullUrls.set(reflection, url)
      this.sluggers.set(reflection, new Slugger(this.sluggerConfiguration))
      outPages.push({ kind: PageKind.Reflection, model: reflection, url })

      // Anchor every direct child; buildAnchors recurses into their children.
      for (const child of reflection.children ?? []) {
        this.buildAnchors(child, reflection)
      }
      return
    }

    // Anchor unmapped project-level reflections to the project's index page.
    // buildAnchors requires pageTarget to be an ancestor of the target so the
    // slug walk stops at the right level — passing reflection.parent (the
    // Project) keeps the slug to just the reflection's own name.
    if (reflection.parent?.kind === ReflectionKind.Project) {
      const isDomainHook =
        reflection.kind === ReflectionKind.Function &&
        domainFromSources(reflection) !== null

      if (!isDomainHook) {
        this.buildAnchors(reflection, reflection.parent)
        return
      }
    }

    super.buildChildPages(reflection, outPages)
  }

  getIdealBaseName(reflection) {
    // Namespace → mapped path or bare name  (no @gusto prefix)
    if (reflection.kind === ReflectionKind.Namespace) {
      const base = NAMESPACE_PATHS[reflection.name] ?? reflection.name
      return `${base}/${this.entryFileName}`
    }

    // Top-level function → {domain}/hooks/{name}  (domain from source path)
    if (
      reflection.kind === ReflectionKind.Function &&
      reflection.parent?.kind === ReflectionKind.Project
    ) {
      const domain = domainFromSources(reflection)
      if (domain) {
        return `${domain}/hooks/${this.getReflectionAlias(reflection)}`
      }
    }

    return super.getIdealBaseName(reflection)
  }
}
