import { beforeAll, describe, expect, it } from 'vitest'
import {
  Application,
  Comment,
  CommentTag,
  DeclarationReflection,
  IndexedAccessType,
  IntrinsicType,
  LiteralType,
  ParameterReflection,
  ProjectReflection,
  QueryType,
  ReferenceReflection,
  ReferenceType,
  ReflectionGroup,
  ReflectionKind,
  SignatureReflection,
  SourceReference,
  TypeOperatorType,
  UnionType,
  FileRegistry,
} from 'typedoc'
import { MarkdownPageEvent } from 'typedoc-plugin-markdown'
import { SDKRouter } from './router'
import {
  defaultValueRestatesLiteralType,
  documentedUnderlyingConst,
  dropTableColumn,
  isOpaqueConstDerivedType,
  isTranslationsMember,
} from './theme'
import {
  componentPropsInterfaces,
  domainFromSources,
  hookDirFromSources,
  isHookSourceFile,
  pageDescription,
  pageTitle,
  reparentDeprecatedMembers,
  serializeFrontmatter,
  standalonePageFromSources,
} from './utils'

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
    // Multi-namespace domains (have a subpath) → use entry file name
    ['EmployeeOnboarding', 'employee/onboarding/README'],
    ['EmployeeManagement', 'employee/management/README'],
    ['CompanyOnboarding', 'company/onboarding/README'],
    ['ContractorOnboarding', 'contractor/onboarding/README'],
    // Single-namespace domains (no subpath) → use fixed 'namespace' slug
    ['Payroll', 'payroll/namespace'],
    ['TimeOff', 'time-off/namespace'],
    // Deprecated/unknown namespaces → fall through to entry file name
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

    expect(urls).toContain('employee/management/README.md')
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

    expect(namespaceUrls).toContain('employee/onboarding/README.md')
    expect(namespaceUrls).toContain('employee/management/README.md')
    expect(namespaceUrls).toContain('company/onboarding/README.md')
  })
})

// ---------------------------------------------------------------------------
// buildPages — namespace flows/blocks splitting
// ---------------------------------------------------------------------------

