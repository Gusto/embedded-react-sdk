import { Employee, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, COMPANY_ID } from './config'

export default function WorkflowDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }}>
      <Employee.OnboardingFlow
        companyId={COMPANY_ID}
        onEvent={(eventType, data) => {
          console.log(eventType, data)
        }}
      />
    </GustoProvider>
  )
}
