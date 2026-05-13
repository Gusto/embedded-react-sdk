import { EmployeeOnboarding, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, COMPANY_ID } from './config'

export default function TranslationsDemo() {
  return (
    <GustoProvider
      config={{ baseUrl: BASE_URL }}
      dictionary={{
        en: {
          'Employee.EmployeeList': {
            title: 'Your Team Members',
            addEmployeeCta: 'Bring someone on board',
          },
        },
      }}
    >
      <EmployeeOnboarding.EmployeeList
        companyId={COMPANY_ID}
        onEvent={(eventType, data) => {
          console.log(eventType, data)
        }}
      />
    </GustoProvider>
  )
}
