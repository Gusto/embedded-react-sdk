import type { CSSProperties, PropsWithChildren } from 'react'
import {
  GustoProvider,
  composeSubmitHandler,
  useCurrentHomeAddressForm,
  useEmployeeDetailsForm,
} from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { Button, Loading, interfaceLibComponents } from '../InterfaceLib'
import { BASE_URL, COMPANY_ID, EMPLOYEE_ID } from './config'

const pageStyle: CSSProperties = {
  maxWidth: '720px',
  margin: '0 auto',
  padding: '32px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  fontFamily: "'InterfaceLib Sans', system-ui, sans-serif",
}

const cardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.1)',
  border: '1px solid #e4e7ec',
}

const cardTitleStyle: CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: '20px',
  fontWeight: 600,
  color: '#101828',
}

const cardDescriptionStyle: CSSProperties = {
  margin: '0 0 20px 0',
  fontSize: '14px',
  color: '#475467',
}

const fieldGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
}

const fullWidthStyle: CSSProperties = { gridColumn: '1 / -1' }

const errorBannerStyle: CSSProperties = {
  background: '#fef3f2',
  border: '1px solid #fda29b',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#b42318',
}

const submitRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
}

function Card({ children }: PropsWithChildren) {
  return <section style={cardStyle}>{children}</section>
}

function FieldGrid({ children }: PropsWithChildren) {
  return <div style={fieldGridStyle}>{children}</div>
}

function FullWidth({ children }: PropsWithChildren) {
  return <div style={fullWidthStyle}>{children}</div>
}

function InterleavedForm() {
  const employeeDetails = useEmployeeDetailsForm({
    companyId: COMPANY_ID,
    employeeId: EMPLOYEE_ID,
    shouldFocusError: false,
  })

  const homeAddress = useCurrentHomeAddressForm({
    employeeId: EMPLOYEE_ID,
    shouldFocusError: false,
  })

  if (employeeDetails.isLoading || homeAddress.isLoading) {
    return <Loading />
  }

  const EmployeeFields = employeeDetails.form.Fields
  const AddressFields = homeAddress.form.Fields
  const { employee } = employeeDetails.data
  const employeeName =
    [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') || 'New employee'

  const { handleSubmit, errorHandling } = composeSubmitHandler(
    [employeeDetails, homeAddress],
    async () => {
      const employeeDetailsResult = await employeeDetails.actions.onSubmit()
      console.log('[HooksInterleavedDemo] employee details submit complete:', employeeDetailsResult)
      const homeAddressResult = await homeAddress.actions.onSubmit()
      console.log('[HooksInterleavedDemo] home address submit complete:', homeAddressResult)
    },
  )

  const isPending = employeeDetails.status.isPending || homeAddress.status.isPending

  return (
    <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#101828' }}>
          Editing {employeeName}
        </h1>
      </header>

      {errorHandling.errors.length > 0 && (
        <div role="alert" style={errorBannerStyle}>
          {errorHandling.errors.map((error, i) => (
            <p key={i} style={{ margin: 0 }}>
              {error.message}
            </p>
          ))}
        </div>
      )}

      <Card>
        <h2 style={cardTitleStyle}>About you</h2>
        <p style={cardDescriptionStyle}>
          Two hooks, one card. Each field declares which hook it belongs to via{' '}
          <code>formHookResult</code>.
        </p>
        <FieldGrid>
          <EmployeeFields.FirstName
            label="First name"
            formHookResult={employeeDetails}
            validationMessages={{
              REQUIRED: 'First name is required',
              INVALID_NAME: 'Enter a valid first name',
            }}
          />
          <EmployeeFields.LastName
            label="Last name"
            formHookResult={employeeDetails}
            validationMessages={{
              REQUIRED: 'Last name is required',
              INVALID_NAME: 'Enter a valid last name',
            }}
          />
          <FullWidth>
            <AddressFields.Street1
              label="Street address"
              formHookResult={homeAddress}
              validationMessages={{ REQUIRED: 'Street is required' }}
            />
          </FullWidth>
          <EmployeeFields.Email
            label="Personal email"
            formHookResult={employeeDetails}
            validationMessages={{
              REQUIRED: 'Email is required',
              INVALID_EMAIL: 'Enter a valid email address',
              EMAIL_REQUIRED_FOR_SELF_ONBOARDING:
                'Email is required when self-onboarding is enabled',
            }}
          />
          <AddressFields.City
            label="City"
            formHookResult={homeAddress}
            validationMessages={{ REQUIRED: 'City is required' }}
          />
          <AddressFields.State
            label="State"
            formHookResult={homeAddress}
            validationMessages={{ REQUIRED: 'State is required' }}
          />
          <AddressFields.Zip
            label="ZIP code"
            formHookResult={homeAddress}
            validationMessages={{
              REQUIRED: 'ZIP code is required',
              INVALID_ZIP: 'Enter a valid ZIP code',
            }}
          />
        </FieldGrid>
      </Card>

      <div style={submitRowStyle}>
        <Button type="submit" isLoading={isPending}>
          Save everything
        </Button>
      </div>
    </form>
  )
}

export default function HooksInterleavedDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }} components={interfaceLibComponents}>
      <div style={pageStyle}>
        <InterleavedForm />
      </div>
    </GustoProvider>
  )
}
