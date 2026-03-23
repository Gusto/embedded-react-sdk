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
    default:
      return <div>Unknown flow: {flow}</div>
  }
}

function App({ config }: { config: E2EConfig }) {
  return (
    <StrictMode>
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
