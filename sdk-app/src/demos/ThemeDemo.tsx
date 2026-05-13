import {
  EmployeeOnboarding,
  GustoProvider,
  type GustoProviderProps,
} from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, COMPANY_ID } from './config'

const partnerTheme: GustoProviderProps['theme'] = {
  colorPrimary: '#101010',
  colorPrimaryAccent: '#333333',
  colorPrimaryContent: '#FFFFFF',

  colorBody: '#FFFFFF',
  colorBodyAccent: '#F5F5F5',
  colorBodyContent: '#101010',
  colorBodySubContent: '#666666',

  colorSecondary: '#F0F0F0',
  colorSecondaryAccent: '#E8E8E8',
  colorSecondaryContent: '#101010',

  colorError: '#FBE6EA',
  colorErrorAccent: '#CC0023',
  colorErrorContent: '#CC0023',

  colorBorderPrimary: '#DADADA',
  colorBorderSecondary: '#F0F0F0',

  fontFamily: 'Helvetica, Arial, sans-serif',

  buttonRadius: '999px',
  inputRadius: '8px',
  cardRadius: '12px',
  bannerRadius: '8px',

  focusRingColor: '#101010',
  focusRingWidth: '2px',
}

export default function ThemeDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }} theme={partnerTheme}>
      <EmployeeOnboarding.OnboardingFlow
        companyId={COMPANY_ID}
        onEvent={(eventType, data) => {
          console.log(eventType, data)
        }}
      />
    </GustoProvider>
  )
}
