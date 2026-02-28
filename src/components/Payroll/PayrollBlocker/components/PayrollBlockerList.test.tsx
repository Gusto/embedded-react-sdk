import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { PayrollBlockerList } from './PayrollBlockerList'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { handleGetRecoveryCases } from '@/test/mocks/apis/recovery_cases'
import { handleGetInformationRequests } from '@/test/mocks/apis/information_requests'
import { handleGetPayrollBlockers } from '@/test/mocks/apis/payrolls'
import { recoveryCasesEvents, informationRequestEvents } from '@/shared/constants'

let mockRecoveryCasesOnEvent: ((type: string, data?: unknown) => void) | null = null
let mockInformationRequestsOnEvent: ((type: string, data?: unknown) => void) | null = null

vi.mock('@/components/Payroll/RecoveryCases', () => ({
  RecoveryCases: ({ onEvent }: { onEvent: (type: string, data?: unknown) => void }) => {
    mockRecoveryCasesOnEvent = onEvent
    return <div data-testid="mock-recovery-cases">Recovery cases</div>
  },
}))

vi.mock('@/components/InformationRequests', () => ({
  InformationRequestsFlow: ({ onEvent }: { onEvent: (type: string, data?: unknown) => void }) => {
    mockInformationRequestsOnEvent = onEvent
    return <div data-testid="mock-information-requests">Information requests</div>
  },
}))

setupApiTestMocks()

const defaultOnEvent = vi.fn()

function renderPayrollBlockerList(props: { companyId: string; className?: string }) {
  return renderWithProviders(
    <PayrollBlockerList
      onEvent={defaultOnEvent}
      companyId={props.companyId}
      className={props.className}
    />,
  )
}

const mockCompanyId = 'company-123'

const createMockBlocker = (overrides: Record<string, unknown> = {}) => ({
  key: 'missing_tax_info',
  message: 'Please complete your tax setup before running payroll.',
  ...overrides,
})

