import { beforeAll, describe, expect, it } from 'vitest'
import {
  Application,
  Comment,
  CommentTag,
  DeclarationReflection,
  ParameterReflection,
  ProjectReflection,
  ReferenceType,
  ReflectionKind,
  SignatureReflection,
  SourceReference,
  FileRegistry,
} from 'typedoc'
import { componentPropsInterfaces, domainFromSources, SDKRouter } from './sdk-router'

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
    ['Employee', 'Employee/Employee/README'],
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
// buildPages — namespace flows/blocks splitting
// ---------------------------------------------------------------------------

describe('buildPages — namespace flows/blocks splitting', () => {
  it('namespace with Flow children produces flows.md and blocks.md instead of index', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(ns, 'EmployeeOnboardingFlow', ReflectionKind.Function)
    makeChild(ns, 'JobForm', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('Employee/EmployeeManagement/flows.md')
    expect(urls).toContain('Employee/EmployeeManagement/blocks.md')
    expect(urls).not.toContain('Employee/EmployeeManagement/README.md')
  })

  it('Flow members are anchors on flows.md, not separate pages', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const flow = makeChild(ns, 'EmployeeOnboardingFlow', ReflectionKind.Function)
    makeChild(ns, 'JobForm', ReflectionKind.Function)

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(router.hasOwnDocument(flow)).toBe(false)
    expect(router.getAnchor(flow)).toBeDefined()
  })

  it('non-Flow members are anchors on blocks.md, not separate pages', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(ns, 'EmployeeOnboardingFlow', ReflectionKind.Function)
    const block = makeChild(ns, 'JobForm', ReflectionKind.Function)

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(router.hasOwnDocument(block)).toBe(false)
    expect(router.getAnchor(block)).toBeDefined()
  })

  it('namespace with only Flow children produces flows.md but no blocks.md', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(ns, 'EmployeeOnboardingFlow', ReflectionKind.Function)
    makeChild(ns, 'PaymentFlow', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('Employee/EmployeeManagement/flows.md')
    expect(urls).not.toContain('Employee/EmployeeManagement/blocks.md')
  })

  it('namespace with no Flow children still gets a single index page', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(ns, 'SomeInterface', ReflectionKind.Interface)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('Employee/EmployeeManagement/README.md')
    expect(urls).not.toContain('Employee/EmployeeManagement/flows.md')
  })
})

// ---------------------------------------------------------------------------
// buildPages — domain hooks are consolidated onto a single page per domain
// ---------------------------------------------------------------------------

