import { Employee, GustoProvider, type GustoProviderProps } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, COMPANY_ID } from './config'

const partnerTheme: GustoProviderProps['theme'] = {
  colorPrimary: 'red',
  colorPrimaryAccent: '#8B5CF6',
  colorPrimaryContent: '#FFFFFF',

  colorBody: '#FFFFFF',
  colorBodyAccent: '#F5F3FF',
  colorBodyContent: '#1C1C1C',

  colorSecondary: '#F5F3FF',
  colorSecondaryAccent: '#EDE9FE',
  colorSecondaryContent: '#1C1C1C',

  fontFamily: "'Georgia', serif",
  buttonRadius: '2rem',
}

export default function ThemeDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }} theme={partnerTheme}>
      <Employee.EmployeeList
        companyId={COMPANY_ID}
        onEvent={(eventType, data) => {
          console.log(eventType, data)
        }}
      />
    </GustoProvider>
  )
}
