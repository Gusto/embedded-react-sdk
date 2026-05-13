import type { CSSProperties, PropsWithChildren } from 'react'
import {
  GustoProvider,
  SDKFormProvider,
  useEmployeeDetailsForm,
  type TextInputProps,
} from '@gusto/embedded-react-sdk'
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

const SUGGESTED_FIRST_NAMES = [
  'Alex',
  'Avery',
  'Casey',
  'Drew',
  'Jordan',
  'Morgan',
  'Quinn',
  'Riley',
  'Sam',
  'Taylor',
] as const

const SUGGESTED_LAST_NAMES = [
  'Brown',
  'Davis',
  'Garcia',
  'Johnson',
  'Jones',
  'Martinez',
  'Miller',
  'Rodriguez',
  'Smith',
  'Williams',
] as const

interface TypeaheadInputProps extends TextInputProps {
  suggestions: readonly string[]
  datalistId: string
}

function TypeaheadInput({
  id,
  name,
  label,
  value,
  placeholder,
  errorMessage,
  isInvalid,
  isRequired,
  isDisabled,
  onChange,
  onBlur,
  suggestions,
  datalistId,
}: TypeaheadInputProps) {
  const inputId = id || name
  return (
    <label
      htmlFor={inputId}
      style={{ display: 'block', fontFamily: "'InterfaceLib Sans', system-ui, sans-serif" }}
    >
      <span
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: '#5b21b6',
          marginBottom: '6px',
        }}
      >
        {label}
        {isRequired ? ' *' : null}
        <span
          style={{
            marginLeft: '8px',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: '#7c3aed',
            background: '#ede9fe',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          Typeahead
        </span>
      </span>
      <input
        id={inputId}
        name={name}
        value={value ?? ''}
        placeholder={placeholder ?? 'Start typing to see suggestions…'}
        disabled={isDisabled}
        list={datalistId}
        autoComplete="off"
        onChange={e => onChange?.(e.target.value)}
        onBlur={() => onBlur?.()}
        style={{
          width: '100%',
          padding: '12px 14px',
          fontSize: '15px',
          borderRadius: '8px',
          border: `2px solid ${isInvalid ? '#d92d20' : '#8b5cf6'}`,
          background: '#faf5ff',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: "'InterfaceLib Sans', system-ui, sans-serif",
        }}
      />
      <datalist id={datalistId}>
        {suggestions.map(suggestion => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      {isInvalid && errorMessage ? (
        <span style={{ display: 'block', fontSize: '12px', color: '#d92d20', marginTop: '6px' }}>
          {errorMessage}
        </span>
      ) : null}
    </label>
  )
}

function FirstNameTypeahead(props: TextInputProps) {
  return (
    <TypeaheadInput
      {...props}
      suggestions={SUGGESTED_FIRST_NAMES}
      datalistId="hooks-custom-field-first-name-suggestions"
    />
  )
}

function LastNameTypeahead(props: TextInputProps) {
  return (
    <TypeaheadInput
      {...props}
      suggestions={SUGGESTED_LAST_NAMES}
      datalistId="hooks-custom-field-last-name-suggestions"
    />
  )
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
            console.log('[HooksCustomFieldDemo] employee details submit complete:', result)
          })()
        }}
      >
        <header style={{ marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#101828' }}>
            Editing {employeeName}
          </h1>
        </header>
        <Card>
          <h2 style={cardTitleStyle}>Employee details</h2>
          <p style={cardDescriptionStyle}>
            First and last name use a custom typeahead FieldComponent backed by suggestions you
            supply — handy when partners want to pre-populate from contacts, prior payroll runs, or
            HRIS data. The remaining fields keep the design-system defaults.
          </p>
          <FieldGrid>
            <Fields.FirstName
              label="First name"
              FieldComponent={FirstNameTypeahead}
              validationMessages={{
                REQUIRED: 'First name is required',
                INVALID_NAME: 'Enter a valid first name',
              }}
            />
            <Fields.LastName
              label="Last name"
              FieldComponent={LastNameTypeahead}
              validationMessages={{
                REQUIRED: 'Last name is required',
                INVALID_NAME: 'Enter a valid last name',
              }}
            />
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
            <Fields.DateOfBirth
              label="Date of birth"
              validationMessages={{ REQUIRED: 'Date of birth is required' }}
            />
            <Fields.Ssn
              label="Social Security number"
              validationMessages={{ INVALID_SSN: 'Enter a valid Social Security number' }}
            />
          </FieldGrid>
          <Button type="submit" isLoading={employeeDetails.status.isPending}>
            Save changes
          </Button>
        </Card>
      </form>
    </SDKFormProvider>
  )
}

export default function HooksCustomFieldDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }} components={interfaceLibComponents}>
      <div style={pageStyle}>
        <EmployeeDetailsForm />
      </div>
    </GustoProvider>
  )
}
