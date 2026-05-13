import { EmployeeOnboarding, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, COMPANY_ID, EMPLOYEE_ID } from './config'

export default function EventsDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }}>
      <EmployeeOnboarding.Profile
        companyId={COMPANY_ID}
        employeeId={EMPLOYEE_ID}
        onEvent={(eventType, data) => {
          console.log(eventType, data)
        }}
      />
    </GustoProvider>
  )
}
