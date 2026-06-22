/**
 * Natural-language metadata for the command palette.
 *
 * Keyed by `<Category>.<ComponentName>` (matching the keys used in
 * `sdk-app/src/generated-registry-data.ts`). Each entry attaches a
 * human-readable description and a list of keywords/synonyms a user
 * might actually type — e.g. "run payroll" → PayrollFlow.
 *
 * Coverage is intentionally partial: top-level flows and major
 * landing/list screens. Components without a metadata entry still
 * appear in the palette by name; they just won't have rich fuzzy
 * matching until someone adds an entry here.
 */

export interface ComponentMetadata {
  description: string
  keywords: string[]
}

export const componentMetadata: Record<string, ComponentMetadata> = {
  // ─── CompanyOnboarding ───────────────────────────────────────────────
  'CompanyOnboarding.OnboardingFlow': {
    description: 'Onboard a company end-to-end (industry, signatory, taxes, bank, pay schedule).',
    keywords: [
      'onboard company',
      'new company',
      'company setup',
      'company onboarding',
      'start company',
    ],
  },
  'CompanyOnboarding.OnboardingOverview': {
    description: 'Overview of remaining company onboarding steps.',
    keywords: ['company onboarding status', 'company progress', 'company checklist'],
  },

  // ─── Contractor ──────────────────────────────────────────────────────
  'Contractor.OnboardingFlow': {
    description: 'Onboard a new contractor.',
    keywords: [
      'onboard contractor',
      'new contractor',
      'add contractor',
      'create contractor',
      'contractor signup',
    ],
  },
  'Contractor.PaymentFlow': {
    description: 'Pay contractors (single or batch).',
    keywords: [
      'pay contractor',
      'pay contractors',
      'contractor payment',
      'send contractor payment',
      '1099 payment',
    ],
  },
  'Contractor.ContractorList': {
    description: 'List all contractors for the company.',
    keywords: ['contractors', 'view contractors', 'all contractors'],
  },

  // ─── Employee ────────────────────────────────────────────────────────
  'Employee.OnboardingFlow': {
    description: 'Admin-led onboarding for a new employee.',
    keywords: [
      'add employee',
      'new hire',
      'onboard employee',
      'create employee',
      'hire employee',
      'admin onboarding',
    ],
  },
  'Employee.SelfOnboardingFlow': {
    description: 'Employee-led self-onboarding (employee fills out their own details).',
    keywords: [
      'self onboarding',
      'employee signup',
      'new hire onboarding',
      'self serve onboarding',
    ],
  },
  'Employee.DashboardFlow': {
    description: 'Employee-facing dashboard.',
    keywords: ['employee dashboard', 'employee home', 'employee portal'],
  },
  'Employee.TerminationFlow': {
    description: 'Terminate an employee (offboarding flow).',
    keywords: [
      'terminate',
      'terminate employee',
      'fire',
      'offboard',
      'offboard employee',
      'end employment',
      'dismiss employee',
      'let go',
    ],
  },
  'Employee.EmployeeList': {
    description: 'List all employees for the company.',
    keywords: ['employees', 'view employees', 'all employees', 'employee roster'],
  },

  // ─── InformationRequests ─────────────────────────────────────────────
  'InformationRequests.InformationRequestsFlow': {
    description: 'Respond to outstanding information requests from Gusto.',
    keywords: [
      'information requests',
      'info requests',
      'requests',
      'respond to requests',
      'pending requests',
    ],
  },

  // ─── Payroll ─────────────────────────────────────────────────────────
  'Payroll.PayrollFlow': {
    description: 'Run a regular payroll cycle end-to-end.',
    keywords: [
      'run payroll',
      'process payroll',
      'pay employees',
      'regular payroll',
      'submit payroll',
      'do payroll',
      'start payroll',
    ],
  },
  'Payroll.PayrollExecutionFlow': {
    description: 'Execute (review and submit) an in-progress payroll.',
    keywords: [
      'execute payroll',
      'submit payroll',
      'review payroll',
      'finalize payroll',
      'approve payroll',
    ],
  },
  'Payroll.OffCycleFlow': {
    description: 'Run an off-cycle payroll (bonus, correction, supplemental pay).',
    keywords: [
      'off cycle payroll',
      'offcycle',
      'bonus payroll',
      'bonus',
      'correction',
      'one off payroll',
      'supplemental payroll',
    ],
  },
  'Payroll.TransitionFlow': {
    description: 'Run a transition payroll when migrating from another provider mid-quarter.',
    keywords: [
      'transition payroll',
      'migration payroll',
      'switch provider',
      'historical payroll',
      'mid quarter migration',
    ],
  },
  'Payroll.DismissalFlow': {
    description: 'Run a dismissal/final-paycheck payroll for a terminated employee.',
    keywords: [
      'dismissal payroll',
      'final paycheck',
      'termination pay',
      'severance payroll',
      'last paycheck',
    ],
  },
  'Payroll.PayrollHistory': {
    description: 'View past payrolls.',
    keywords: ['payroll history', 'past payrolls', 'previous payrolls', 'payroll log'],
  },
  'Payroll.PayrollList': {
    description: 'List of payrolls (drafts and processed).',
    keywords: ['payrolls', 'all payrolls', 'view payrolls'],
  },
  'Payroll.PayrollLanding': {
    description: 'Payroll landing / home page.',
    keywords: ['payroll home', 'payroll', 'payroll overview'],
  },

  // ─── TimeOff ─────────────────────────────────────────────────────────
  'TimeOff.TimeOffFlow': {
    description: 'Manage time off policies (create, edit, assign to employees).',
    keywords: [
      'time off',
      'pto',
      'time off policy',
      'vacation policy',
      'sick policy',
      'paid time off',
      'leave policy',
    ],
  },
}
