import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GustoProvider, Employee, Company, Contractor, Payroll } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

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
      return <Employee.OnboardingFlow companyId={companyId} onEvent={handleEvent} />
    case 'employee-self-onboarding':
      return (
        <Employee.SelfOnboardingFlow
          companyId={companyId}
          employeeId={employeeId}
          onEvent={handleEvent}
        />
      )
    case 'company-onboarding':
      return <Company.OnboardingFlow companyId={companyId} onEvent={handleEvent} />
    case 'contractor-onboarding':
      return <Contractor.OnboardingFlow companyId={companyId} onEvent={handleEvent} />
    case 'payroll':
      return <Payroll.PayrollFlow companyId={companyId} onEvent={handleEvent} />
    case 'contractor-payment':
      return <Contractor.PaymentFlow companyId={companyId} onEvent={handleEvent} />
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
