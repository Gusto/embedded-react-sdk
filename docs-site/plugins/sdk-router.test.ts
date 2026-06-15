import { beforeAll, describe, expect, it } from 'vitest'
import {
  Application,
  Comment,
  CommentTag,
  DeclarationReflection,
  ParameterReflection,
  ProjectReflection,
  ReferenceReflection,
  ReferenceType,
  ReflectionGroup,
  ReflectionKind,
  SignatureReflection,
  SourceReference,
  FileRegistry,
} from 'typedoc'
import { MarkdownPageEvent } from 'typedoc-plugin-markdown'
import {
  componentPropsInterfaces,
  domainFromSources,
  hookDirFromSources,
  isHookSourceFile,
  pageDescription,
  pageTitle,
  reparentDeprecatedMembers,
  SDKRouter,
} from './sdk-router'

let app: Application

beforeAll(async () => {
  app = await Application.bootstrapWithPlugins({ plugin: ['typedoc-plugin-markdown'] })
})

/**
 * Create a child reflection with the parent set both in the constructor (so
 * child.parent is populated) and via addChild (so parent.childrenIncludingDocuments
 * is populated — that's what the router's parseChildPages iterates over).
 * Also registers the child in the root project so that
 * ReferenceReflection.tryGetTargetReflection() can resolve it by ID.
 */
