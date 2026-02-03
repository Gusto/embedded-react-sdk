import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import type { ApiPayrollBlocker } from '../payrollHelpers'
import { PayrollBlockerAlerts } from './PayrollBlockerAlerts'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { server } from '@/test/mocks/server'
import {
  handleGetInformationRequests,
  getEmptyInformationRequests,
} from '@/test/mocks/apis/information_requests'
import { handleGetRecoveryCases } from '@/test/mocks/apis/recovery_cases'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

const createMockBlocker = (overrides: Partial<ApiPayrollBlocker> = {}): ApiPayrollBlocker => ({
  key: 'blocker-1',
  message: 'Test Blocker',
  ...overrides,
})

describe('PayrollBlockerAlerts', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      getEmptyInformationRequests,
      handleGetRecoveryCases(() => HttpResponse.json([])),
    )
  })

  describe('rendering behavior', () => {
    it('applies custom className when provided', async () => {
      const blockers = [createMockBlocker()]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} className="custom-class" />)
      const alertElement = await screen.findByRole('alert')
      const wrapper = alertElement.closest('div.custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('renders nothing when blockers array is empty', () => {
      renderWithProviders(<PayrollBlockerAlerts blockers={[]} />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('translation keys usage', () => {
    it('uses translation key for known blocker (missing_signatory)', async () => {
      const blocker = createMockBlocker({
        key: 'missing_signatory',
        message: 'This should not be displayed',
      })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)

      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toHaveAccessibleName('Signatory Required')
      expect(
        await screen.findByText(
          'A signatory who is authorized to sign documents on behalf of your company is required.',
        ),
      ).toBeInTheDocument()
      expect(screen.queryByText('This should not be displayed')).not.toBeInTheDocument()
    })

    it('uses translation key for known blocker (pending_recovery_case)', async () => {
      const blocker = createMockBlocker({
        key: 'pending_recovery_case',
        message: 'API message should be ignored',
      })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)

      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toHaveAccessibleName('Recovery case pending')
      expect(
        await screen.findByText(
          'You have unresolved recovery cases. Resolve them to unblock your account.',
        ),
      ).toBeInTheDocument()
      expect(screen.queryByText('API message should be ignored')).not.toBeInTheDocument()
    })

    it('uses translation key for known blocker (pending_information_request)', async () => {
      const blocker = createMockBlocker({
        key: 'pending_information_request',
        message: 'API message should be ignored',
      })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)

      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toHaveAccessibleName('Request for information pending')
      expect(
        await screen.findByText(
          'You have outstanding requests for information. Respond to unblock payroll.',
        ),
      ).toBeInTheDocument()
      expect(screen.queryByText('API message should be ignored')).not.toBeInTheDocument()
    })

    it('falls back to default translation for unknown blocker key', async () => {
      const blocker = createMockBlocker({
        key: 'completely_unknown_blocker',
        message: 'Fallback to this message',
      })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)

      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toHaveAccessibleName('Unknown blocker')
      expect(await screen.findByText('Fallback to this message')).toBeInTheDocument()
    })
  })

  describe('single blocker', () => {
    it('displays component correctly with help text', async () => {
      const blocker = createMockBlocker({
        key: 'missing_bank_info',
        message: 'Main message',
      })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)
      expect(await screen.findByRole('alert')).toHaveAccessibleName('Bank Account Required')
      expect(
        await screen.findByText('Company must have a bank account in order to run payroll.'),
      ).toBeInTheDocument()
    })
  })

  describe('multiple blockers', () => {
    it('displays count in title', async () => {
      const blockers = [
        createMockBlocker({ key: 'missing_bank_info' }),
        createMockBlocker({ key: 'missing_signatory' }),
      ]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} />)
      expect(
        await screen.findByText('2 issues are preventing you from running payroll'),
      ).toBeInTheDocument()
    })

    it('shows view all button when onMultipleViewClick is provided', async () => {
      const blockers = [
        createMockBlocker({ key: 'missing_bank_info' }),
        createMockBlocker({ key: 'missing_signatory' }),
      ]
      const mockViewClick = vi.fn()
      renderWithProviders(
        <PayrollBlockerAlerts blockers={blockers} onMultipleViewClick={mockViewClick} />,
      )
      expect(await screen.findByRole('button', { name: 'View All Blockers' })).toBeInTheDocument()
    })
  })

  describe('synthetic blockers from API data', () => {
    it('adds pending_information_request blocker when blocking RFIs exist', async () => {
      server.use(
        handleGetInformationRequests(() =>
          HttpResponse.json([
            {
              uuid: 'rfi-1',
              company_uuid: 'company-123',
              type: 'company_onboarding',
              status: 'pending_response',
              blocking_payroll: true,
              required_questions: [],
            },
          ]),
        ),
      )

      const blockers = [createMockBlocker({ key: 'missing_bank_info' })]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} companyId="company-123" />)

      expect(
        await screen.findByText('2 issues are preventing you from running payroll'),
      ).toBeInTheDocument()
      expect(screen.getByText('Request for information pending')).toBeInTheDocument()
    })

    it('adds pending_recovery_case blocker when unresolved recovery cases exist', async () => {
      server.use(
        handleGetRecoveryCases(() =>
          HttpResponse.json([
            {
              uuid: 'rc-1',
              company_uuid: 'company-123',
              status: 'open',
              latest_error_code: 'R01',
              original_debit_date: '2024-01-05',
              check_date: '2024-01-09',
              payroll_uuid: 'payroll-1',
              contractor_payment_uuids: null,
              amount_outstanding: '1000.00',
              event_total_amount: '1000.00',
            },
          ]),
        ),
      )

      const blockers = [createMockBlocker({ key: 'missing_signatory' })]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} companyId="company-123" />)

      expect(
        await screen.findByText('2 issues are preventing you from running payroll'),
      ).toBeInTheDocument()
      expect(screen.getByText('Recovery case pending')).toBeInTheDocument()
    })

    it('only displays one pending_information_request blocker even with multiple RFIs', async () => {
      server.use(
        handleGetInformationRequests(() =>
          HttpResponse.json([
            {
              uuid: 'rfi-1',
              company_uuid: 'company-123',
              type: 'company_onboarding',
              status: 'pending_response',
              blocking_payroll: true,
              required_questions: [],
            },
            {
              uuid: 'rfi-2',
              company_uuid: 'company-123',
              type: 'account_protection',
              status: 'pending_response',
              blocking_payroll: true,
              required_questions: [],
            },
            {
              uuid: 'rfi-3',
              company_uuid: 'company-123',
              type: 'company_onboarding',
              status: 'pending_review',
              blocking_payroll: true,
              required_questions: [],
            },
          ]),
        ),
      )

      const blockers = [createMockBlocker({ key: 'missing_bank_info' })]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} companyId="company-123" />)

      expect(
        await screen.findByText('2 issues are preventing you from running payroll'),
      ).toBeInTheDocument()

      const rfiElements = screen.getAllByText('Request for information pending')
      expect(rfiElements).toHaveLength(1)
    })

    it('only displays one pending_recovery_case blocker even with multiple recovery cases', async () => {
      server.use(
        handleGetRecoveryCases(() =>
          HttpResponse.json([
            {
              uuid: 'rc-1',
              company_uuid: 'company-123',
              status: 'open',
              latest_error_code: 'R01',
              original_debit_date: '2024-01-05',
              check_date: '2024-01-09',
              payroll_uuid: 'payroll-1',
              contractor_payment_uuids: null,
              amount_outstanding: '1000.00',
              event_total_amount: '1000.00',
            },
            {
              uuid: 'rc-2',
              company_uuid: 'company-123',
              status: 'open',
              latest_error_code: 'R16',
              original_debit_date: '2024-01-10',
              check_date: '2024-01-15',
              payroll_uuid: 'payroll-2',
              contractor_payment_uuids: null,
              amount_outstanding: '2500.00',
              event_total_amount: '2500.00',
            },
            {
              uuid: 'rc-3',
              company_uuid: 'company-123',
              status: 'redebit_initiated',
              latest_error_code: 'R03',
              original_debit_date: '2024-01-12',
              check_date: '2024-01-20',
              payroll_uuid: 'payroll-3',
              contractor_payment_uuids: null,
              amount_outstanding: '500.00',
              event_total_amount: '500.00',
            },
          ]),
        ),
      )

      const blockers = [createMockBlocker({ key: 'missing_signatory' })]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} companyId="company-123" />)

      expect(
        await screen.findByText('2 issues are preventing you from running payroll'),
      ).toBeInTheDocument()

      const rcElements = screen.getAllByText('Recovery case pending')
      expect(rcElements).toHaveLength(1)
    })

    it('deduplicates blockers when API returns duplicate blocker keys', async () => {
      const blockers = [
        createMockBlocker({ key: 'missing_bank_info' }),
        createMockBlocker({ key: 'missing_signatory' }),
        createMockBlocker({ key: 'missing_bank_info' }), // Duplicate
      ]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} />)

      expect(
        await screen.findByText('2 issues are preventing you from running payroll'),
      ).toBeInTheDocument()

      const bankElements = screen.getAllByText('Bank Account Required')
      expect(bankElements).toHaveLength(1)
    })
  })
})