describe('PayrollBlockerList', () => {
  beforeEach(() => {
    defaultOnEvent.mockClear()
    mockRecoveryCasesOnEvent = null
    mockInformationRequestsOnEvent = null
    server.use(
      handleGetPayrollBlockers(() => HttpResponse.json([])),
      handleGetRecoveryCases(() => HttpResponse.json([])),
      handleGetInformationRequests(() => HttpResponse.json([])),
    )
  })

  describe('rendering behavior', () => {
    it('renders empty state message when no blockers, recovery cases, or information requests exist', async () => {
      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByText('No payroll blockers at this time.')).toBeInTheDocument()
      expect(screen.queryByText('Payroll blockers')).not.toBeInTheDocument()
      expect(screen.queryByTestId('data-view')).not.toBeInTheDocument()
    })

    it('renders list title when blockers exist', async () => {
      server.use(handleGetPayrollBlockers(() => HttpResponse.json([createMockBlocker()])))

      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByText('Payroll blockers')).toBeInTheDocument()
    })

    it('renders DataView component with proper label', async () => {
      server.use(handleGetPayrollBlockers(() => HttpResponse.json([createMockBlocker()])))

      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByTestId('data-view')).toBeInTheDocument()
      expect(await screen.findByRole('list')).toBeInTheDocument()
    })

    it('applies custom className when provided', async () => {
      server.use(handleGetPayrollBlockers(() => HttpResponse.json([createMockBlocker()])))
      const customClass = 'custom-blocker-list'

      const { container } = renderPayrollBlockerList({
        companyId: mockCompanyId,
        className: customClass,
      })

      await screen.findByText('Payroll blockers')
      expect(container.querySelector(`.${customClass}`)).toBeInTheDocument()
    })
  })

  describe('blocker content rendering', () => {
    it('displays blocker title and description', async () => {
      server.use(
        handleGetPayrollBlockers(() =>
          HttpResponse.json([
            {
              key: 'missing_signatory',
              message: 'Confirm that the company has a signatory.',
            },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByText('Signatory Required')).toBeInTheDocument()
      expect(
        await screen.findByText(
          'A signatory who is authorized to sign documents on behalf of your company is required.',
        ),
      ).toBeInTheDocument()
    })

    it('renders multiple blockers', async () => {
      server.use(
        handleGetPayrollBlockers(() =>
          HttpResponse.json([
            { key: 'missing_signatory', message: 'First description' },
            { key: 'suspended', message: 'Second description' },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByText('Signatory Required')).toBeInTheDocument()
      expect(
        await screen.findByText(
          'A signatory who is authorized to sign documents on behalf of your company is required.',
        ),
      ).toBeInTheDocument()
      expect(await screen.findByText('Company Suspended')).toBeInTheDocument()
      expect(
        await screen.findByText('Company is suspended and cannot run payroll.'),
      ).toBeInTheDocument()
    })
  })

  describe('DataView integration', () => {
    it('passes blockers data to DataView', async () => {
      server.use(
        handleGetPayrollBlockers(() =>
          HttpResponse.json([
            { key: 'missing_signatory', message: 'Test 1' },
            { key: 'suspended', message: 'Test 2' },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByText('Signatory Required')).toBeInTheDocument()
      expect(await screen.findByText('Company Suspended')).toBeInTheDocument()
    })

    it('renders correct column structure', async () => {
      server.use(
        handleGetPayrollBlockers(() =>
          HttpResponse.json([{ key: 'missing_signatory', message: 'Testing column structure' }]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByText('Signatory Required')).toBeInTheDocument()
      expect(
        await screen.findByText(
          'A signatory who is authorized to sign documents on behalf of your company is required.',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper heading structure', async () => {
      server.use(handleGetPayrollBlockers(() => HttpResponse.json([createMockBlocker()])))

      renderPayrollBlockerList({ companyId: mockCompanyId })

      const heading = await screen.findByRole('heading', { name: 'Payroll blockers' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })
  })

  describe('recovery cases and information requests integration', () => {
    it('renders recovery cases section when unrecovered cases exist', async () => {
      server.use(
        handleGetRecoveryCases(() =>
          HttpResponse.json([{ uuid: 'rc-1', company_uuid: mockCompanyId, status: 'open' }]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByText('Recovery cases')).toBeInTheDocument()
    })

    it('does not render recovery cases section when all cases are recovered', async () => {
      server.use(
        handleGetRecoveryCases(() =>
          HttpResponse.json([{ uuid: 'rc-1', company_uuid: mockCompanyId, status: 'recovered' }]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      await new Promise(resolve => setTimeout(resolve, 200))

      expect(screen.queryByText('Recovery cases')).not.toBeInTheDocument()
    })

    it('renders information requests section when non-approved requests exist', async () => {
      server.use(
        handleGetInformationRequests(() =>
          HttpResponse.json([
            {
              uuid: 'rfi-1',
              company_uuid: mockCompanyId,
              type: 'company_onboarding',
              status: 'pending_response',
              blocking_payroll: false,
            },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByText('Information requests')).toBeInTheDocument()
    })

    it('does not render information requests section when all requests are approved', async () => {
      server.use(
        handleGetInformationRequests(() =>
          HttpResponse.json([
            {
              uuid: 'rfi-1',
              company_uuid: mockCompanyId,
              type: 'company_onboarding',
              status: 'approved',
              blocking_payroll: true,
            },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      await new Promise(resolve => setTimeout(resolve, 200))

      expect(screen.queryByText('Information requests')).not.toBeInTheDocument()
    })

    it('renders all sections when blockers, recovery cases, and information requests exist', async () => {
      server.use(
        handleGetPayrollBlockers(() => HttpResponse.json([createMockBlocker()])),
        handleGetRecoveryCases(() =>
          HttpResponse.json([{ uuid: 'rc-1', company_uuid: mockCompanyId, status: 'open' }]),
        ),
        handleGetInformationRequests(() =>
          HttpResponse.json([
            {
              uuid: 'rfi-1',
              company_uuid: mockCompanyId,
              type: 'company_onboarding',
              status: 'pending_response',
              blocking_payroll: true,
            },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByText('Payroll blockers')).toBeInTheDocument()
      expect(await screen.findByText('Recovery cases')).toBeInTheDocument()
      expect(await screen.findByText('Information requests')).toBeInTheDocument()
    })
  })

  describe('submission alerts', () => {
    it('does not render any alerts initially', async () => {
      server.use(
        handleGetRecoveryCases(() =>
          HttpResponse.json([
            {
              uuid: 'rc-1',
              company_uuid: mockCompanyId,
              status: 'open',
              latest_error_code: 'R01',
            },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      await screen.findByText('Recovery cases')

      expect(screen.queryByText('Payment resubmitted')).not.toBeInTheDocument()
      expect(screen.queryByText("We've received your response")).not.toBeInTheDocument()
    })

    it('displays recovery case alert when resubmit done event is triggered', async () => {
      server.use(
        handleGetRecoveryCases(() =>
          HttpResponse.json([
            {
              uuid: 'rc-1',
              company_uuid: mockCompanyId,
              status: 'open',
            },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      await screen.findByTestId('mock-recovery-cases')

      mockRecoveryCasesOnEvent?.(recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE, {
        recoveryCaseId: 'rc-1',
      })

      await waitFor(() => {
        expect(screen.getByText('Payment resubmitted')).toBeInTheDocument()
      })
      expect(
        screen.getByText(
          'We are reviewing your submission and will reach out if we need any additional information.',
        ),
      ).toBeInTheDocument()
    })

    it('displays information request alert when form done event is triggered', async () => {
      server.use(
        handleGetInformationRequests(() =>
          HttpResponse.json([
            {
              uuid: 'rfi-1',
              company_uuid: mockCompanyId,
              type: 'company_onboarding',
              status: 'pending_response',
              blocking_payroll: true,
            },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      await screen.findByTestId('mock-information-requests')

      mockInformationRequestsOnEvent?.(informationRequestEvents.INFORMATION_REQUEST_FORM_DONE, {
        requestId: 'rfi-1',
      })

      await waitFor(() => {
        expect(screen.getByText("We've received your response")).toBeInTheDocument()
      })
      expect(
        screen.getByText(
          'We are reviewing your submission and will reach out if we need any additional information.',
        ),
      ).toBeInTheDocument()
    })

    it('allows dismissing alerts', async () => {
      const user = userEvent.setup()

      server.use(
        handleGetRecoveryCases(() =>
          HttpResponse.json([
            {
              uuid: 'rc-1',
              company_uuid: mockCompanyId,
              status: 'open',
            },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      await screen.findByTestId('mock-recovery-cases')

      mockRecoveryCasesOnEvent?.(recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE, {
        recoveryCaseId: 'rc-1',
      })

      await waitFor(() => {
        expect(screen.getByText('Payment resubmitted')).toBeInTheDocument()
      })

      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      await user.click(dismissButton)

      await waitFor(() => {
        expect(screen.queryByText('Payment resubmitted')).not.toBeInTheDocument()
      })
    })

    it('displays newest alerts at the top', async () => {
      server.use(
        handleGetRecoveryCases(() =>
          HttpResponse.json([
            {
              uuid: 'rc-1',
              company_uuid: mockCompanyId,
              status: 'open',
            },
          ]),
        ),
        handleGetInformationRequests(() =>
          HttpResponse.json([
            {
              uuid: 'rfi-1',
              company_uuid: mockCompanyId,
              type: 'company_onboarding',
              status: 'pending_response',
              blocking_payroll: true,
            },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      await screen.findByTestId('mock-recovery-cases')
      await screen.findByTestId('mock-information-requests')

      mockRecoveryCasesOnEvent?.(recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE, {
        recoveryCaseId: 'rc-1',
      })

      await waitFor(() => {
        expect(screen.getByText('Payment resubmitted')).toBeInTheDocument()
      })

      mockInformationRequestsOnEvent?.(informationRequestEvents.INFORMATION_REQUEST_FORM_DONE, {
        requestId: 'rfi-1',
      })

      await waitFor(() => {
        expect(screen.getByText("We've received your response")).toBeInTheDocument()
      })

      const alerts = screen.getAllByRole('alert')
      expect(alerts).toHaveLength(2)
      expect(alerts[0]).toHaveTextContent("We've received your response")
      expect(alerts[1]).toHaveTextContent('Payment resubmitted')
    })

    it('bubbles events to parent onEvent callback', async () => {
      server.use(
        handleGetRecoveryCases(() =>
          HttpResponse.json([
            {
              uuid: 'rc-1',
              company_uuid: mockCompanyId,
              status: 'open',
            },
          ]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      await screen.findByTestId('mock-recovery-cases')

      mockRecoveryCasesOnEvent?.(recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE, {
        recoveryCaseId: 'rc-1',
      })

      expect(defaultOnEvent).toHaveBeenCalledWith(recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE, {
        recoveryCaseId: 'rc-1',
      })
    })
  })
})
