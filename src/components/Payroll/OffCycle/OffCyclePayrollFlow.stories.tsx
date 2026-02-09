import { useEffect, useState, type ReactNode } from 'react'
import { fn } from 'storybook/test'
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'
import { OffCyclePayrollFlow } from './OffCyclePayrollFlow'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'
import payrollFixture from '@/test/mocks/fixtures/get-v1-companies-company_id-payrolls-payroll_id.json'
import prepareFixture from '@/test/mocks/fixtures/put-v1-companies-company_id-payrolls-payroll_id-prepare.json'
import receiptFixture from '@/test/mocks/fixtures/payroll-receipt-test-data.json'
import employeeFixture from '@/test/mocks/fixtures/get-v1-employees.json'
import bankAccountsFixture from '@/test/mocks/fixtures/get-v1-companies-company_id-bank_accounts.json'

export default {
  title: 'Domain/Payroll/OffCycle/OffCyclePayrollFlow',
}

const cleanPayrollFixture = {
  ...payrollFixture,
  processed: false,
  processed_date: null,
  submission_blockers: [],
  credit_blockers: [],
}

const calculatedPayrollFixture = {
  ...cleanPayrollFixture,
  calculated_at: '2025-08-11T12:00:00Z',
  processing_request: { status: 'calculate_success', errors: [] },
}

const submittedPayrollFixture = {
  ...calculatedPayrollFixture,
  processed: true,
  processed_date: '2025-08-11',
  processing_request: { status: 'submit_success', errors: [] },
}

let payrollCalculated = false
let payrollSubmitted = false

const mockEmployees = [
  {
    ...employeeFixture,
    uuid: '5def7cc1-bc3a-4bd7-bcb7-d479e2cd231a',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
  },
  {
    ...employeeFixture,
    uuid: '693aa514-1856-4c49-b379-2945f9a1796a',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@example.com',
  },
  {
    ...employeeFixture,
    uuid: 'be385ee4-93aa-4c8a-a7ba-9b1521a9b65a',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez@example.com',
  },
]

const handlers = [
  http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, () => {
    return HttpResponse.json([])
  }),
  http.get(`${API_BASE_URL}/v1/payrolls/:payroll_uuid/receipt`, () => {
    return HttpResponse.json(receiptFixture.payroll_receipt)
  }),
  http.get(`${API_BASE_URL}/v1/companies/:company_id/employees`, () => {
    const response = HttpResponse.json(mockEmployees)
    response.headers.set('x-total-pages', '1')
    response.headers.set('x-total-count', String(mockEmployees.length))
    return response
  }),
  http.get(`${API_BASE_URL}/v1/companies/:company_id/bank_accounts`, () => {
    return HttpResponse.json(bankAccountsFixture)
  }),
  http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:pay_schedule_id`, () => {
    return HttpResponse.json({
      uuid: '1478a82e-b45c-4980-843a-6ddc3b78268e',
      frequency: 'Every other week',
      anchor_pay_date: '2025-08-15',
      anchor_end_of_pay_period: '2025-08-13',
      custom_name: 'Bi-Weekly Schedule',
      active: true,
    })
  }),
  http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () => {
    if (payrollSubmitted) {
      return HttpResponse.json(submittedPayrollFixture)
    }
    if (payrollCalculated) {
      return HttpResponse.json(calculatedPayrollFixture)
    }
    return HttpResponse.json(cleanPayrollFixture)
  }),
  http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`, () => {
    const prepareWithMatchingEmployees = {
      ...prepareFixture,
      employee_compensations: prepareFixture.employee_compensations.map((comp, idx) => ({
        ...comp,
        employee_uuid: mockEmployees[idx]?.uuid ?? comp.employee_uuid,
      })),
    }
    return HttpResponse.json(prepareWithMatchingEmployees)
  }),
  http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () => {
    return HttpResponse.json(cleanPayrollFixture)
  }),
  http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
    payrollCalculated = true
    return new HttpResponse(null, { status: 202 })
  }),
  http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/submit`, () => {
    payrollSubmitted = true
    return new HttpResponse(null, { status: 202 })
  }),
]

let workerStarted = false
let workerStarting: Promise<void> | null = null

async function ensureWorkerStarted() {
  if (workerStarted) return

  if (workerStarting) {
    await workerStarting
    return
  }

  const worker = setupWorker(...handlers)
  workerStarting = worker.start({ onUnhandledRequest: 'bypass' }).then(() => {
    workerStarted = true
  })
  await workerStarting
}

function WithMSW({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(workerStarted)

  useEffect(() => {
    if (!ready) {
      void ensureWorkerStarted().then(() => {
        setReady(true)
      })
    }
  }, [ready])

  if (!ready) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Starting mock server...</div>
  }

  return <>{children}</>
}

const createDemoPayroll = () => 'demo-payroll-uuid'

function OffCycleStoryWrapper({ children }: { children: ReactNode }) {
  const [isFlowActive, setIsFlowActive] = useState(false)

  if (!isFlowActive) {
    return (
      <WithMSW>
        <GustoTestProvider>
          <button onClick={() => { setIsFlowActive(true); }}>Start Off-Cycle Payroll</button>
        </GustoTestProvider>
      </WithMSW>
    )
  }

  return (
    <WithMSW>
      <GustoTestProvider>{children}</GustoTestProvider>
    </WithMSW>
  )
}

export const Default = () => (
  <OffCycleStoryWrapper>
    <OffCyclePayrollFlow
      companyId="test-company-uuid"
      onEvent={fn().mockName('onEvent')}
      onCreatePayroll={createDemoPayroll}
    />
  </OffCycleStoryWrapper>
)

export const WithReimbursementsDisabled = () => (
  <OffCycleStoryWrapper>
    <OffCyclePayrollFlow
      companyId="test-company-uuid"
      onEvent={fn().mockName('onEvent')}
      onCreatePayroll={createDemoPayroll}
      withReimbursements={false}
    />
  </OffCycleStoryWrapper>
)
