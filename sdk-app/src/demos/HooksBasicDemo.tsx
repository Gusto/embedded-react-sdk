import type { CSSProperties, PropsWithChildren } from 'react'
import { GustoProvider, useEmployeeDetailsForm } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { Button, Loading, interfaceLibComponents } from '../InterfaceLib'
import { BASE_URL, COMPANY_ID, EMPLOYEE_ID } from './config'

const pageStyle: CSSProperties = {
  maxWidth: '720px',
  margin: '0 auto',
  padding: '32px 16px',
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
  marginBottom: '24px',
}

const fullWidthStyle: CSSProperties = { gridColumn: '1 / -1' }

function Card({ children }: PropsWithChildren) {
  return <section style={cardStyle}>{children}</section>
}

function FieldGrid({ children }: PropsWithChildren) {
  return <div style={fieldGridStyle}>{children}</div>
}

function FullWidth({ children }: PropsWithChildren) {
  return <div style={fullWidthStyle}>{children}</div>
}

function EmployeeDetailsForm() {
  const employeeDetails = useEmployeeDetailsForm({
    companyId: COMPANY_ID,
    employeeId: EMPLOYEE_ID,
  })

  if (employeeDetails.isLoading) {
    return <Loading />
  }

  const { Fields } = employeeDetails.form

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        void employeeDetails.actions.onSubmit()
      }}
    >
      <Card>
        <h2 style={cardTitleStyle}>Employee details</h2>
        <p style={cardDescriptionStyle}>
          The same hook from the Hello demo, now rendered through your design system and a custom
          layout.
        </p>
        <FieldGrid>
          <Fields.FirstName
            label="First name"
            formHookResult={employeeDetails}
            validationMessages={{
              REQUIRED: 'First name is required',
              INVALID_NAME: 'Enter a valid first name',
            }}
          />
          <Fields.LastName
            label="Last name"
            formHookResult={employeeDetails}
            validationMessages={{
              REQUIRED: 'Last name is required',
              INVALID_NAME: 'Enter a valid last name',
            }}
          />
          <FullWidth>
            <Fields.Email
              label="Personal email"
              formHookResult={employeeDetails}
              validationMessages={{
                REQUIRED: 'Email is required',
                INVALID_EMAIL: 'Enter a valid email address',
                EMAIL_REQUIRED_FOR_SELF_ONBOARDING:
                  'Email is required when self-onboarding is enabled',
              }}
            />
          </FullWidth>
          <Fields.DateOfBirth
            label="Date of birth"
            formHookResult={employeeDetails}
            validationMessages={{ REQUIRED: 'Date of birth is required' }}
          />
          <Fields.Ssn
            label="Social Security number"
            formHookResult={employeeDetails}
            validationMessages={{ INVALID_SSN: 'Enter a valid Social Security number' }}
          />
        </FieldGrid>
        <Button type="submit" isLoading={employeeDetails.status.isPending}>
          Save changes
        </Button>
      </Card>
    </form>
  )
}

export default function HooksBasicDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }} components={interfaceLibComponents}>
      <div style={pageStyle}>
        <EmployeeDetailsForm />
      </div>
    </GustoProvider>
  )
}
