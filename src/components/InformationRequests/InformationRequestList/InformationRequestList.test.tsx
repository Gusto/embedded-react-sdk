import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { InformationRequestList } from './InformationRequestList'
import { server } from '@/test/mocks/server'
import { informationRequestEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import {
  handleGetInformationRequests,
  getEmptyInformationRequests,
} from '@/test/mocks/apis/information_requests'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium'],
    useContainerBreakpoints: () => ['base', 'small', 'medium'],
  }
})

describe('InformationRequestList', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetInformationRequests(() => {
        return HttpResponse.json([
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
            status: 'pending_review',
            blocking_payroll: true,
            required_questions: [],
          },
          {
            uuid: 'rfi-3',
            company_uuid: 'company-123',
            type: 'company_onboarding',
            status: 'approved',
            blocking_payroll: true,
            required_questions: [],
          },
          {
            uuid: 'rfi-4',
            company_uuid: 'company-123',
            type: 'payment_request',
            status: 'pending_response',
            blocking_payroll: false,
            required_questions: [],
          },
        ])
      }),
    )
  })

  describe('filtering behavior', () => {
    it('renders all information requests that are not approved', async () => {
      renderWithProviders(<InformationRequestList {...defaultProps} />)

      await screen.findByText('Company Onboarding')

      expect(screen.getByText('Account Protection')).toBeInTheDocument()
      expect(screen.getByText('Payment Request')).toBeInTheDocument()
      expect(screen.getAllByText('Company Onboarding')).toHaveLength(1)
    })

    it('displays Payroll blocking badge for blocking requests', async () => {
      renderWithProviders(<InformationRequestList {...defaultProps} />)

      await screen.findByText('Company Onboarding')

      const payrollBlockingBadges = screen.getAllByText('Payroll blocking')
      expect(payrollBlockingBadges).toHaveLength(2)
    })

    it('does not display Payroll blocking badge for non-blocking requests', async () => {
      renderWithProviders(<InformationRequestList {...defaultProps} />)

      await screen.findByText('Payment Request')

      const row = screen.getByText('Payment Request').closest('tr') as HTMLElement
      expect(row).not.toHaveTextContent('Payroll blocking')
    })
  })

  it('displays correct status badges', async () => {
    renderWithProviders(<InformationRequestList {...defaultProps} />)

    await screen.findAllByText('Incomplete')

    expect(screen.getAllByText('Incomplete')).toHaveLength(2)
    expect(screen.getByText('Under review')).toBeInTheDocument()
  })

  it('shows Respond button only for pending_response status', async () => {
    renderWithProviders(<InformationRequestList {...defaultProps} />)

    await screen.findByText('Company Onboarding')

    const respondButtons = screen.getAllByRole('button', { name: 'Respond' })
    expect(respondButtons).toHaveLength(2)
  })

  it('fires event when Respond button is clicked', async () => {
    renderWithProviders(<InformationRequestList {...defaultProps} />)

    await screen.findByText('Company Onboarding')

    const respondButton = screen.getAllByRole('button', { name: 'Respond' })[0] as HTMLElement
    await user.click(respondButton)

    expect(onEvent).toHaveBeenCalledWith(informationRequestEvents.INFORMATION_REQUEST_RESPOND, {
      requestId: 'rfi-1',
    })
  })

  it('renders empty table when no requests exist', async () => {
    server.use(getEmptyInformationRequests)

    renderWithProviders(<InformationRequestList {...defaultProps} />)

    await screen.findByText('Information requests')

    expect(screen.queryByText('Company Onboarding')).not.toBeInTheDocument()
  })
})
