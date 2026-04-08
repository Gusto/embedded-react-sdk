import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GustoProvider } from '@/contexts'
import { OnboardingFlow } from '@/components/Employee/OnboardingFlow/OnboardingFlow'
import { SelfOnboardingFlow } from '@/components/Employee/SelfOnboardingFlow/SelfOnboardingFlow'
import { OnboardingFlow as CompanyOnboardingFlow } from '@/components/Company/OnboardingFlow/OnboardingFlow'
import { OnboardingFlow as ContractorOnboardingFlow } from '@/components/Contractor/OnboardingFlow/OnboardingFlow'
import { PayrollFlow } from '@/components/Payroll/PayrollFlow/PayrollFlow'
import { TransitionFlow } from '@/components/Payroll/Transition/TransitionFlow'
import { PaymentFlow } from '@/components/Contractor/Payments/PaymentFlow/PaymentFlow'
import { TerminationFlow } from '@/components/Employee/Terminations/TerminationFlow/TerminationFlow'
import { DismissalFlow } from '@/components/Payroll/Dismissal'
import { TimeOffFlow } from '@/components/UNSTABLE_TimeOff/TimeOffFlow/TimeOffFlow'
import '@/styles/sdk.scss'

const DEFAULT_API_BASE_URL = 'https://api.gusto.com'

type FlowType =
  | 'employee-onboarding'
  | 'employee-self-onboarding'
  | 'company-onboarding'
  | 'contractor-onboarding'
  | 'payroll'
  | 'transition'
  | 'contractor-payment'
  | 'termination'
  | 'dismissal'
  | 'time-off'

interface E2EConfig {
  flow: FlowType
  companyId: string
  employeeId: string
  baseUrl: string
  isLocal: boolean
  startDate: string
  endDate: string
  payScheduleUuid: string
}

function getConfigFromUrl(): E2EConfig {
  const params = new URLSearchParams(window.location.search)
  const isLocal = params.get('local') === 'true'
  const flowToken = params.get('flowToken')

  let baseUrl = DEFAULT_API_BASE_URL
  if (isLocal && flowToken) {
    baseUrl = `${window.location.origin}/fe_sdk/${flowToken}/`
  }

  return {
    flow: (params.get('flow') as FlowType) || 'employee-onboarding',
    companyId: params.get('companyId') || '123',
    employeeId: params.get('employeeId') || '456',
    baseUrl,
    isLocal,
    startDate: params.get('startDate') || '2025-08-14',
    endDate: params.get('endDate') || '2025-08-27',
    payScheduleUuid: params.get('payScheduleUuid') || '1478a82e-b45c-4980-843a-6ddc3b78268e',
  }
}

function FlowRenderer({ config }: { config: E2EConfig }) {
  const { flow, companyId, employeeId, startDate, endDate, payScheduleUuid } = config
  const handleEvent = () => {}

  switch (flow) {
    case 'employee-onboarding':
      return <OnboardingFlow companyId={companyId} onEvent={handleEvent} />
    case 'employee-self-onboarding':
      return (
        <SelfOnboardingFlow companyId={companyId} employeeId={employeeId} onEvent={handleEvent} />
      )
    case 'company-onboarding':
      return <CompanyOnboardingFlow companyId={companyId} onEvent={handleEvent} />
    case 'contractor-onboarding':
      return <ContractorOnboardingFlow companyId={companyId} onEvent={handleEvent} />
    case 'payroll':
      return <PayrollFlow companyId={companyId} onEvent={handleEvent} />
    case 'transition':
      return (
        <TransitionFlow
          companyId={companyId}
          startDate={startDate}
          endDate={endDate}
          payScheduleUuid={payScheduleUuid}
          onEvent={handleEvent}
        />
      )
    case 'contractor-payment':
      return <PaymentFlow companyId={companyId} onEvent={handleEvent} />
    case 'termination':
      return <TerminationFlow companyId={companyId} employeeId={employeeId} onEvent={handleEvent} />
    case 'dismissal':
      return <DismissalFlow companyId={companyId} employeeId={employeeId} onEvent={handleEvent} />
    case 'time-off':
      return <TimeOffFlow companyId={companyId} onEvent={handleEvent} />
    default:
      return <div>Unknown flow: {flow}</div>
  }
}

const FLOW_OPTIONS: { value: FlowType; label: string }[] = [
  { value: 'employee-onboarding', label: 'Employee Onboarding' },
  { value: 'employee-self-onboarding', label: 'Employee Self-Onboarding' },
  { value: 'company-onboarding', label: 'Company Onboarding' },
  { value: 'contractor-onboarding', label: 'Contractor Onboarding' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'transition', label: 'Transition' },
  { value: 'contractor-payment', label: 'Contractor Payment' },
  { value: 'termination', label: 'Termination' },
  { value: 'dismissal', label: 'Dismissal' },
  { value: 'time-off', label: 'Time Off Management' },
]

function FlowSelector({ currentFlow }: { currentFlow: FlowType }) {
  return (
    <nav
      aria-label="Flow selector"
      style={{
        padding: '8px 0',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: 16,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        alignItems: 'center',
        fontSize: 13,
      }}
    >
      <span style={{ fontWeight: 600 }}>Flow:</span>
      {FLOW_OPTIONS.map((opt, i) => {
        const params = new URLSearchParams(window.location.search)
        params.set('flow', opt.value)
        const isActive = opt.value === currentFlow
        return (
          <span key={opt.value}>
            {i > 0 && <span style={{ color: '#d1d5db' }}>|</span>}
            <a
              href={`?${params.toString()}`}
              style={{
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#111827' : '#6b7280',
                textDecoration: isActive ? 'none' : 'underline',
              }}
            >
              {opt.label}
            </a>
          </span>
        )
      })}
    </nav>
  )
}

function App({ config }: { config: E2EConfig }) {
  return (
    <StrictMode>
      <FlowSelector currentFlow={config.flow} />
      <GustoProvider config={{ baseUrl: config.baseUrl }}>
        <FlowRenderer config={config} />
      </GustoProvider>
    </StrictMode>
  )
}

async function startApp() {
  const config = getConfigFromUrl()

  if (!config.isLocal) {
    const msw = await import('msw')
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
    ;(window as Record<string, unknown>).__mswWorker = worker
    ;(window as Record<string, unknown>).__msw = msw
  }

  const container = document.getElementById('root')
  if (container) {
    createRoot(container).render(<App config={config} />)
  }
}

startApp()
