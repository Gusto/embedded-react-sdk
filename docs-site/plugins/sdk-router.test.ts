import { beforeAll, describe, expect, it } from 'vitest'
import {
  Application,
  DeclarationReflection,
  ProjectReflection,
  ReflectionKind,
  SourceReference,
  FileRegistry,
} from 'typedoc'
import { domainFromSources, SDKRouter } from './sdk-router'

let app: Application

beforeAll(async () => {
  app = await Application.bootstrapWithPlugins({ plugin: ['typedoc-plugin-markdown'] })
})

/**
 * Create a child reflection with the parent set both in the constructor (so
 * child.parent is populated) and via addChild (so parent.childrenIncludingDocuments
 * is populated — that's what the router's parseChildPages iterates over).
 */
function makeChild(
  parent: DeclarationReflection | ProjectReflection,
  name: string,
  kind: ReflectionKind,
): DeclarationReflection {
  const child = new DeclarationReflection(name, kind, parent)
  parent.addChild(child)
  return child
}

function makeProject() {
  return new ProjectReflection('test', new FileRegistry())
}

// SourceReference(fileName, line, character) sets both fileName and fullFileName to fileName,
// so passing the full path is sufficient for domainFromSources to work.
function sourceRef(fullFileName: string): SourceReference[] {
  return [new SourceReference(fullFileName, 1, 0)]
}

// ---------------------------------------------------------------------------
// domainFromSources
// ---------------------------------------------------------------------------

