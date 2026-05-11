import type { ReactNode } from 'react'
import { Employee, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, COMPANY_ID, EMPLOYEE_ID } from './config'

const FALLBACK_START_DATE = new Date().toISOString().slice(0, 10)

const logEvent = (eventType: string, data: unknown) => {
  console.log(eventType, data)
}

interface ComponentFrameProps {
  name: string
  description: string
  children: ReactNode
}

function ComponentFrame({ name, description, children }: ComponentFrameProps) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 480px',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '0.95rem',
            fontWeight: 600,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            color: '#111827',
          }}
        >
          {name}
        </h3>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
          {description}
        </p>
      </header>
      <div style={{ padding: '1.25rem', overflow: 'auto' }}>{children}</div>
    </section>
  )
}

export default function IndividualComponentsDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }}>
      <div
        style={{
          padding: '1.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '0 1.5rem',
          }}
        >
          <h2 style={{ margin: 0 }}>Individual components</h2>
          <p style={{ margin: 0, color: '#6b7280', maxWidth: '60ch' }}>
            Each block of the Employee onboarding flow is also exported as a standalone component.
            Drop one into your own UI when you only need that step. Every frame below mounts the
            real component against the same employee. Scroll horizontally to browse all of them.
          </p>
        </header>

        <div style={{ overflowX: 'auto' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '1.5rem',
              padding: '0.25rem 1.5rem 1rem',
              alignItems: 'flex-start',
              width: 'max-content',
            }}
          >
            <ComponentFrame
              name="Employee.Profile"
              description="Personal details and home address for a new or existing employee."
            >
              <Employee.Profile
                companyId={COMPANY_ID}
                employeeId={EMPLOYEE_ID}
                isAdmin
                onEvent={logEvent}
              />
            </ComponentFrame>

            <ComponentFrame
              name="Employee.Compensation"
              description="Job title, pay rate, FLSA classification, and pay period."
            >
              <Employee.Compensation
                employeeId={EMPLOYEE_ID}
                startDate={FALLBACK_START_DATE}
                onEvent={logEvent}
              />
            </ComponentFrame>

            <ComponentFrame
              name="Employee.FederalTaxes"
              description="Federal W-4 withholding details collected from the employee."
            >
              <Employee.FederalTaxes employeeId={EMPLOYEE_ID} onEvent={logEvent} />
            </ComponentFrame>

            <ComponentFrame
              name="Employee.StateTaxes"
              description="State tax forms tailored to the employee's home and work locations."
            >
              <Employee.StateTaxes employeeId={EMPLOYEE_ID} onEvent={logEvent} />
            </ComponentFrame>

            <ComponentFrame
              name="Employee.PaymentMethod"
              description="Direct deposit accounts, paycheck splits, or paper check setup."
            >
              <Employee.PaymentMethod employeeId={EMPLOYEE_ID} isAdmin onEvent={logEvent} />
            </ComponentFrame>

            <ComponentFrame
              name="Employee.Deductions"
              description="Post-tax garnishments, child support, and custom deductions."
            >
              <Employee.Deductions employeeId={EMPLOYEE_ID} onEvent={logEvent} />
            </ComponentFrame>

            <ComponentFrame
              name="Employee.EmployeeDocuments"
              description="Optional I-9 employment eligibility document configuration."
            >
              <Employee.EmployeeDocuments employeeId={EMPLOYEE_ID} onEvent={logEvent} />
            </ComponentFrame>

            <ComponentFrame
              name="Employee.OnboardingSummary"
              description="Final recap of completed and outstanding onboarding steps."
            >
              <Employee.OnboardingSummary employeeId={EMPLOYEE_ID} isAdmin onEvent={logEvent} />
            </ComponentFrame>
          </div>
        </div>
      </div>
    </GustoProvider>
  )
}