function makeChild(
  parent: DeclarationReflection | ProjectReflection,
  name: string,
  kind: ReflectionKind,
): DeclarationReflection {
  const child = new DeclarationReflection(name, kind, parent)
  parent.addChild(child)
  child.project.registerReflection(child, undefined, undefined)
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
// isHookSourceFile
// ---------------------------------------------------------------------------

describe('isHookSourceFile', () => {
  it('returns true for a file named useCamelCase.ts', () => {
    const r = new DeclarationReflection('UseBankFormProps', ReflectionKind.Interface)
    r.sources = sourceRef('/workspace/src/components/Employee/PaymentMethod/shared/useBankForm.ts')
    expect(isHookSourceFile(r)).toBe(true)
  })

  it('returns true for a deeply nested hook file', () => {
    const r = new DeclarationReflection('HomeAddressFields', ReflectionKind.TypeAlias)
    r.sources = sourceRef('/workspace/src/components/Employee/HomeAddress/useHomeAddressForm.ts')
    expect(isHookSourceFile(r)).toBe(true)
  })

  it('returns true for a companion file inside a hook directory', () => {
    const r = new DeclarationReflection('SelectStateTaxFieldProps', ReflectionKind.Interface)
    r.sources = sourceRef(
      '/workspace/src/components/Employee/StateTaxes/shared/useEmployeeStateTaxesForm/fields.tsx',
    )
    expect(isHookSourceFile(r)).toBe(true)
  })

  it('returns true for any file nested under a hook directory', () => {
    const r = new DeclarationReflection('EmployeeStateTaxesErrorCodes', ReflectionKind.Enum)
    r.sources = sourceRef(
      '/workspace/src/components/Employee/StateTaxes/shared/useEmployeeStateTaxesForm/fieldProps.ts',
    )
    expect(isHookSourceFile(r)).toBe(true)
  })

  it('returns false for a non-hook file name', () => {
    const r = new DeclarationReflection('SomeUtil', ReflectionKind.Function)
    r.sources = sourceRef('/workspace/src/components/Employee/utils/helpers.ts')
    expect(isHookSourceFile(r)).toBe(false)
  })

  it('returns false for a file starting with use but no uppercase letter', () => {
    const r = new DeclarationReflection('useless', ReflectionKind.Function)
    r.sources = sourceRef('/workspace/src/components/Employee/useless.ts')
    expect(isHookSourceFile(r)).toBe(false)
  })

  it('returns false when sources are absent', () => {
    const r = new DeclarationReflection('UseBankFormProps', ReflectionKind.Interface)
    expect(isHookSourceFile(r)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// hookDirFromSources
// ---------------------------------------------------------------------------

describe('hookDirFromSources', () => {
  it('returns the hook directory name for a companion file inside a hook directory', () => {
    const r = new DeclarationReflection('CompensationFormFields', ReflectionKind.Interface)
    r.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/fields.tsx',
    )
    expect(hookDirFromSources(r)).toBe('useCompensationForm')
  })

  it('returns the hook name for a flat hook file (no subdirectory)', () => {
    const r = new DeclarationReflection('UseBankFormProps', ReflectionKind.Interface)
    r.sources = sourceRef('/workspace/src/components/Employee/PaymentMethod/shared/useBankForm.ts')
    expect(hookDirFromSources(r)).toBe('useBankForm')
  })

  it('returns the hook directory when the hook function file shares the directory name', () => {
    const r = new DeclarationReflection('useCompensationForm', ReflectionKind.Function)
    r.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx',
    )
    expect(hookDirFromSources(r)).toBe('useCompensationForm')
  })

  it('returns the first matching hook segment for deeply nested paths', () => {
    const r = new DeclarationReflection('EmployeeStateTaxesErrorCodes', ReflectionKind.Variable)
    r.sources = sourceRef(
      '/workspace/src/components/Employee/StateTaxes/shared/useEmployeeStateTaxesForm/fieldProps.ts',
    )
    expect(hookDirFromSources(r)).toBe('useEmployeeStateTaxesForm')
  })

  it('returns null for a non-hook file', () => {
    const r = new DeclarationReflection('SomeUtil', ReflectionKind.Function)
    r.sources = sourceRef('/workspace/src/components/Employee/utils/helpers.ts')
    expect(hookDirFromSources(r)).toBeNull()
  })

  it('returns null when sources are absent', () => {
    const r = new DeclarationReflection('UseBankFormProps', ReflectionKind.Interface)
    expect(hookDirFromSources(r)).toBeNull()
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
// buildPages — props interfaces excluded from standalone rendering
// ---------------------------------------------------------------------------

describe('buildPages — props interfaces excluded from standalone rendering', () => {
  it('flow component props are not rendered as standalone children of the flows model', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const flow = makeChild(ns, 'DashboardFlow', ReflectionKind.Function)
    markAsComponent(flow)
    const propsIface = makeChild(ns, 'DashboardFlowProps', ReflectionKind.Interface)
    attachPropsSignature(flow, propsIface, project)
    makeChild(ns, 'JobForm', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const flowsModel = pages.find(p => p.url === 'Employee/EmployeeManagement/flows.md')
      ?.model as DeclarationReflection
    expect(flowsModel.children).not.toContain(propsIface)
    expect(router.hasOwnDocument(propsIface)).toBe(false)
    expect(router.getAnchor(propsIface)).toBeDefined()
  })

  it('flow component props are anchored on flows.md, not blocks.md', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const flow = makeChild(ns, 'DashboardFlow', ReflectionKind.Function)
    markAsComponent(flow)
    const propsIface = makeChild(ns, 'DashboardFlowProps', ReflectionKind.Interface)
    attachPropsSignature(flow, propsIface, project)
    makeChild(ns, 'JobForm', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const blocksModel = pages.find(p => p.url === 'Employee/EmployeeManagement/blocks.md')
      ?.model as DeclarationReflection
    expect(blocksModel.children).not.toContain(propsIface)
  })

  it('block component props are not rendered as standalone children of the blocks model', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(ns, 'DashboardFlow', ReflectionKind.Function)
    const block = makeChild(ns, 'CompensationCard', ReflectionKind.Function)
    markAsComponent(block)
    const propsIface = makeChild(ns, 'CompensationCardProps', ReflectionKind.Interface)
    attachPropsSignature(block, propsIface, project)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const blocksModel = pages.find(p => p.url === 'Employee/EmployeeManagement/blocks.md')
      ?.model as DeclarationReflection
    expect(blocksModel.children).not.toContain(propsIface)
    expect(router.hasOwnDocument(propsIface)).toBe(false)
    expect(router.getAnchor(propsIface)).toBeDefined()
  })

  it('namespace with only flows + their props does not produce a blocks page', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const flow = makeChild(ns, 'DashboardFlow', ReflectionKind.Function)
    markAsComponent(flow)
    const propsIface = makeChild(ns, 'DashboardFlowProps', ReflectionKind.Interface)
    attachPropsSignature(flow, propsIface, project)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('Employee/EmployeeManagement/flows.md')
    expect(urls).not.toContain('Employee/EmployeeManagement/blocks.md')
    expect(router.getAnchor(propsIface)).toBeDefined()
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

  it('domain export from a non-hook file is NOT routed to hooks.md', () => {
    const project = makeProject()
    const helper = makeChild(project, 'formatDate', ReflectionKind.Function)
    helper.sources = sourceRef('/workspace/src/components/Employee/utils/helpers.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.map(p => p.url)).not.toContain('Employee/hooks.md')
    // Falls through to project index anchor instead
    expect(router.hasOwnDocument(helper)).toBe(false)
  })

  it('hook function without a domain source does not create a hooks page', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useCustomHook', ReflectionKind.Function)
    // No sources — domainFromSources returns null

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.map(p => p.url)).not.toContain('Employee/hooks.md')
    expect(router.hasOwnDocument(hook)).toBe(false)
  })

  it('handled hooks are removed from project groups so they do not also render on the project index', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useHomeAddressForm', ReflectionKind.Function)
    hook.sources = sourceRef('/workspace/src/components/Employee/hooks/useHomeAddressForm.ts')

    // Simulate GroupPlugin having placed the hook into a project group
    const group = new ReflectionGroup('Hooks', hook)
    project.groups = [group]

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(project.groups?.flatMap(g => g.children)).not.toContain(hook)
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

  it('works at the project level — returns Props interface for a top-level Component', () => {
    const project = makeProject()
    const component = makeChild(project, 'ApiProvider', ReflectionKind.Function)
    markAsComponent(component)
    const propsIface = makeChild(project, 'ApiProviderProps', ReflectionKind.Interface)
    attachPropsSignature(component, propsIface, project)

    const result = componentPropsInterfaces(project)

    expect(result.has(propsIface)).toBe(true)
    expect(result.size).toBe(1)
  })

  it('does not include project-level Props whose parent is a namespace, not the project', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const component = makeChild(project, 'ApiProvider', ReflectionKind.Function)
    markAsComponent(component)
    // Props interface lives in a namespace, not the project
    const nsIface = makeChild(ns, 'ApiProviderProps', ReflectionKind.Interface)
    attachPropsSignature(component, nsIface, project)

    const result = componentPropsInterfaces(project)

    expect(result.size).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// reparentDeprecatedMembers
// ---------------------------------------------------------------------------

function markAsDeprecated(ns: DeclarationReflection): void {
  if (!ns.comment) ns.comment = new Comment()
  ns.comment.blockTags.push(new CommentTag('@deprecated', []))
}

function makeRef(
  name: string,
  target: DeclarationReflection,
  parent: DeclarationReflection | ProjectReflection,
): ReferenceReflection {
  const ref = new ReferenceReflection(name, target, parent)
  parent.addChild(ref)
  return ref
}

describe('reparentDeprecatedMembers', () => {
  it('moves the declaration to the non-deprecated namespace and removes the reference', () => {
    const project = makeProject()
    const deprecated = makeChild(project, 'Employee', ReflectionKind.Namespace)
    markAsDeprecated(deprecated)
    const active = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)

    const member = makeChild(deprecated, 'DashboardFlow', ReflectionKind.Function)
    makeRef('DashboardFlow', member, active)

    reparentDeprecatedMembers(project)

    expect(active.children).toContain(member)
    expect(member.parent).toBe(active)
    // removeChild deletes the children property entirely when it empties
    expect(deprecated.children?.includes(member) ?? false).toBe(false)
    expect(active.children?.every(c => !(c instanceof ReferenceReflection))).toBe(true)
  })

  it('moves multiple members from the same deprecated namespace', () => {
    const project = makeProject()
    const deprecated = makeChild(project, 'Employee', ReflectionKind.Namespace)
    markAsDeprecated(deprecated)
    const active = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)

    const memberA = makeChild(deprecated, 'DashboardFlow', ReflectionKind.Function)
    const memberB = makeChild(deprecated, 'HomeAddress', ReflectionKind.Function)
    makeRef('DashboardFlow', memberA, active)
    makeRef('HomeAddress', memberB, active)

    reparentDeprecatedMembers(project)

    expect(active.children).toContain(memberA)
    expect(active.children).toContain(memberB)
    // removeChild deletes the children property entirely when it empties
    expect(deprecated.children == null || deprecated.children.length === 0).toBe(true)
  })

  it('leaves members that exist only in the deprecated namespace', () => {
    const project = makeProject()
    const deprecated = makeChild(project, 'Employee', ReflectionKind.Namespace)
    markAsDeprecated(deprecated)
    makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)

    const onlyInDeprecated = makeChild(deprecated, 'OldComponent', ReflectionKind.Function)

    reparentDeprecatedMembers(project)

    expect(deprecated.children).toContain(onlyInDeprecated)
  })

  it('ignores references between two non-deprecated namespaces', () => {
    const project = makeProject()
    const nsA = makeChild(project, 'EmployeeOnboarding', ReflectionKind.Namespace)
    const nsB = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)

    const member = makeChild(nsA, 'SomeComponent', ReflectionKind.Function)
    const ref = makeRef('SomeComponent', member, nsB)

    reparentDeprecatedMembers(project)

    expect(nsA.children).toContain(member)
    expect(member.parent).toBe(nsA)
    expect(nsB.children).toContain(ref)
  })

  it('does nothing when there are no deprecated namespaces', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const member = makeChild(ns, 'DashboardFlow', ReflectionKind.Function)

    reparentDeprecatedMembers(project)

    expect(ns.children).toContain(member)
    expect(member.parent).toBe(ns)
  })
})

// ---------------------------------------------------------------------------
// buildPages — hook directory controls grouping on domain hooks page
//
// groupSyntheticMembers uses hookGroupMap (built from source paths before they
// are cleared) as the primary group key. Each member lands in the group named
// after its hook directory, regardless of any @group tag. @group is only
// consulted as a fallback when no hook directory is present, and kind-based
// grouping is the last resort.
// ---------------------------------------------------------------------------

describe('buildPages — hook directory controls grouping on domain hooks page', () => {
  it('hook function is grouped under its own hook directory name', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useCompensationForm', ReflectionKind.Function)
    hook.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx',
    )

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hooksModel = pages.find(p => p.url === 'Employee/hooks.md')
      ?.model as DeclarationReflection
    const group = hooksModel.groups?.find(g => g.title === 'useCompensationForm')
    expect(group).toBeDefined()
    expect(group!.children).toContain(hook)
  })

  it('companion type from the same hook directory goes to that hook group', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useCompensationForm', ReflectionKind.Function)
    hook.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx',
    )
    const errorCodes = makeChild(project, 'CompensationErrorCodes', ReflectionKind.Variable)
    errorCodes.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/compensationSchema.ts',
    )
    const propsIface = makeChild(project, 'UseCompensationFormProps', ReflectionKind.Interface)
    propsIface.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx',
    )

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hooksModel = pages.find(p => p.url === 'Employee/hooks.md')
      ?.model as DeclarationReflection
    const group = hooksModel.groups?.find(g => g.title === 'useCompensationForm')
    expect(group).toBeDefined()
    expect(group!.children).toContain(hook)
    expect(group!.children).toContain(errorCodes)
    expect(group!.children).toContain(propsIface)
  })

  it('hook directory takes priority over an explicit @group tag', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useCompensationForm', ReflectionKind.Function)
    hook.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx',
    )
    // Explicit @group would previously have placed this in 'Data Hooks'
    hook.comment = new Comment()
    hook.comment.blockTags.push(new CommentTag('@group', [{ kind: 'text', text: 'Data Hooks' }]))

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hooksModel = pages.find(p => p.url === 'Employee/hooks.md')
      ?.model as DeclarationReflection
    const hookDirGroup = hooksModel.groups?.find(g => g.title === 'useCompensationForm')
    const tagGroup = hooksModel.groups?.find(g => g.title === 'Data Hooks')
    expect(hookDirGroup).toBeDefined()
    expect(hookDirGroup!.children).toContain(hook)
    expect(tagGroup).toBeUndefined()
  })

  it('members from different hook directories land in separate groups', () => {
    const project = makeProject()

    const compHook = makeChild(project, 'useCompensationForm', ReflectionKind.Function)
    compHook.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx',
    )
    const jobHook = makeChild(project, 'useJobForm', ReflectionKind.Function)
    jobHook.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useJobForm/useJobForm.tsx',
    )
    const stateTaxHelper = makeChild(project, 'useStateFields', ReflectionKind.Function)
    stateTaxHelper.sources = sourceRef(
      '/workspace/src/components/Employee/StateTaxes/shared/useEmployeeStateTaxesForm/fields.tsx',
    )

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hooksModel = pages.find(p => p.url === 'Employee/hooks.md')
      ?.model as DeclarationReflection
    const compGroup = hooksModel.groups?.find(g => g.title === 'useCompensationForm')
    const jobGroup = hooksModel.groups?.find(g => g.title === 'useJobForm')
    const stateTaxGroup = hooksModel.groups?.find(g => g.title === 'useEmployeeStateTaxesForm')

    expect(compGroup?.children).toContain(compHook)
    expect(jobGroup?.children).toContain(jobHook)
    expect(stateTaxGroup?.children).toContain(stateTaxHelper)
    expect(compGroup?.children).not.toContain(jobHook)
    expect(compGroup?.children).not.toContain(stateTaxHelper)
  })

  it('primary hook function is sorted first within its hook group', () => {
    const project = makeProject()
    const errorCodes = makeChild(project, 'CompensationErrorCodes', ReflectionKind.Variable)
    errorCodes.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/compensationSchema.ts',
    )
    const hook = makeChild(project, 'useCompensationForm', ReflectionKind.Function)
    hook.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx',
    )
    const propsIface = makeChild(project, 'UseCompensationFormProps', ReflectionKind.Interface)
    propsIface.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx',
    )

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hooksModel = pages.find(p => p.url === 'Employee/hooks.md')
      ?.model as DeclarationReflection
    const group = hooksModel.groups?.find(g => g.title === 'useCompensationForm')
    expect(group!.children[0]).toBe(hook)
  })

  it('hook function in a non-hook directory falls back to @group tag when present', () => {
    // A use[A-Z] function caught by isHookFn but living outside any hook directory
    // (hookDirFromSources returns null). Should fall back to an explicit @group tag.
    const project = makeProject()
    const hook = makeChild(project, 'useAddressForm', ReflectionKind.Function)
    hook.sources = sourceRef('/workspace/src/components/Employee/utils/someUtil.ts')
    hook.comment = new Comment()
    hook.comment.blockTags.push(new CommentTag('@group', [{ kind: 'text', text: 'Form Hooks' }]))

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hooksModel = pages.find(p => p.url === 'Employee/hooks.md')
      ?.model as DeclarationReflection
    const group = hooksModel.groups?.find(g => g.title === 'Form Hooks')
    expect(group?.children).toContain(hook)
  })

  it('hook function in a non-hook directory with no @group falls back to kind name', () => {
    // A use[A-Z] function outside any hook directory with no @group tag lands in 'Functions'.
    const project = makeProject()
    const hook = makeChild(project, 'useAddressForm', ReflectionKind.Function)
    hook.sources = sourceRef('/workspace/src/components/Employee/utils/someUtil.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hooksModel = pages.find(p => p.url === 'Employee/hooks.md')
      ?.model as DeclarationReflection
    const group = hooksModel.groups?.find(g => g.children.includes(hook))
    expect(group?.title).toBe('Functions')
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

// ---------------------------------------------------------------------------
// pageTitle / pageDescription — frontmatter helpers
// ---------------------------------------------------------------------------

function makePage(
  model: DeclarationReflection | ProjectReflection,
  url: string,
): MarkdownPageEvent {
  const page = new MarkdownPageEvent(model)
  page.url = url
  return page
}

function makeHubModel(name: string): DeclarationReflection {
  const hub = new DeclarationReflection(name, ReflectionKind.Namespace)
  hub.comment = new Comment()
  hub.comment.blockTags.push(new CommentTag('@domainHub', []))
  return hub
}

describe('pageTitle', () => {
  it('returns "API Reference" for the project root', () => {
    const page = makePage(makeProject(), 'index.md')
    expect(pageTitle(page)).toBe('API Reference')
  })

  it('returns the domain name for a domain hub page', () => {
    const page = makePage(makeHubModel('Employee'), 'Employee/index.md')
    expect(pageTitle(page)).toBe('Employee')
  })

  it('prefixes the domain from the URL for a hooks page', () => {
    const page = makePage(
      new DeclarationReflection('Hooks', ReflectionKind.Namespace),
      'Employee/hooks.md',
    )
    expect(pageTitle(page)).toBe('Employee Hooks')
  })

  it('prefixes the namespace from the URL for a flows page', () => {
    const page = makePage(
      new DeclarationReflection('Flow Components', ReflectionKind.Namespace),
      'Employee/EmployeeManagement/flows.md',
    )
    expect(pageTitle(page)).toBe('EmployeeManagement Flows')
  })

  it('prefixes the namespace from the URL for a blocks page', () => {
    const page = makePage(
      new DeclarationReflection('Block Components', ReflectionKind.Namespace),
      'Employee/EmployeeManagement/blocks.md',
    )
    expect(pageTitle(page)).toBe('EmployeeManagement Blocks')
  })

  it('returns the namespace name for a regular namespace page', () => {
    const page = makePage(
      new DeclarationReflection('Payroll', ReflectionKind.Namespace),
      'Payroll/index.md',
    )
    expect(pageTitle(page)).toBe('Payroll')
  })
})

describe('pageDescription', () => {
  it('uses the model comment summary when present', () => {
    const ns = new DeclarationReflection('Payroll', ReflectionKind.Namespace)
    ns.comment = new Comment([{ kind: 'text', text: 'Payroll processing components.' }])
    const page = makePage(ns, 'Payroll/index.md')
    expect(pageDescription(page)).toBe('Payroll processing components.')
  })

  it('uses the project comment summary when present', () => {
    const project = makeProject()
    project.comment = new Comment([{ kind: 'text', text: 'The embedded payroll SDK.' }])
    const page = makePage(project, 'index.md')
    expect(pageDescription(page)).toBe('The embedded payroll SDK.')
  })

  it('falls back to a branded description for the project root with no comment', () => {
    const page = makePage(makeProject(), 'index.md')
    expect(pageDescription(page)).toContain('@gusto/embedded-react-sdk')
  })

  it('falls back to "{title} API reference." for a namespace with no comment', () => {
    const page = makePage(
      new DeclarationReflection('Payroll', ReflectionKind.Namespace),
      'Payroll/index.md',
    )
    expect(pageDescription(page)).toBe('Payroll API reference.')
  })

  it('uses the derived title in the fallback for a synthetic hooks page', () => {
    const page = makePage(
      new DeclarationReflection('Hooks', ReflectionKind.Namespace),
      'Employee/hooks.md',
    )
    expect(pageDescription(page)).toBe('Employee Hooks API reference.')
  })

  it('uses the derived title in the fallback for a domain hub with no comment', () => {
    const page = makePage(makeHubModel('Employee'), 'Employee/index.md')
    expect(pageDescription(page)).toBe('Employee API reference.')
  })
})