describe('domainFromSources', () => {
  it('extracts the domain segment from a src/components/{Domain}/... path', () => {
    const r = new DeclarationReflection('useEmployeeForm', ReflectionKind.Function)
    r.sources = sourceRef('/workspace/src/components/Employee/hooks/useEmployeeForm.ts')
    expect(domainFromSources(r)).toBe('Employee')
  })

  it('works for all domain directories', () => {
    for (const domain of ['Company', 'Contractor', 'Payroll', 'Flow']) {
      const r = new DeclarationReflection('foo', ReflectionKind.Function)
      r.sources = sourceRef(`/workspace/src/components/${domain}/something.ts`)
      expect(domainFromSources(r)).toBe(domain)
    }
  })

  it('returns null when sources are absent', () => {
    const r = new DeclarationReflection('foo', ReflectionKind.Function)
    expect(domainFromSources(r)).toBeNull()
  })

  it('returns null when the path does not match the expected pattern', () => {
    const r = new DeclarationReflection('foo', ReflectionKind.Function)
    r.sources = sourceRef('/workspace/src/utils/helpers.ts')
    expect(domainFromSources(r)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// getIdealBaseName — namespaces
// ---------------------------------------------------------------------------

describe('getIdealBaseName — namespaces', () => {
  it.each([
    ['EmployeeOnboarding', 'Employee/EmployeeOnboarding/README'],
    ['EmployeeManagement', 'Employee/EmployeeManagement/README'],
    ['CompanyOnboarding', 'Company/CompanyOnboarding/README'],
    ['ContractorOnboarding', 'Contractor/ContractorOnboarding/README'],
    ['Employee', 'Employee/README'],
    ['Company', 'Company/README'],
    ['Contractor', 'Contractor/README'],
  ])('%s → %s', (name, expected) => {
    const ns = new DeclarationReflection(name, ReflectionKind.Namespace)
    expect(new SDKRouter(app).getIdealBaseName(ns)).toBe(expected)
  })

  it('uses the bare namespace name for unknown namespaces', () => {
    const ns = new DeclarationReflection('UnknownNS', ReflectionKind.Namespace)
    expect(new SDKRouter(app).getIdealBaseName(ns)).toBe('UnknownNS/README')
  })
})

// ---------------------------------------------------------------------------
// getIdealBaseName — top-level functions fall through to super
// ---------------------------------------------------------------------------

describe('getIdealBaseName — top-level functions', () => {
  it('falls through to super for a top-level function (domain hooks are handled in buildPages)', () => {
    const project = makeProject()
    const fn = makeChild(project, 'someHelper', ReflectionKind.Function)
    const result = new SDKRouter(app).getIdealBaseName(fn)
    // getIdealBaseName no longer has a domain-hooks case; all hooks are routed
    // via buildPages, not getIdealBaseName
    expect(result).not.toContain('/hooks/')
  })
})

// ---------------------------------------------------------------------------
// buildPages — namespaces get one page; members become anchors
// ---------------------------------------------------------------------------

describe('buildPages — namespace routing', () => {
  it('namespace gets its own page at the mapped path', () => {
    const project = makeProject()
    makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('Employee/EmployeeManagement/README.md')
  })

  it('namespace children are anchors, not separate pages', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const member = makeChild(ns, 'SomeExport', ReflectionKind.Interface)

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(router.hasOwnDocument(member)).toBe(false)
    expect(router.getAnchor(member)).toBeDefined()
  })

  it('produces one page per mapped namespace without duplicates', () => {
    const project = makeProject()
    makeChild(project, 'EmployeeOnboarding', ReflectionKind.Namespace)
    makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(project, 'CompanyOnboarding', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const namespaceUrls = pages
      .filter(p => p.model instanceof DeclarationReflection)
      .map(p => p.url)

    expect(namespaceUrls).toContain('Employee/EmployeeOnboarding/README.md')
    expect(namespaceUrls).toContain('Employee/EmployeeManagement/README.md')
    expect(namespaceUrls).toContain('Company/CompanyOnboarding/README.md')
  })
})

// ---------------------------------------------------------------------------
// buildPages — domain hooks are consolidated onto a single page per domain
// ---------------------------------------------------------------------------

describe('buildPages — domain hook routing', () => {
  it('multiple Employee hooks share one Employee/hooks.md page', () => {
    const project = makeProject()
    const hook1 = makeChild(project, 'useHomeAddressForm', ReflectionKind.Function)
    hook1.sources = sourceRef('/workspace/src/components/Employee/hooks/useHomeAddressForm.ts')
    const hook2 = makeChild(project, 'useBankForm', ReflectionKind.Function)
    hook2.sources = sourceRef('/workspace/src/components/Employee/hooks/useBankForm.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(router.hasOwnDocument(hook1)).toBe(false)
    expect(router.hasOwnDocument(hook2)).toBe(false)
    expect(pages.map(p => p.url)).toContain('Employee/hooks.md')
    expect(pages.filter(p => p.url === 'Employee/hooks.md')).toHaveLength(1)
  })

  it('each hook gets an anchor on the domain hooks page', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useHomeAddressForm', ReflectionKind.Function)
    hook.sources = sourceRef('/workspace/src/components/Employee/hooks/useHomeAddressForm.ts')

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(router.hasOwnDocument(hook)).toBe(false)
    expect(router.getAnchor(hook)).toBeDefined()
  })

  it('hooks from different domains go to separate hooks pages', () => {
    const project = makeProject()
    const empHook = makeChild(project, 'useHomeAddressForm', ReflectionKind.Function)
    empHook.sources = sourceRef('/workspace/src/components/Employee/hooks/useHomeAddressForm.ts')
    const compHook = makeChild(project, 'usePayScheduleForm', ReflectionKind.Function)
    compHook.sources = sourceRef('/workspace/src/components/Company/hooks/usePayScheduleForm.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('Employee/hooks.md')
    expect(urls).toContain('Company/hooks.md')
  })
})

// ---------------------------------------------------------------------------
// buildPages — non-domain top-level reflections anchor to the project index
// ---------------------------------------------------------------------------

describe('buildPages — non-domain top-level anchoring', () => {
  it('top-level interface without a domain source anchors to the project index', () => {
    const project = makeProject()
    const iface = makeChild(project, 'SomeSharedType', ReflectionKind.Interface)

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(router.hasOwnDocument(iface)).toBe(false)
  })

  it('top-level function without a source path anchors rather than getting its own page', () => {
    const project = makeProject()
    const fn = makeChild(project, 'someHelper', ReflectionKind.Function)

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(router.hasOwnDocument(fn)).toBe(false)
  })
})
