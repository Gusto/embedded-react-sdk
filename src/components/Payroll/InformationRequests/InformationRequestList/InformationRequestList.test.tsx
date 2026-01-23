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

  it('renders information requests that are payroll blocking and not approved', async () => {
    renderWithProviders(<InformationRequestList {...defaultProps} />)

    await screen.findByText('Company Onboarding')

    expect(screen.getByText('Account Protection')).toBeInTheDocument()
    expect(screen.queryByText('Payment Request')).not.toBeInTheDocument()
    expect(screen.getAllByText('Company Onboarding')).toHaveLength(1)
  })

  it('displays correct status badges', async () => {
    renderWithProviders(<InformationRequestList {...defaultProps} />)

    await screen.findByText('Incomplete')

    expect(screen.getByText('Under review')).toBeInTheDocument()
  })

  it('shows Respond button only for pending_response status', async () => {
    renderWithProviders(<InformationRequestList {...defaultProps} />)

    await screen.findByText('Company Onboarding')

    const respondButtons = screen.getAllByRole('button', { name: 'Respond' })
    expect(respondButtons).toHaveLength(1)
  })

  it('fires event when Respond button is clicked', async () => {
    renderWithProviders(<InformationRequestList {...defaultProps} />)

    await screen.findByText('Company Onboarding')

    const respondButton = screen.getByRole('button', { name: 'Respond' })
    await user.click(respondButton)

    expect(onEvent).toHaveBeenCalledWith(informationRequestEvents.INFORMATION_REQUEST_RESPOND, {
      requestId: 'rfi-1',
    })
  })

  it('renders empty table when no payroll blocking requests exist', async () => {
    server.use(getEmptyInformationRequests)

    renderWithProviders(<InformationRequestList {...defaultProps} />)

    await screen.findByText('Information requests')

    expect(screen.queryByText('Company Onboarding')).not.toBeInTheDocument()
  })
})
