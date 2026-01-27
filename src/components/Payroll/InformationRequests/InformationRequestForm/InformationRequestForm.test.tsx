import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { InformationRequestForm } from './InformationRequestForm'
import { server } from '@/test/mocks/server'
import { informationRequestEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import {
  handleGetInformationRequests,
  handleSubmitInformationRequest,
} from '@/test/mocks/apis/information_requests'

describe('InformationRequestForm', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    companyId: 'company-123',
    requestId: 'rfi-1',
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
            required_questions: [
              {
                question_uuid: 'q-1',
                question_text: 'Please upload a document.',
                response_type: 'document',
              },
              {
                question_uuid: 'q-2',
                question_text: 'Please confirm by typing "Confirm".',
                response_type: 'text',
              },
            ],
          },
        ])
      }),
    )
  })

  it('renders the form title', async () => {
    renderWithProviders(<InformationRequestForm {...defaultProps} />)

    await screen.findByText('Request for information')
  })

  it('renders the blocking payroll alert when request is blocking', async () => {
    renderWithProviders(<InformationRequestForm {...defaultProps} />)

    await screen.findByText('This is a payroll blocking request')
    expect(
      screen.getByText(
        'You will not be able to run payroll until we receive the information requested below.',
      ),
    ).toBeInTheDocument()
  })

  it('does not render blocking alert when request is not blocking', async () => {
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
                question_text: 'Please confirm.',
                response_type: 'text',
              },
            ],
          },
        ])
      }),
    )

    renderWithProviders(<InformationRequestForm {...defaultProps} />)

    await screen.findByText('Request for information')
    expect(screen.queryByText('This is a payroll blocking request')).not.toBeInTheDocument()
  })

  it('renders text input field for text response type', async () => {
    renderWithProviders(<InformationRequestForm {...defaultProps} />)

    await screen.findByText('Please confirm by typing "Confirm".')
    expect(screen.getByText('Answer required')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your answer')).toBeInTheDocument()
  })

  it('renders file input for document response type', async () => {
    renderWithProviders(<InformationRequestForm {...defaultProps} />)

    await screen.findByText('Please upload a document.')
    expect(screen.getByText('Document required')).toBeInTheDocument()
  })

  it('fires cancel event when Footer cancel button is clicked', async () => {
    renderWithProviders(
      <>
        <InformationRequestForm {...defaultProps} />
        <InformationRequestForm.Footer onEvent={onEvent} />
      </>,
    )

    await screen.findByText('Request for information')

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(onEvent).toHaveBeenCalledWith(informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL)
  })

  it('submits form with text response and passes response data to onEvent', async () => {
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
                question_text: 'Please confirm.',
                response_type: 'text',
              },
            ],
          },
        ])
      }),
      handleSubmitInformationRequest(() => {
        return HttpResponse.json({
          uuid: 'rfi-1',
          company_uuid: 'company-123',
          type: 'company_onboarding',
          status: 'pending_review',
          blocking_payroll: false,
        })
      }),
    )

    renderWithProviders(
      <>
        <InformationRequestForm {...defaultProps} />
        <InformationRequestForm.Footer onEvent={onEvent} />
      </>,
    )

    await screen.findByText('Request for information')

    const textInput = screen.getByPlaceholderText('Your answer')
    await user.type(textInput, 'Confirm')

    const submitButton = screen.getByRole('button', { name: 'Submit response' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        informationRequestEvents.INFORMATION_REQUEST_FORM_DONE,
        expect.objectContaining({
          uuid: 'rfi-1',
          companyUuid: 'company-123',
          type: 'company_onboarding',
          status: 'pending_review',
          blockingPayroll: false,
        }),
      )
    })
  })
})
