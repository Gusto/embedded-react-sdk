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

const API_BASE_URL = 'https://api.gusto.com'

type FlowType =
  | 'employee-onboarding'
  | 'employee-self-onboarding'
  | 'company-onboarding'
  | 'contractor-onboarding'
  | 'payroll'
  | 'contractor-payment'

function getFlowFromUrl(): FlowType {
  const params = new URLSearchParams(window.location.search)
  return (params.get('flow') as FlowType) || 'employee-onboarding'
}

function getPropsFromUrl(): Record<string, string> {
  const params = new URLSearchParams(window.location.search)
  const props: Record<string, string> = {}
  params.forEach((value, key) => {
    if (key !== 'flow') {
      props[key] = value
    }
  })
  return props
}

function FlowRenderer() {
  const flow = getFlowFromUrl()
  const urlProps = getPropsFromUrl()
  const companyId = urlProps.companyId || '123'
  const employeeId = urlProps.employeeId || '456'

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

function App() {
  return (
    <StrictMode>
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <FlowRenderer />
      </GustoProvider>
    </StrictMode>
  )
}

async function startApp() {
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
  })

  const container = document.getElementById('root')
  if (container) {
    createRoot(container).render(<App />)
  }
}

startApp()
