import type { CSSProperties, PropsWithChildren } from 'react'
import { GustoProvider, SDKFormProvider, useEmployeeDetailsForm } from '@gusto/embedded-react-sdk'
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

const cardStackStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}

const formActionsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '4px',
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

function EmployeeDetailsForm() {
  const employeeDetails = useEmployeeDetailsForm({
    companyId: COMPANY_ID,
    employeeId: EMPLOYEE_ID,
    optionalFieldsToRequire: {
      update: ['firstName', 'lastName', 'dateOfBirth', 'email', 'ssn'],
    },
  })

  if (employeeDetails.isLoading) {
    return <Loading />
  }

  const { Fields } = employeeDetails.form
  const { employee } = employeeDetails.data
  const employeeName =
    [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') || 'New employee'

  return (
    <SDKFormProvider formHookResult={employeeDetails}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void (async () => {
            const result = await employeeDetails.actions.onSubmit()
            console.log('[HooksBasicDemo] employee details submit complete:', result)
          })()
        }}
      >
        <div style={cardStackStyle}>
          <header>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#101828' }}>
              Editing {employeeName}
            </h1>
          </header>
          <Card>
            <h2 style={cardTitleStyle}>Personal information</h2>
            <p style={cardDescriptionStyle}>
              The same fields as the Hello demo, but split across cards and reordered to match your
              layout — last name first, then first name, then date of birth.
            </p>
            <FieldGrid>
              <Fields.LastName
                label="Last name"
                validationMessages={{
                  REQUIRED: 'Last name is required',
                  INVALID_NAME: 'Enter a valid last name',
                }}
              />
              <Fields.FirstName
                label="First name"
                validationMessages={{
                  REQUIRED: 'First name is required',
                  INVALID_NAME: 'Enter a valid first name',
                }}
              />
              <FullWidth>
                <Fields.DateOfBirth
                  label="Date of birth"
                  validationMessages={{ REQUIRED: 'Date of birth is required' }}
                />
              </FullWidth>
            </FieldGrid>
          </Card>

          <Card>
            <h2 style={cardTitleStyle}>Contact &amp; security</h2>
            <p style={cardDescriptionStyle}>
              Sensitive fields live in their own card. The hook doesn&apos;t care how the fields are
              grouped — render them wherever your design needs them.
            </p>
            <FieldGrid>
              <FullWidth>
                <Fields.Email
                  label="Personal email"
                  validationMessages={{
                    REQUIRED: 'Email is required',
                    INVALID_EMAIL: 'Enter a valid email address',
                    EMAIL_REQUIRED_FOR_SELF_ONBOARDING:
                      'Email is required when self-onboarding is enabled',
                  }}
                />
              </FullWidth>
              <FullWidth>
                <Fields.Ssn
                  label="Social Security number"
                  validationMessages={{ INVALID_SSN: 'Enter a valid Social Security number' }}
                />
              </FullWidth>
            </FieldGrid>
          </Card>

          <div style={formActionsStyle}>
            <Button type="submit" isLoading={employeeDetails.status.isPending}>
              Save changes
            </Button>
          </div>
        </div>
      </form>
    </SDKFormProvider>
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
