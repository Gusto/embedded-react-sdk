import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GustoProvider } from '@/contexts'
import { OnboardingFlow } from '@/components/Employee/OnboardingFlow/OnboardingFlow'
import { SelfOnboardingFlow } from '@/components/Employee/SelfOnboardingFlow/SelfOnboardingFlow'
import { OnboardingFlow as CompanyOnboardingFlow } from '@/components/Company/OnboardingFlow/OnboardingFlow'
import { OnboardingFlow as ContractorOnboardingFlow } from '@/components/Contractor/OnboardingFlow/OnboardingFlow'
import { PayrollFlow } from '@/components/Payroll/PayrollFlow/PayrollFlow'
import { PaymentFlow } from '@/components/Contractor/Payments/PaymentFlow/PaymentFlow'
import '@/styles/sdk.scss'

const DEFAULT_API_BASE_URL = 'https://api.gusto.com'

type FlowType =
  | 'employee-onboarding'
  | 'employee-self-onboarding'
  | 'company-onboarding'
  | 'contractor-onboarding'
  | 'payroll'
  | 'contractor-payment'

interface E2EConfig {
  flow: FlowType
  companyId: string
  employeeId: string
  baseUrl: string
  isLocal: boolean
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
  }
}

function FlowRenderer({ config }: { config: E2EConfig }) {
  const { flow, companyId, employeeId } = config
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
    case 'contractor-payment':
      return <PaymentFlow companyId={companyId} onEvent={handleEvent} />
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
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  const container = document.getElementById('root')
  if (container) {
    createRoot(container).render(<App config={config} />)
  }
}

startApp()
