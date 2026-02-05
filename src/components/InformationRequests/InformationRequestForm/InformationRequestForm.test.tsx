import { Suspense } from 'react'
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
import { FlowContext } from '@/components/Flow/useFlow'

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
    const flowContextValue = {
      companyId: 'company-123',
      selectedRequestId: 'rfi-1',
      component: null,
      onEvent,
    }

    renderWithProviders(
      <FlowContext.Provider value={flowContextValue}>
        <Suspense fallback={<div>Loading...</div>}>
          <InformationRequestForm {...defaultProps} />
          <InformationRequestForm.Footer onEvent={onEvent} />
        </Suspense>
      </FlowContext.Provider>,
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

    const flowContextValue = {
      companyId: 'company-123',
      selectedRequestId: 'rfi-1',
      component: null,
      onEvent,
    }

    renderWithProviders(
      <FlowContext.Provider value={flowContextValue}>
        <Suspense fallback={<div>Loading...</div>}>
          <InformationRequestForm {...defaultProps} />
          <InformationRequestForm.Footer onEvent={onEvent} />
        </Suspense>
      </FlowContext.Provider>,
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

  describe('unsupported question types', () => {
    it('renders persona placeholder when request includes persona question type', async () => {
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
                  question_text: 'Please verify the signatory.',
                  response_type: 'persona',
                },
              ],
            },
          ])
        }),
      )

      renderWithProviders(<InformationRequestForm {...defaultProps} />)

      await screen.findByText('Verify identity')
      expect(
        screen.getByText(
          "In order to ensure the security of your account, we need some additional information to help verify your signatory's identity.",
        ),
      ).toBeInTheDocument()
      expect(screen.getByText('Please contact support')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Your answer')).not.toBeInTheDocument()
    })

    it('renders generic placeholder when request includes other unsupported question type', async () => {
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
                  question_text: 'Some experimental question.',
                  response_type: 'radio_button',
                },
              ],
            },
          ])
        }),
      )

      renderWithProviders(<InformationRequestForm {...defaultProps} />)

      await screen.findByText('Additional information required')
      expect(
        screen.getByText('We need some more information that we are unable to collect here.'),
      ).toBeInTheDocument()
      expect(screen.getByText('Please contact support')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Your answer')).not.toBeInTheDocument()
    })

    it('renders Close button in Footer when request has unsupported question types', async () => {
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
                  question_text: 'Please verify the signatory.',
                  response_type: 'persona',
                },
              ],
            },
          ])
        }),
      )

      const flowContextValue = {
        companyId: 'company-123',
        selectedRequestId: 'rfi-1',
        component: null,
        onEvent,
      }

      renderWithProviders(
        <FlowContext.Provider value={flowContextValue}>
          <Suspense fallback={<div>Loading...</div>}>
            <InformationRequestForm {...defaultProps} />
            <InformationRequestForm.Footer onEvent={onEvent} />
          </Suspense>
        </FlowContext.Provider>,
      )

      await screen.findByText('Verify identity')

      const closeButton = screen.getByRole('button', { name: 'Close' })
      expect(closeButton).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Submit response' })).not.toBeInTheDocument()

      await user.click(closeButton)

      expect(onEvent).toHaveBeenCalledWith(informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL)
    })
  })
})
