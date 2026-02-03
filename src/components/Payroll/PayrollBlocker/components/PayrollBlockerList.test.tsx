import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { PayrollBlockerList } from './PayrollBlockerList'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { handleGetRecoveryCases } from '@/test/mocks/apis/recovery_cases'
import { handleGetInformationRequests } from '@/test/mocks/apis/information_requests'
import { handleGetPayrollBlockers } from '@/test/mocks/apis/payrolls'

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

      // Title defaults to key converted to title case when translations aren't loaded
      expect(await screen.findByText('Missing Signatory')).toBeInTheDocument()
      expect(
        await screen.findByText('Confirm that the company has a signatory.'),
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

      expect(await screen.findByText('Missing Signatory')).toBeInTheDocument()
      expect(await screen.findByText('First description')).toBeInTheDocument()
      expect(await screen.findByText('Suspended')).toBeInTheDocument()
      expect(await screen.findByText('Second description')).toBeInTheDocument()
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

      expect(await screen.findByText('Missing Signatory')).toBeInTheDocument()
      expect(await screen.findByText('Suspended')).toBeInTheDocument()
    })

    it('renders correct column structure', async () => {
      server.use(
        handleGetPayrollBlockers(() =>
          HttpResponse.json([{ key: 'missing_signatory', message: 'Testing column structure' }]),
        ),
      )

      renderPayrollBlockerList({ companyId: mockCompanyId })

      expect(await screen.findByText('Missing Signatory')).toBeInTheDocument()
      expect(await screen.findByText('Testing column structure')).toBeInTheDocument()
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

    it('renders information requests section when blocking requests exist', async () => {
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

      expect(await screen.findByText('Information requests')).toBeInTheDocument()
    })

    it('does not render information requests section when no blocking requests exist', async () => {
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
})