describe('buildPages — domain hooks page routing', () => {
  it('multiple Employee exports share one Employee/hooks.md page', () => {
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

  it('non-function domain exports (types, interfaces, enums) also go to the domain page', () => {
    const project = makeProject()
    const iface = makeChild(project, 'UseBankFormProps', ReflectionKind.Interface)
    iface.sources = sourceRef(
      '/workspace/src/components/Employee/PaymentMethod/shared/useBankForm.ts',
    )
    const alias = makeChild(project, 'BankFormFields', ReflectionKind.TypeAlias)
    alias.sources = sourceRef(
      '/workspace/src/components/Employee/PaymentMethod/shared/useBankForm.ts',
    )
    const enumChild = makeChild(project, 'BankFormErrorCodes', ReflectionKind.Enum)
    enumChild.sources = sourceRef(
      '/workspace/src/components/Employee/PaymentMethod/shared/useBankForm.ts',
    )

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(router.hasOwnDocument(iface)).toBe(false)
    expect(router.hasOwnDocument(alias)).toBe(false)
    expect(router.hasOwnDocument(enumChild)).toBe(false)
    expect(router.getAnchor(iface)).toBeDefined()
    expect(pages.map(p => p.url)).toContain('Employee/hooks.md')
  })

  it('each domain export gets an anchor on the domain page', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useHomeAddressForm', ReflectionKind.Function)
    hook.sources = sourceRef('/workspace/src/components/Employee/hooks/useHomeAddressForm.ts')

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(router.hasOwnDocument(hook)).toBe(false)
    expect(router.getAnchor(hook)).toBeDefined()
  })

  it('exports from different domains go to separate pages', () => {
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

// ---------------------------------------------------------------------------
// componentPropsInterfaces
// ---------------------------------------------------------------------------

/**
 * Mark a function reflection as a Component (the same way our converter event
 * does at runtime) so that isComponent() returns true for it.
 */
function markAsComponent(fn: DeclarationReflection): void {
  if (!fn.comment) fn.comment = new Comment()
  fn.comment.blockTags.push(new CommentTag('@group', [{ kind: 'text', text: 'Components' }]))
}

/**
 * Attach a call signature to `fn` with a single parameter whose type is a
 * resolved reference to `propsInterface`.
 *
 * ReferenceType.createResolvedReference stores the reflection's ID and resolves
 * it via project.getReflectionById, so the interface must be registered first.
 */
function attachPropsSignature(
  fn: DeclarationReflection,
  propsInterface: DeclarationReflection,
  project: ProjectReflection,
): void {
  project.registerReflection(propsInterface, undefined, undefined)
  const sig = new SignatureReflection('__call', ReflectionKind.CallSignature, fn)
  const param = new ParameterReflection('props', ReflectionKind.Parameter, sig)
  param.type = ReferenceType.createResolvedReference(propsInterface.name, propsInterface, project)
  sig.parameters = [param]
  fn.signatures = [sig]
}

describe('componentPropsInterfaces', () => {
  it('returns the Props interface used by a Component in the namespace', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const component = makeChild(ns, 'DocumentsCard', ReflectionKind.Function)
    markAsComponent(component)
    const propsIface = makeChild(ns, 'DocumentsCardProps', ReflectionKind.Interface)
    attachPropsSignature(component, propsIface, project)

    const result = componentPropsInterfaces(ns)

    expect(result.has(propsIface)).toBe(true)
    expect(result.size).toBe(1)
  })

  it('does not include standalone interfaces that are not used as component props', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const component = makeChild(ns, 'DocumentsCard', ReflectionKind.Function)
    markAsComponent(component)
    const propsIface = makeChild(ns, 'DocumentsCardProps', ReflectionKind.Interface)
    attachPropsSignature(component, propsIface, project)
    const standaloneIface = makeChild(ns, 'AlertProps', ReflectionKind.Interface)

    const result = componentPropsInterfaces(ns)

    expect(result.has(propsIface)).toBe(true)
    expect(result.has(standaloneIface)).toBe(false)
  })

  it('does not include Props interfaces from a different namespace', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const otherNs = makeChild(project, 'CompanyOnboarding', ReflectionKind.Namespace)
    const component = makeChild(ns, 'DocumentsCard', ReflectionKind.Function)
    markAsComponent(component)
    // Props interface lives in a different namespace
    const foreignIface = makeChild(otherNs, 'DocumentsCardProps', ReflectionKind.Interface)
    attachPropsSignature(component, foreignIface, project)

    const result = componentPropsInterfaces(ns)

    expect(result.size).toBe(0)
  })

  it('returns empty set for a namespace with no Components', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(ns, 'SomeInterface', ReflectionKind.Interface)

    const result = componentPropsInterfaces(ns)

    expect(result.size).toBe(0)
  })

  it('returns empty set for a namespace with Components that have no parameters', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const component = makeChild(ns, 'EmptyComponent', ReflectionKind.Function)
    markAsComponent(component)
    const sig = new SignatureReflection('__call', ReflectionKind.CallSignature, component)
    sig.parameters = []
    component.signatures = [sig]

    const result = componentPropsInterfaces(ns)

    expect(result.size).toBe(0)
  })

  it('collects Props interfaces from multiple Components in the same namespace', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)

    const compA = makeChild(ns, 'DocumentsCard', ReflectionKind.Function)
    markAsComponent(compA)
    const propsA = makeChild(ns, 'DocumentsCardProps', ReflectionKind.Interface)
    attachPropsSignature(compA, propsA, project)

    const compB = makeChild(ns, 'CompensationCard', ReflectionKind.Function)
    markAsComponent(compB)
    const propsB = makeChild(ns, 'CompensationCardProps', ReflectionKind.Interface)
    attachPropsSignature(compB, propsB, project)

    const result = componentPropsInterfaces(ns)

    expect(result.has(propsA)).toBe(true)
    expect(result.has(propsB)).toBe(true)
    expect(result.size).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// buildPages — domain hub page
// ---------------------------------------------------------------------------

describe('buildPages — domain hub page', () => {
  it('generates a hub page at {Domain}/index.md for each configured domain', () => {
    const project = makeProject()
    makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.map(p => p.url)).toContain('Employee/index.md')
  })

  it('hub page is generated even when none of the domain namespaces are present', () => {
    const project = makeProject()

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.map(p => p.url)).toContain('Employee/index.md')
  })

  it('hub model has @domainHub tag', () => {
    const project = makeProject()

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hubPage = pages.find(p => p.url === 'Employee/index.md')
    const model = hubPage?.model as DeclarationReflection
    expect(model.comment?.blockTags.some(t => t.tag === '@domainHub')).toBe(true)
  })

  it('hub model children are the namespace reflections that exist in the project', () => {
    const project = makeProject()
    const mgmt = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const deprecated = makeChild(project, 'Employee', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hubPage = pages.find(p => p.url === 'Employee/index.md')
    const model = hubPage?.model as DeclarationReflection
    expect(model.children).toContain(mgmt)
    expect(model.children).toContain(deprecated)
  })

  it('hub model children respect DOMAIN_HUBS order and exclude absent namespaces', () => {
    const project = makeProject()
    // Only EmployeeManagement exists; EmployeeOnboarding and Employee do not
    const mgmt = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hubPage = pages.find(p => p.url === 'Employee/index.md')
    const model = hubPage?.model as DeclarationReflection
    expect(model.children).toEqual([mgmt])
  })

  it('hub page is a single page, not duplicated', () => {
    const project = makeProject()
    makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(project, 'Employee', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.filter(p => p.url === 'Employee/index.md')).toHaveLength(1)
  })

  it('hub page coexists with separate namespace pages', () => {
    const project = makeProject()
    makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(project, 'Employee', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('Employee/index.md')
    expect(urls).toContain('Employee/EmployeeManagement/README.md')
    expect(urls).toContain('Employee/Employee/README.md')
  })

  it('domain hub does not suppress the domain hooks page', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useHomeAddressForm', ReflectionKind.Function)
    hook.sources = sourceRef('/workspace/src/components/Employee/hooks/useHomeAddressForm.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('Employee/index.md')
    expect(urls).toContain('Employee/hooks.md')
  })
})
