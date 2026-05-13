import { EmployeeOnboarding, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, EMPLOYEE_ID } from './config'

export default function DefaultValuesDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }}>
      <EmployeeOnboarding.Compensation
        employeeId={EMPLOYEE_ID}
        startDate="2025-01-01"
        defaultValues={{
          title: 'Senior Engineer',
          rate: '85',
          paymentUnit: 'Hour',
        }}
        onEvent={(eventType, data) => {
          console.log(eventType, data)
        }}
      />
    </GustoProvider>
  )
}
