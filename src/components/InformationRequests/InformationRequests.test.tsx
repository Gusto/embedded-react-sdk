import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { InformationRequestsFlow } from './InformationRequests'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetInformationRequests } from '@/test/mocks/apis/information_requests'

describe('InformationRequestsFlow', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

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
            blocking_payroll: false,
            required_questions: [
              {
                question_uuid: 'q-1',
                question_text: 'First request question text.',
                response_type: 'text',
              },
            ],
          },
          {
            uuid: 'rfi-2',
            company_uuid: 'company-123',
            type: 'payment_request',
            status: 'pending_response',
            blocking_payroll: false,
            required_questions: [
              {
                question_uuid: 'q-2',
                question_text: 'Second request question text.',
                response_type: 'text',
              },
            ],
          },
        ])
      }),
    )
  })

  const respondTo = async (rowTypeLabel: string) => {
    const row = (await screen.findByText(rowTypeLabel)).closest('tr') as HTMLElement
    await user.click(within(row).getByRole('button', { name: 'Respond' }))
  }

  it('shows Submit and Cancel buttons in the modal footer when responding to a request', async () => {
    renderWithProviders(<InformationRequestsFlow companyId="company-123" onEvent={onEvent} />)

    await respondTo('Company Onboarding')

    await screen.findByText('First request question text.')
    expect(screen.getByRole('button', { name: 'Submit response' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('returns to the list and closes the modal after cancelling', async () => {
    renderWithProviders(<InformationRequestsFlow companyId="company-123" onEvent={onEvent} />)

    await respondTo('Company Onboarding')
    await screen.findByText('First request question text.')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByText('First request question text.')).not.toBeInTheDocument()
    })
  })

  it('shows the correct request after dismissing via the backdrop and responding to a different request', async () => {
    renderWithProviders(<InformationRequestsFlow companyId="company-123" onEvent={onEvent} />)

    await respondTo('Company Onboarding')
    await screen.findByText('First request question text.')

    // Dismiss without going through the Footer's Cancel button -- e.g. pressing Escape --
    // which previously left the state machine stuck in the `form` state while
    // `isModalOpen` alone flipped back to false (SDK-1229).
    fireEvent.keyDown(screen.getByRole('presentation'), { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('First request question text.')).not.toBeInTheDocument()
    })

    await respondTo('Payment Request')

    await screen.findByText('Second request question text.')
    expect(screen.queryByText('First request question text.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit response' })).toBeInTheDocument()
  })
})
