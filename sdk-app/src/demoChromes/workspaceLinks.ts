import { DEMOS, DEMO_ROUTE_PREFIX } from '../demos/registry'

export interface ChromeSidebarLink {
  to: string
  label: string
}

export const HOME_ROUTE = '/company/OnboardingOverview'
export const PROFILE_ROUTE = '/employee/Profile'

export const TOP_NAV_LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: HOME_ROUTE, label: 'Dashboard', end: true },
  { to: PROFILE_ROUTE, label: 'People' },
  { to: '/payroll/PayrollLanding', label: 'Payroll' },
  { to: '/company/DocumentList', label: 'Documents' },
]

export const WORKSPACE_LINKS: ChromeSidebarLink[] = [
  { to: PROFILE_ROUTE, label: 'Employees' },
  { to: '/employee/OnboardingFlow', label: 'Onboarding' },
  { to: '/employee/Compensation', label: 'Compensation' },
  { to: '/payroll/PayrollFlow', label: 'Run Payroll' },
  { to: '/company/DocumentList', label: 'Documents' },
  { to: '/company/BankAccount', label: 'Bank Account' },
  { to: '/company/PaySchedule', label: 'Pay Schedule' },
]

export const DEMO_LINKS: ChromeSidebarLink[] = DEMOS.map(d => ({
  to: `${DEMO_ROUTE_PREFIX}/${d.id}`,
  label: d.label,
}))