describe('buildPages — namespace flows/blocks splitting', () => {
  it('namespace with Flow children produces per-flow pages, blocks.md, and index.md', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(ns, 'EmployeeOnboardingFlow', ReflectionKind.Function)
    makeChild(ns, 'JobForm', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/management/employee-onboarding-flow.md')
    expect(urls).not.toContain('employee/management/workflows.md')
    expect(urls).toContain('employee/management/blocks.md')
    expect(urls).toContain('employee/management/index.md')
    expect(urls).not.toContain('employee/management/README.md')
  })

  it('each Flow member gets its own page', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const flow = makeChild(ns, 'EmployeeOnboardingFlow', ReflectionKind.Function)
    makeChild(ns, 'JobForm', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(router.hasOwnDocument(flow)).toBe(true)
    expect(pages.map(p => p.url)).toContain('employee/management/employee-onboarding-flow.md')
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

  it('namespace with only Flow children produces per-flow pages but no blocks.md', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(ns, 'EmployeeOnboardingFlow', ReflectionKind.Function)
    makeChild(ns, 'PaymentFlow', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/management/employee-onboarding-flow.md')
    expect(urls).toContain('employee/management/payment-flow.md')
    expect(urls).not.toContain('employee/management/workflows.md')
    expect(urls).not.toContain('employee/management/blocks.md')
    expect(urls).toContain('employee/management/index.md')
  })

  it('namespace with no Flow children still gets a single index page', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(ns, 'SomeInterface', ReflectionKind.Interface)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/management/README.md')
    expect(urls).not.toContain('employee/management/workflows.md')
  })

  it('single-namespace domain with Flow children uses namespace.md as hub slug', () => {
    const project = makeProject()
    const ns = makeChild(project, 'Payroll', ReflectionKind.Namespace)
    makeChild(ns, 'PayrollFlow', ReflectionKind.Function)
    makeChild(ns, 'SomeCard', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    // Flow and sub-component pages sit directly in the domain directory
    expect(urls).toContain('payroll/payroll-flow.md')
    expect(urls).toContain('payroll/blocks.md')
    // Namespace hub uses fixed 'namespace' slug (not index.md, which is the domain hub)
    expect(urls).toContain('payroll/namespace.md')
  })

  it('single-namespace domain namespace hub does not collide with the domain hub', () => {
    const project = makeProject()
    const ns = makeChild(project, 'Payroll', ReflectionKind.Namespace)
    makeChild(ns, 'PayrollFlow', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('payroll/index.mdx') // domain hub
    expect(urls).toContain('payroll/namespace.md') // namespace hub
    expect(pages.filter(p => p.url === 'payroll/index.mdx')).toHaveLength(1)
    expect(pages.filter(p => p.url === 'payroll/namespace.md')).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// buildPages — props interfaces excluded from standalone rendering
// ---------------------------------------------------------------------------

describe('buildPages — props interfaces excluded from standalone rendering', () => {
  it('flow component props are anchored on their flow page, not rendered standalone', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const flow = makeChild(ns, 'DashboardFlow', ReflectionKind.Function)
    markAsComponent(flow)
    const propsIface = makeChild(ns, 'DashboardFlowProps', ReflectionKind.Interface)
    attachPropsSignature(flow, propsIface, project)
    makeChild(ns, 'JobForm', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.map(p => p.url)).toContain('employee/management/dashboard-flow.md')
    expect(router.hasOwnDocument(propsIface)).toBe(false)
    expect(router.getAnchor(propsIface)).toBeDefined()
  })

  it('re-parents flow props onto the flow so the theme can inline them on its page', () => {
    // The parametersTable / signature overrides in theme.ts inline a component's
    // props only when the props interface is either a sibling of the component
    // (shared namespace parent) or re-parented onto the component itself. For a
    // standalone flow page the router takes the second path: it sets
    // propsIface.parent = flow so cross-references resolve to a cross-page URL.
    // If this re-parenting regresses, flow pages silently lose their Props table.
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const flow = makeChild(ns, 'DashboardFlow', ReflectionKind.Function)
    markAsComponent(flow)
    const propsIface = makeChild(ns, 'DashboardFlowProps', ReflectionKind.Interface)
    attachPropsSignature(flow, propsIface, project)

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(propsIface.parent).toBe(flow)
  })

  it('flow component props are not on blocks.md', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const flow = makeChild(ns, 'DashboardFlow', ReflectionKind.Function)
    markAsComponent(flow)
    const propsIface = makeChild(ns, 'DashboardFlowProps', ReflectionKind.Interface)
    attachPropsSignature(flow, propsIface, project)
    makeChild(ns, 'JobForm', ReflectionKind.Function)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const blocksModel = pages.find(p => p.url === 'employee/management/blocks.md')
      ?.model as DeclarationReflection
    expect(blocksModel.children).not.toContain(propsIface)
  })

  it('block component props are not rendered as standalone children of the sub-components model', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(ns, 'DashboardFlow', ReflectionKind.Function)
    const block = makeChild(ns, 'CompensationCard', ReflectionKind.Function)
    markAsComponent(block)
    const propsIface = makeChild(ns, 'CompensationCardProps', ReflectionKind.Interface)
    attachPropsSignature(block, propsIface, project)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const blocksModel = pages.find(p => p.url === 'employee/management/blocks.md')
      ?.model as DeclarationReflection
    expect(blocksModel.children).not.toContain(propsIface)
    expect(router.hasOwnDocument(propsIface)).toBe(false)
    expect(router.getAnchor(propsIface)).toBeDefined()
  })

  it('namespace with only flows + their props does not produce a sub-components page', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const flow = makeChild(ns, 'DashboardFlow', ReflectionKind.Function)
    markAsComponent(flow)
    const propsIface = makeChild(ns, 'DashboardFlowProps', ReflectionKind.Interface)
    attachPropsSignature(flow, propsIface, project)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/management/dashboard-flow.md')
    expect(urls).not.toContain('employee/management/workflows.md')
    expect(urls).not.toContain('employee/management/blocks.md')
    expect(urls).toContain('employee/management/index.md')
    expect(router.getAnchor(propsIface)).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// buildPages — domain hooks get individual pages under domain/hooks/
// ---------------------------------------------------------------------------

describe('buildPages — domain hooks page routing', () => {
  it('each hook dir gets its own page under domain/hooks/', () => {
    const project = makeProject()
    const hook1 = makeChild(project, 'useHomeAddressForm', ReflectionKind.Function)
    hook1.sources = sourceRef('/workspace/src/components/Employee/hooks/useHomeAddressForm.ts')
    const hook2 = makeChild(project, 'useBankForm', ReflectionKind.Function)
    hook2.sources = sourceRef('/workspace/src/components/Employee/hooks/useBankForm.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/hooks/index.mdx')
    expect(urls).toContain('employee/hooks/use-home-address-form.md')
    expect(urls).toContain('employee/hooks/use-bank-form.md')
    expect(urls).not.toContain('employee/hooks.md')
    // Hook functions are anchors on their hook dir page, not standalone pages.
    expect(router.hasOwnDocument(hook1)).toBe(false)
    expect(router.hasOwnDocument(hook2)).toBe(false)
  })

  it('non-function domain exports (types, interfaces, enums) are anchors on their hook dir page', () => {
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
    expect(pages.map(p => p.url)).toContain('employee/hooks/use-bank-form.md')
  })

  it('each domain export gets an anchor on its hook dir page', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useHomeAddressForm', ReflectionKind.Function)
    hook.sources = sourceRef('/workspace/src/components/Employee/hooks/useHomeAddressForm.ts')

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(router.hasOwnDocument(hook)).toBe(false)
    expect(router.getAnchor(hook)).toBeDefined()
  })

  it('exports from different domains go to separate hooks directories', () => {
    const project = makeProject()
    const empHook = makeChild(project, 'useHomeAddressForm', ReflectionKind.Function)
    empHook.sources = sourceRef('/workspace/src/components/Employee/hooks/useHomeAddressForm.ts')
    const compHook = makeChild(project, 'usePayScheduleForm', ReflectionKind.Function)
    compHook.sources = sourceRef('/workspace/src/components/Company/hooks/usePayScheduleForm.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/hooks/index.mdx')
    expect(urls).toContain('company/hooks/index.mdx')
  })

  it('domain export from a non-hook file is NOT routed to any hooks page', () => {
    const project = makeProject()
    const helper = makeChild(project, 'formatDate', ReflectionKind.Function)
    helper.sources = sourceRef('/workspace/src/components/Employee/utils/helpers.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls.some(u => u.startsWith('employee/hooks/'))).toBe(false)
    // Falls through to project index anchor instead
    expect(router.hasOwnDocument(helper)).toBe(false)
  })

  it('hook function without a domain source does not create a hooks page', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useCustomHook', ReflectionKind.Function)
    // No sources — domainFromSources returns null

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls.some(u => u.startsWith('employee/hooks/'))).toBe(false)
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
// relocateI18nTypes (moves the i18n types onto the Translations page)
// ---------------------------------------------------------------------------

describe('relocateI18nTypes', () => {
  type RelocateContext = Parameters<typeof SDKRouter.relocateI18nTypes>[0]

  // Selection is by source path (i18n/types or types/Helpers) + `@group Utility types`.
  function makeI18nType(
    project: ProjectReflection,
    name: string,
    kind: ReflectionKind,
    fullFileName: string,
  ): DeclarationReflection {
    const ref = makeChild(project, name, kind)
    ref.sources = sourceRef(fullFileName)
    ref.comment = new Comment()
    ref.comment.blockTags.push(new CommentTag('@group', [{ kind: 'text', text: 'Utility types' }]))
    return ref
  }

  it('reparents source+group-matched i18n types under Translations, keeping their natural group', () => {
    const project = makeProject()
    const translations = makeChild(project, 'Translations', ReflectionKind.Namespace)
    const resources = makeI18nType(
      project,
      'Resources',
      ReflectionKind.Interface,
      '/workspace/src/i18n/types.d.ts',
    )
    const dictionary = makeI18nType(
      project,
      'ResourceDictionary',
      ReflectionKind.TypeAlias,
      '/workspace/src/types/Helpers.d.ts',
    )
    const deepPartial = makeI18nType(
      project,
      'DeepPartial',
      ReflectionKind.TypeAlias,
      '/workspace/src/types/Helpers.d.ts',
    )
    const unrelated = makeChild(project, 'APIConfig', ReflectionKind.Interface)

    SDKRouter.relocateI18nTypes({ project } as unknown as RelocateContext)

    for (const ref of [resources, dictionary, deepPartial]) {
      expect(ref.parent).toBe(translations)
      expect(translations.children).toContain(ref)
      // The source `@group` is left untouched so the type renders under its
      // natural section (here "Utility types") on the Translations page.
      const groupTags = ref.comment?.blockTags.filter(t => t.tag === '@group') ?? []
      expect(groupTags).toHaveLength(1)
      expect(groupTags[0]?.content[0]?.text).toBe('Utility types')
    }
    // Removed from the project so they no longer render on the index page.
    expect(project.children).not.toContain(resources)
    expect(project.children).toContain(unrelated)
  })

  it('leaves same-file exports outside the matched group in place', () => {
    const project = makeProject()
    makeChild(project, 'Translations', ReflectionKind.Namespace)
    // Same source file as the dictionary types, but no `@group Utility types`.
    const machineEvent = makeChild(project, 'MachineEventType', ReflectionKind.TypeAlias)
    machineEvent.sources = sourceRef('/workspace/src/types/Helpers.d.ts')

    SDKRouter.relocateI18nTypes({ project } as unknown as RelocateContext)

    expect(project.children).toContain(machineEvent)
    expect(machineEvent.parent).toBe(project)
  })

  it('is a no-op when there is no Translations namespace', () => {
    const project = makeProject()
    const resources = makeI18nType(
      project,
      'Resources',
      ReflectionKind.Interface,
      '/workspace/src/i18n/types.d.ts',
    )

    SDKRouter.relocateI18nTypes({ project } as unknown as RelocateContext)

    expect(project.children).toContain(resources)
    expect(resources.parent).toBe(project)
  })
})

// ---------------------------------------------------------------------------
// groupTranslationInterfaces (stamps the leaf key interfaces @group Translation namespaces)
// ---------------------------------------------------------------------------

describe('groupTranslationInterfaces', () => {
  type GroupContext = Parameters<typeof SDKRouter.groupTranslationInterfaces>[0]

  const groupOf = (ref: DeclarationReflection): string | undefined =>
    ref.comment?.blockTags.find(t => t.tag === '@group')?.content[0]?.text

  it('stamps the leaf key interfaces without touching already-grouped members', () => {
    const project = makeProject()
    const translations = makeChild(project, 'Translations', ReflectionKind.Namespace)
    const keyInterface = makeChild(translations, 'CompanyAddresses', ReflectionKind.Interface)
    // A relocated i18n type already carries its own @group and must be left alone.
    const relocated = makeChild(translations, 'GlobalResourceDictionary', ReflectionKind.Interface)
    relocated.comment = new Comment()
    relocated.comment.blockTags.push(
      new CommentTag('@group', [{ kind: 'text', text: 'Utility types' }]),
    )

    SDKRouter.groupTranslationInterfaces({ project } as unknown as GroupContext)

    expect(groupOf(keyInterface)).toBe('Translation namespaces')
    expect(groupOf(relocated)).toBe('Utility types')
  })

  it('is a no-op when there is no Translations namespace', () => {
    const project = makeProject()
    const iface = makeChild(project, 'CompanyAddresses', ReflectionKind.Interface)

    SDKRouter.groupTranslationInterfaces({ project } as unknown as GroupContext)

    expect(iface.comment?.blockTags.some(t => t.tag === '@group')).toBeFalsy()
  })
})

// ---------------------------------------------------------------------------
// buildPages — hook directory controls per-hook page membership
//
// Each hook directory gets its own page under domain/hooks/. groupSyntheticMembers
// uses hookGroupMap (built from source paths before they are cleared) as the
// primary group key within that page. @group is only consulted as a fallback
// when no hook directory is present, and kind-based grouping is the last resort.
// ---------------------------------------------------------------------------

describe('buildPages — hook directory controls per-hook page membership', () => {
  it('hook function gets its own page named after its hook directory', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useCompensationForm', ReflectionKind.Function)
    hook.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx',
    )

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/hooks/use-compensation-form.md')
    // The hook function is an anchor on that page, not its own document.
    expect(router.hasOwnDocument(hook)).toBe(false)
    expect(router.getAnchor(hook)).toBeDefined()
  })

  it('companion types from the same hook directory are anchors on that hook page', () => {
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

    const hookPageModel = pages.find(p => p.url === 'employee/hooks/use-compensation-form.md')
      ?.model as DeclarationReflection
    expect(hookPageModel).toBeDefined()
    expect(hookPageModel.children).toContain(hook)
    expect(hookPageModel.children).toContain(errorCodes)
    expect(hookPageModel.children).toContain(propsIface)
  })

  it('hook directory takes priority over an explicit @group tag for page assignment', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useCompensationForm', ReflectionKind.Function)
    hook.sources = sourceRef(
      '/workspace/src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx',
    )
    hook.comment = new Comment()
    hook.comment.blockTags.push(new CommentTag('@group', [{ kind: 'text', text: 'Data hooks' }]))

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    // Goes to its hook dir page, not a 'Data hooks' page.
    expect(urls).toContain('employee/hooks/use-compensation-form.md')
    expect(urls.some(u => u.includes('data-hooks'))).toBe(false)
  })

  it('hooks from different directories get separate pages', () => {
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
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/hooks/use-compensation-form.md')
    expect(urls).toContain('employee/hooks/use-job-form.md')
    expect(urls).toContain('employee/hooks/use-employee-state-taxes-form.md')

    const compPage = pages.find(p => p.url === 'employee/hooks/use-compensation-form.md')
      ?.model as DeclarationReflection
    const jobPage = pages.find(p => p.url === 'employee/hooks/use-job-form.md')
      ?.model as DeclarationReflection
    expect(compPage.children).toContain(compHook)
    expect(jobPage.children).toContain(jobHook)
    expect(compPage.children).not.toContain(jobHook)
  })

  it('hook page members are grouped by kind within the page', () => {
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

    const hookPageModel = pages.find(p => p.url === 'employee/hooks/use-compensation-form.md')
      ?.model as DeclarationReflection
    expect(hookPageModel).toBeDefined()
    expect(hookPageModel.children).toContain(hook)
    expect(hookPageModel.children).toContain(errorCodes)
    expect(hookPageModel.children).toContain(propsIface)
    // The hook function keeps its own group; everything else (variables,
    // interfaces, type aliases) collapses into a single Utility types group.
    expect(hookPageModel.groups?.find(g => g.title === 'Functions')?.children).toContain(hook)
    const utilityTypes = hookPageModel.groups?.find(g => g.title === 'Utility types')?.children
    expect(utilityTypes).toContain(errorCodes)
    expect(utilityTypes).toContain(propsIface)
  })

  it('hook function in a non-hook directory falls back to @group tag when present', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useAddressForm', ReflectionKind.Function)
    hook.sources = sourceRef('/workspace/src/components/Employee/utils/someUtil.ts')
    hook.comment = new Comment()
    hook.comment.blockTags.push(new CommentTag('@group', [{ kind: 'text', text: 'Form hooks' }]))

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    // No hook directory → falls back to hook name as dir key, gets its own page
    const hookPage = pages.find(p => p.url === 'employee/hooks/use-address-form.md')
      ?.model as DeclarationReflection
    expect(hookPage).toBeDefined()
    // Within that page, the @group tag controls the group title.
    const group = hookPage.groups?.find(g => g.title === 'Form hooks')
    expect(group?.children).toContain(hook)
  })

  it('hook function in a non-hook directory with no @group falls back to kind name', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useAddressForm', ReflectionKind.Function)
    hook.sources = sourceRef('/workspace/src/components/Employee/utils/someUtil.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hookPage = pages.find(p => p.url === 'employee/hooks/use-address-form.md')
      ?.model as DeclarationReflection
    expect(hookPage).toBeDefined()
    const group = hookPage.groups?.find(g => g.children.includes(hook))
    expect(group?.title).toBe('Functions')
  })
})

// ---------------------------------------------------------------------------
// standalonePageFromSources
// ---------------------------------------------------------------------------

describe('standalonePageFromSources', () => {
  it('returns the theme-variables page for a ThemeProvider source file', () => {
    const r = new DeclarationReflection('GustoSDKTheme', ReflectionKind.TypeAlias)
    r.sources = sourceRef('/workspace/src/contexts/ThemeProvider/types.ts')
    expect(standalonePageFromSources(r)).toBe('theme-variables')
  })

  it('returns the theme-variables page for any file under the ThemeProvider directory', () => {
    const r = new DeclarationReflection('createTheme', ReflectionKind.Function)
    r.sources = sourceRef('/workspace/src/contexts/ThemeProvider/theme.ts')
    expect(standalonePageFromSources(r)).toBe('theme-variables')
  })

  it('returns the utilities page for a partner-hook-utils source file', () => {
    const r = new DeclarationReflection('composeErrorHandler', ReflectionKind.Function)
    r.sources = sourceRef('/workspace/src/partner-hook-utils/composeErrorHandler.ts')
    expect(standalonePageFromSources(r)).toBe('utilities')
  })

  it('returns the utilities page for a file nested under partner-hook-utils', () => {
    const r = new DeclarationReflection('composeSubmitHandler', ReflectionKind.Function)
    r.sources = sourceRef('/workspace/src/partner-hook-utils/form/composeSubmitHandler.ts')
    expect(standalonePageFromSources(r)).toBe('utilities')
  })

  it('returns null when sources are absent', () => {
    const r = new DeclarationReflection('GustoSDKTheme', ReflectionKind.TypeAlias)
    expect(standalonePageFromSources(r)).toBeNull()
  })

  it('returns null for a path that does not match any STANDALONE_PAGES key', () => {
    const r = new DeclarationReflection('SomeUtil', ReflectionKind.Function)
    r.sources = sourceRef('/workspace/src/utils/helpers.ts')
    expect(standalonePageFromSources(r)).toBeNull()
  })

  it('returns the component-inventory page for a Common UI types file (TypeDoc resolves re-exports to their definition)', () => {
    const r = new DeclarationReflection('AlertProps', ReflectionKind.Interface)
    r.sources = sourceRef('/workspace/src/components/Common/UI/Alert/AlertTypes.ts')
    expect(standalonePageFromSources(r)).toBe('component-inventory')
  })

  it('returns null for a src/components path (those go to domain or hook pages, not standalone)', () => {
    const r = new DeclarationReflection('useSomething', ReflectionKind.Function)
    r.sources = sourceRef('/workspace/src/components/Employee/hooks/useSomething.ts')
    expect(standalonePageFromSources(r)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// buildPages — standalone page routing
// ---------------------------------------------------------------------------

describe('buildPages — standalone page routing', () => {
  it('ThemeProvider export gets its own page at theme-variables.md', () => {
    const project = makeProject()
    const themeType = makeChild(project, 'GustoSDKTheme', ReflectionKind.TypeAlias)
    themeType.sources = sourceRef('/workspace/src/contexts/ThemeProvider/types.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.map(p => p.url)).toContain('theme-variables.md')
    expect(router.hasOwnDocument(themeType)).toBe(false)
    expect(router.getAnchor(themeType)).toBeDefined()
  })

  it('partner-hook-utils export gets its own page at utilities.md', () => {
    const project = makeProject()
    const util = makeChild(project, 'composeErrorHandler', ReflectionKind.Function)
    util.sources = sourceRef('/workspace/src/partner-hook-utils/composeErrorHandler.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.map(p => p.url)).toContain('utilities.md')
    expect(router.hasOwnDocument(util)).toBe(false)
    expect(router.getAnchor(util)).toBeDefined()
  })

  it('multiple members from the same source are consolidated onto one page', () => {
    const project = makeProject()
    const typeA = makeChild(project, 'GustoSDKTheme', ReflectionKind.TypeAlias)
    typeA.sources = sourceRef('/workspace/src/contexts/ThemeProvider/types.ts')
    const typeB = makeChild(project, 'GustoSDKThemeColors', ReflectionKind.TypeAlias)
    typeB.sources = sourceRef('/workspace/src/contexts/ThemeProvider/types.ts')
    const fnA = makeChild(project, 'createTheme', ReflectionKind.Function)
    fnA.sources = sourceRef('/workspace/src/contexts/ThemeProvider/theme.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.filter(p => p.url === 'theme-variables.md')).toHaveLength(1)
    expect(router.getAnchor(typeA)).toBeDefined()
    expect(router.getAnchor(typeB)).toBeDefined()
    expect(router.getAnchor(fnA)).toBeDefined()
  })

  it('members from different standalone sources go to separate pages', () => {
    const project = makeProject()
    const themeType = makeChild(project, 'GustoSDKTheme', ReflectionKind.TypeAlias)
    themeType.sources = sourceRef('/workspace/src/contexts/ThemeProvider/types.ts')
    const util = makeChild(project, 'composeErrorHandler', ReflectionKind.Function)
    util.sources = sourceRef('/workspace/src/partner-hook-utils/composeErrorHandler.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('theme-variables.md')
    expect(urls).toContain('utilities.md')
  })

  it('standalone page model has the display name, not the page path', () => {
    const project = makeProject()
    const themeType = makeChild(project, 'GustoSDKTheme', ReflectionKind.TypeAlias)
    themeType.sources = sourceRef('/workspace/src/contexts/ThemeProvider/types.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const page = pages.find(p => p.url === 'theme-variables.md')
    expect((page?.model as DeclarationReflection).name).toBe('Theme variables')
  })

  it('standalone members are removed from project groups', () => {
    const project = makeProject()
    const themeType = makeChild(project, 'GustoSDKTheme', ReflectionKind.TypeAlias)
    themeType.sources = sourceRef('/workspace/src/contexts/ThemeProvider/types.ts')

    const group = new ReflectionGroup('Type Aliases', themeType)
    project.groups = [group]

    const router = new SDKRouter(app)
    router.buildPages(project)

    expect(project.groups?.flatMap(g => g.children)).not.toContain(themeType)
  })

  it('standalone member does NOT appear on the project index page', () => {
    const project = makeProject()
    const themeType = makeChild(project, 'GustoSDKTheme', ReflectionKind.TypeAlias)
    themeType.sources = sourceRef('/workspace/src/contexts/ThemeProvider/types.ts')

    const router = new SDKRouter(app)
    router.buildPages(project)

    // standalone members must not anchor to the project index
    const projectUrl = router.getFullUrl(project)
    const memberUrl = router.getFullUrl(themeType)
    expect(memberUrl).not.toBe(projectUrl)
    expect(memberUrl).toContain('theme-variables')
  })

  it('namespace members are not affected by STANDALONE_PAGES (namespace routing is unchanged)', () => {
    const project = makeProject()
    const ns = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const nsMember = makeChild(ns, 'GustoSDKTheme', ReflectionKind.TypeAlias)
    // Source path matches ThemeProvider pattern, but it's inside a namespace — not project-level
    nsMember.sources = sourceRef('/workspace/src/contexts/ThemeProvider/types.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/management/README.md')
    expect(urls).not.toContain('theme-variables.md')
  })
})

// ---------------------------------------------------------------------------
// buildPages — domain hub page
// ---------------------------------------------------------------------------

describe('buildPages — domain hub page', () => {
  it('generates a hub page at {domain}/index.md for each configured domain', () => {
    const project = makeProject()
    makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.map(p => p.url)).toContain('employee/index.mdx')
  })

  it('hub page is generated even when none of the domain namespaces are present', () => {
    const project = makeProject()

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.map(p => p.url)).toContain('employee/index.mdx')
  })

  it('hub model has @domainHub and @domainPath tags', () => {
    const project = makeProject()

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hubPage = pages.find(p => p.url === 'employee/index.mdx')
    const model = hubPage?.model as DeclarationReflection
    expect(model.comment?.blockTags.some(t => t.tag === '@domainHub')).toBe(true)
    expect(model.comment?.blockTags.some(t => t.tag === '@domainPath')).toBe(true)
  })

  it('hub model children are the namespace reflections that exist in the project', () => {
    const project = makeProject()
    const mgmt = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    const onboarding = makeChild(project, 'EmployeeOnboarding', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hubPage = pages.find(p => p.url === 'employee/index.mdx')
    const model = hubPage?.model as DeclarationReflection
    expect(model.children).toContain(mgmt)
    expect(model.children).toContain(onboarding)
  })

  it('hub model children respect DOMAINS order and exclude absent namespaces', () => {
    const project = makeProject()
    // Only EmployeeManagement exists; EmployeeOnboarding does not
    const mgmt = makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    const hubPage = pages.find(p => p.url === 'employee/index.mdx')
    const model = hubPage?.model as DeclarationReflection
    expect(model.children).toEqual([mgmt])
  })

  it('hub page is a single page, not duplicated', () => {
    const project = makeProject()
    makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(project, 'Employee', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)

    expect(pages.filter(p => p.url === 'employee/index.mdx')).toHaveLength(1)
  })

  it('hub page coexists with separate namespace pages', () => {
    const project = makeProject()
    makeChild(project, 'EmployeeManagement', ReflectionKind.Namespace)
    makeChild(project, 'Employee', ReflectionKind.Namespace)

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/index.mdx')
    expect(urls).toContain('employee/management/README.md')
    expect(urls).toContain('Employee/README.md')
  })

  it('domain hub coexists with hooks index and individual hook pages', () => {
    const project = makeProject()
    const hook = makeChild(project, 'useHomeAddressForm', ReflectionKind.Function)
    hook.sources = sourceRef('/workspace/src/components/Employee/hooks/useHomeAddressForm.ts')

    const router = new SDKRouter(app)
    const pages = router.buildPages(project)
    const urls = pages.map(p => p.url)

    expect(urls).toContain('employee/index.mdx')
    expect(urls).toContain('employee/hooks/index.mdx')
    expect(urls).toContain('employee/hooks/use-home-address-form.md')
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
  it('returns "Reference" for the project root', () => {
    const page = makePage(makeProject(), 'index.md')
    expect(pageTitle(page)).toBe('Reference')
  })

  it('returns the domain label for a domain hub page', () => {
    const page = makePage(makeHubModel('Employees'), 'employee/index.mdx')
    expect(pageTitle(page)).toBe('Employees')
  })

  it('returns "Hooks" for a hooks page', () => {
    const page = makePage(
      new DeclarationReflection('Hooks', ReflectionKind.Namespace),
      'employee/hooks.md',
    )
    expect(pageTitle(page)).toBe('Hooks')
  })

  it('returns the component name for an individual flow page', () => {
    const page = makePage(
      new DeclarationReflection('DashboardFlow', ReflectionKind.Function),
      'employee/management/dashboard-flow.md',
    )
    expect(pageTitle(page)).toBe('DashboardFlow')
  })

  it('returns the namespace name for a regular namespace page', () => {
    const page = makePage(
      new DeclarationReflection('Payroll', ReflectionKind.Namespace),
      'payroll/README.md',
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

  it('falls back to "{title} reference." for a namespace with no comment', () => {
    const page = makePage(
      new DeclarationReflection('Payroll', ReflectionKind.Namespace),
      'Payroll/index.md',
    )
    expect(pageDescription(page)).toBe('Payroll reference.')
  })

  it('uses the derived title in the fallback for a synthetic hooks page', () => {
    const page = makePage(
      new DeclarationReflection('Hooks', ReflectionKind.Namespace),
      'employee/hooks.md',
    )
    expect(pageDescription(page)).toBe('Hooks reference.')
  })

  it('uses the derived title in the fallback for a domain hub with no comment', () => {
    const page = makePage(makeHubModel('Employees'), 'employee/index.mdx')
    expect(pageDescription(page)).toBe('Employees reference.')
  })
})

// ---------------------------------------------------------------------------
// serializeFrontmatter
// ---------------------------------------------------------------------------

describe('serializeFrontmatter', () => {
  const sample = {
    title: 'Employee Hooks',
    description: 'Employee Hooks API reference.',
    custom_edit_url: null,
  }

  it('wraps output in --- delimiters', () => {
    const result = serializeFrontmatter(sample)
    expect(result).toMatch(/^---\n/)
    expect(result).toMatch(/\n---$/)
  })

  it('puts the autogeneration comment as the first lines inside ---', () => {
    const result = serializeFrontmatter(sample)
    const lines = result.split('\n')
    expect(lines[1]).toMatch(/^# Autogenerated by TypeDoc from TSDoc comments/)
    expect(lines[2]).toContain('src/')
    expect(lines[3]).toContain('docs-site/typedoc.config.ts')
    expect(lines[3]).toContain('typedoc-custom/')
    expect(lines[4]).toContain('npm run docs:api:generate')
  })

  it('includes generated_by: typedoc after the frontmatter fields', () => {
    const result = serializeFrontmatter(sample)
    expect(result).toContain('generated_by: typedoc')
  })

  it('places generated_by before custom_edit_url', () => {
    const result = serializeFrontmatter(sample)
    const generatedByIndex = result.indexOf('generated_by:')
    const customEditIndex = result.indexOf('custom_edit_url:')
    expect(generatedByIndex).toBeLessThan(customEditIndex)
  })

  it('preserves title and description from the input', () => {
    const result = serializeFrontmatter(sample)
    expect(result).toContain('title: Employee Hooks')
    expect(result).toContain('description: Employee Hooks API reference.')
  })

  it('serializes custom_edit_url: null as null', () => {
    const result = serializeFrontmatter(sample)
    expect(result).toContain('custom_edit_url: null')
  })
})

// ---------------------------------------------------------------------------
// isOpaqueConstDerivedType (gate for expandConstDerivedAliases)
// ---------------------------------------------------------------------------

describe('isOpaqueConstDerivedType', () => {
  const project = makeProject()
  const constRef = ReferenceType.createResolvedReference(
    'fieldValidators',
    makeChild(project, 'fieldValidators', ReflectionKind.Variable),
    project,
  )

  it('matches `keyof typeof <const>`', () => {
    expect(isOpaqueConstDerivedType(new TypeOperatorType(new QueryType(constRef), 'keyof'))).toBe(
      true,
    )
  })

  it('matches indexed access (`typeof <const>[…]`)', () => {
    const indexed = new IndexedAccessType(
      new QueryType(constRef),
      new TypeOperatorType(new QueryType(constRef), 'keyof'),
    )
    expect(isOpaqueConstDerivedType(indexed)).toBe(true)
  })

  it('matches a bare `typeof <const>` query', () => {
    expect(isOpaqueConstDerivedType(new QueryType(constRef))).toBe(true)
  })

  it('leaves non-keyof type operators (e.g. `readonly`) untouched', () => {
    expect(
      isOpaqueConstDerivedType(new TypeOperatorType(new IntrinsicType('string'), 'readonly')),
    ).toBe(false)
  })

  it('leaves already-resolved unions and literals untouched', () => {
    expect(
      isOpaqueConstDerivedType(new UnionType([new LiteralType('a'), new LiteralType('b')])),
    ).toBe(false)
    expect(isOpaqueConstDerivedType(new LiteralType('a'))).toBe(false)
    expect(isOpaqueConstDerivedType(new IntrinsicType('string'))).toBe(false)
    expect(isOpaqueConstDerivedType(undefined)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// documentedUnderlyingConst (keeps large documented-const unions as links)
// ---------------------------------------------------------------------------

describe('documentedUnderlyingConst', () => {
  const project = makeProject()
  const constReflection = makeChild(project, 'componentEvents', ReflectionKind.Variable)
  const resolved = new QueryType(
    ReferenceType.createResolvedReference('componentEvents', constReflection, project),
  )
  const broken = new QueryType(
    ReferenceType.createBrokenReference('fieldValidators', project, undefined),
  )

  it('resolves the const behind `keyof typeof <documented const>`', () => {
    expect(documentedUnderlyingConst(new TypeOperatorType(resolved, 'keyof'))).toBe(constReflection)
  })

  it('resolves the const behind an indexed access', () => {
    const indexed = new IndexedAccessType(resolved, new TypeOperatorType(resolved, 'keyof'))
    expect(documentedUnderlyingConst(indexed)).toBe(constReflection)
  })

  it('returns null when the underlying const has no reflection (unexported)', () => {
    expect(documentedUnderlyingConst(new TypeOperatorType(broken, 'keyof'))).toBeNull()
    expect(documentedUnderlyingConst(broken)).toBeNull()
  })

  it('returns null for non-const-derived types', () => {
    expect(documentedUnderlyingConst(new LiteralType('a'))).toBeNull()
    expect(documentedUnderlyingConst(undefined)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// defaultValueRestatesLiteralType (drops redundant `as const` default column)
// ---------------------------------------------------------------------------

describe('defaultValueRestatesLiteralType', () => {
  function member(type: LiteralType | undefined, defaultValue: string | undefined) {
    const r = new DeclarationReflection('API_ERROR', ReflectionKind.Property)
    if (type) r.type = type
    r.defaultValue = defaultValue
    return r
  }

  it('is true when a string default restates its literal type', () => {
    expect(
      defaultValueRestatesLiteralType(member(new LiteralType('api_error'), "'api_error'")),
    ).toBe(true)
  })

  it('is true for numeric and boolean literal restatements', () => {
    expect(defaultValueRestatesLiteralType(member(new LiteralType(42), '42'))).toBe(true)
    expect(defaultValueRestatesLiteralType(member(new LiteralType(true), 'true'))).toBe(true)
  })

  it('is false when the default differs from the literal type', () => {
    expect(defaultValueRestatesLiteralType(member(new LiteralType('api_error'), "'other'"))).toBe(
      false,
    )
  })

  it('is false when there is no default or the type is not a literal', () => {
    expect(defaultValueRestatesLiteralType(member(new LiteralType('api_error'), undefined))).toBe(
      false,
    )
    expect(defaultValueRestatesLiteralType(member(undefined, "'api_error'"))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isTranslationsMember (drives the Translations Type-column drop + flat routing)
// ---------------------------------------------------------------------------

describe('isTranslationsMember', () => {
  it('is true for a reflection nested anywhere under the Translations namespace', () => {
    const project = makeProject()
    const translations = makeChild(project, 'Translations', ReflectionKind.Namespace)
    const iface = makeChild(translations, 'CompanyAddresses', ReflectionKind.Interface)
    const prop = makeChild(iface, 'title', ReflectionKind.Property)
    expect(isTranslationsMember(prop)).toBe(true)
    expect(isTranslationsMember(iface)).toBe(true)
  })

  it('is false outside the Translations namespace', () => {
    const project = makeProject()
    const other = makeChild(project, 'APIModels', ReflectionKind.Namespace)
    const iface = makeChild(other, 'Employee', ReflectionKind.Interface)
    expect(isTranslationsMember(iface)).toBe(false)
    expect(isTranslationsMember(undefined)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// dropTableColumn
// ---------------------------------------------------------------------------

describe('dropTableColumn', () => {
  const table = [
    '| Property | Type | Default value |',
    '| --- | --- | --- |',
    '| `title` | `string` | `"Hi"` |',
  ].join('\n')

  it('removes the named column from header, separator, and body rows', () => {
    const result = dropTableColumn(table, 'Type')
    expect(result).toBe(
      ['| Property | Default value |', '| --- | --- |', '| `title` | `"Hi"` |'].join('\n'),
    )
  })

  it('returns the input unchanged when the column is absent', () => {
    expect(dropTableColumn(table, 'Nonexistent')).toBe(table)
  })

  it('leaves non-table lines untouched', () => {
    const withHeading = `### Foo\n\n${table}`
    expect(dropTableColumn(withHeading, 'Type').startsWith('### Foo\n\n')).toBe(true)
  })
})
