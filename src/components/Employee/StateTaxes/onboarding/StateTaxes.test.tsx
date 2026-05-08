import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import {
  caEmployeeStateTaxes,
  emptyStateTaxes,
  multiStateEmployeeStateTaxes,
  nyEmployeeStateTaxes,
  unsetAnswersStateTaxes,
} from '../shared/useEmployeeStateTaxesForm/__fixtures__/stateTaxesFixtures'
import { toWireStateTaxes } from '../shared/useEmployeeStateTaxesForm/__fixtures__/toWireFormat'
import { StateTaxes } from './StateTaxes'
import { server } from '@/test/mocks/server'
import {
  handleGetEmployeeStateTaxes,
  handleUpdateEmployeeStateTaxes,
} from '@/test/mocks/apis/employee_state_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Employee.StateTaxes (onboarding)', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    mockOnEvent.mockClear()
  })

  function mockGet(taxes: typeof caEmployeeStateTaxes) {
    server.use(
      handleGetEmployeeStateTaxes(() => HttpResponse.json(toWireStateTaxes(taxes))),
      handleUpdateEmployeeStateTaxes(() => HttpResponse.json(toWireStateTaxes(taxes))),
    )
  }

  describe('CA fixture', () => {
    it('renders the state heading and visible questions for non-admin', async () => {
      mockGet(caEmployeeStateTaxes)

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={false} onEvent={mockOnEvent} />,
      )

      await screen.findByRole('heading', { name: /California Tax Requirements/i })
      expect(screen.getByLabelText(/Filing Status/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Withholding Allowance/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Additional Withholding/i)).toBeInTheDocument()
      expect(screen.queryByText(/File a New Hire Report/i)).not.toBeInTheDocument()
    })

    it('renders the file_new_hire_report question as a Radio (not Select) for admin', async () => {
      mockGet(caEmployeeStateTaxes)

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={true} onEvent={mockOnEvent} />,
      )

      await screen.findByRole('heading', { name: /California Tax Requirements/i })

      expect(
        screen.getByRole('radio', { name: /Yes, file the state new hire report for me/i }),
      ).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /No, I have already filed/i })).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /Yes, file the state new hire report for me/i }),
      ).not.toBeInTheDocument()
    })

    it('disables file_new_hire_report when an answer was already recorded', async () => {
      mockGet(caEmployeeStateTaxes)

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={true} onEvent={mockOnEvent} />,
      )

      await screen.findByRole('heading', { name: /California Tax Requirements/i })

      const yes = screen.getByRole('radio', {
        name: /Yes, file the state new hire report for me/i,
      })
      const no = screen.getByRole('radio', { name: /No, I have already filed/i })
      expect(yes).toBeDisabled()
      expect(no).toBeDisabled()
    })

    it('submits a byte-equal request body and emits UPDATED + DONE events', async () => {
      mockGet(caEmployeeStateTaxes)

      const user = userEvent.setup()
      let capturedRequestBody: Record<string, unknown> | null = null
      server.use(
        handleUpdateEmployeeStateTaxes(async ({ request }) => {
          capturedRequestBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json(toWireStateTaxes(caEmployeeStateTaxes))
        }),
      )

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={false} onEvent={mockOnEvent} />,
      )

      await screen.findByRole('heading', { name: /California Tax Requirements/i })
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_STATE_TAXES_DONE)
      })
      expect(mockOnEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_STATE_TAXES_UPDATED,
        expect.objectContaining({ employeeStateTaxesList: expect.any(Array) }),
      )

      expect(capturedRequestBody).toEqual({
        states: [
          {
            state: 'CA',
            questions: [
              {
                key: 'filing_status',
                answers: [{ value: 'S', valid_from: '2010-01-01', valid_up_to: null }],
              },
              {
                key: 'withholding_allowance',
                answers: [{ value: 1, valid_from: '2010-01-01', valid_up_to: null }],
              },
              {
                key: 'additional_withholding',
                answers: [{ value: 0, valid_from: '2010-01-01', valid_up_to: null }],
              },
            ],
          },
        ],
      })
    })

    it('admin submission includes file_new_hire_report with byte-stable validFrom', async () => {
      mockGet(caEmployeeStateTaxes)

      const user = userEvent.setup()
      let capturedRequestBody: Record<string, unknown> | null = null
      server.use(
        handleUpdateEmployeeStateTaxes(async ({ request }) => {
          capturedRequestBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json(toWireStateTaxes(caEmployeeStateTaxes))
        }),
      )

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={true} onEvent={mockOnEvent} />,
      )

      await screen.findByRole('heading', { name: /California Tax Requirements/i })
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_STATE_TAXES_DONE)
      })

      const states = (
        capturedRequestBody as unknown as {
          states: Array<{ questions: Array<unknown> }>
        }
      ).states
      expect(states[0]!.questions).toHaveLength(4)
      expect(states[0]!.questions[3]).toEqual({
        key: 'file_new_hire_report',
        answers: [{ value: false, valid_from: '2010-01-01', valid_up_to: null }],
      })
    })

    it('renders sanitized HTML in the API description', async () => {
      mockGet(caEmployeeStateTaxes)

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={false} onEvent={mockOnEvent} />,
      )

      await screen.findByRole('heading', { name: /California Tax Requirements/i })

      const link = screen.getByRole('link', { name: /CA Filing Status explanation/i })
      expect(link).toHaveAttribute(
        'href',
        'https://www.ftb.ca.gov/file/personal/filing-status/index.html',
      )
    })
  })

  describe('multi-state fixture', () => {
    it('renders one heading per state in API order', async () => {
      mockGet(multiStateEmployeeStateTaxes)

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={false} onEvent={mockOnEvent} />,
      )

      const headings = await screen.findAllByRole('heading', { level: 2 })
      const headingTexts = headings.map(h => h.textContent)

      expect(headingTexts).toContain('California Tax Requirements')
      expect(headingTexts).toContain('New York Tax Requirements')
      const caIndex = headingTexts.findIndex(t => t.startsWith('California'))
      const nyIndex = headingTexts.findIndex(t => t.startsWith('New York'))
      expect(caIndex).toBeLessThan(nyIndex)
    })
  })

  describe('NY fixture (admin)', () => {
    it('renders all visible question types: select, radio, number, currency, date', async () => {
      mockGet(nyEmployeeStateTaxes)

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={true} onEvent={mockOnEvent} />,
      )

      await screen.findByRole('heading', { name: /New York Tax Requirements/i })
      expect(screen.getByLabelText(/^Filing Status$/i)).toBeInTheDocument()
      expect(
        screen.getByRole('radio', { name: /Yes, file the state new hire report for me/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Date dependent health insurance became available'),
      ).toBeInTheDocument()
    })
  })

  describe('empty fixture', () => {
    it('skips the heading for states with no questions and submits an empty payload', async () => {
      mockGet(emptyStateTaxes)

      const user = userEvent.setup()
      let capturedRequestBody: Record<string, unknown> | null = null
      server.use(
        handleUpdateEmployeeStateTaxes(async ({ request }) => {
          capturedRequestBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json(toWireStateTaxes(emptyStateTaxes))
        }),
      )

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={false} onEvent={mockOnEvent} />,
      )

      const continueButton = await screen.findByRole('button', { name: /Continue/i })
      expect(screen.queryByRole('heading', { name: /Texas Tax Requirements/i })).toBeNull()

      await user.click(continueButton)

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_STATE_TAXES_DONE)
      })
      expect(capturedRequestBody).toBeNull()
    })

    it('renders only populated states when the API mixes populated and empty groups', async () => {
      const mixed = [...caEmployeeStateTaxes, ...emptyStateTaxes]
      mockGet(mixed)

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={false} onEvent={mockOnEvent} />,
      )

      await screen.findByRole('heading', { name: /California Tax Requirements/i })
      expect(screen.queryByRole('heading', { name: /Texas Tax Requirements/i })).toBeNull()
    })
  })

  describe('server-side field errors', () => {
    it('renders inline error messages on the right field when the API returns 422 nested errors', async () => {
      mockGet(caEmployeeStateTaxes)

      const user = userEvent.setup()
      server.use(
        handleUpdateEmployeeStateTaxes(() =>
          HttpResponse.json(
            {
              errors: [
                {
                  error_key: 'states',
                  category: 'nested_errors',
                  errors: [
                    {
                      error_key: 'questions',
                      category: 'nested_errors',
                      metadata: { state: 'CA' },
                      errors: [
                        {
                          error_key: 'answers',
                          category: 'nested_errors',
                          metadata: { key: 'withholding_allowance' },
                          errors: [
                            {
                              error_key: 'value',
                              category: 'invalid_attribute_value',
                              message: 'Total Exemptions must be less than or equal to 20',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            { status: 422 },
          ),
        ),
      )

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={false} onEvent={mockOnEvent} />,
      )

      await screen.findByRole('heading', { name: /California Tax Requirements/i })
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      const allowanceField = await screen.findByLabelText(/Withholding Allowance/i)
      await waitFor(() => {
        expect(allowanceField).toHaveAttribute('aria-invalid', 'true')
      })

      const describedByIds = allowanceField.getAttribute('aria-describedby')?.split(' ') ?? []
      const errorMessageId = describedByIds.find(id => id.startsWith('error-message-'))
      expect(errorMessageId).toBeTruthy()
      const inlineError = document.getElementById(errorMessageId!)
      expect(inlineError).toHaveTextContent(/Total Exemptions must be less than or equal to 20/i)
    })
  })

  describe('unset answers fixture', () => {
    it('does not submit when required fields are empty and surfaces validation errors', async () => {
      mockGet(unsetAnswersStateTaxes)

      const user = userEvent.setup()
      let updateCalled = false
      server.use(
        handleUpdateEmployeeStateTaxes(() => {
          updateCalled = true
          return HttpResponse.json([])
        }),
      )

      renderWithProviders(
        <StateTaxes employeeId="employee-1" isAdmin={false} onEvent={mockOnEvent} />,
      )

      await screen.findByRole('heading', { name: /California Tax Requirements/i })
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(mockOnEvent).not.toHaveBeenCalledWith(componentEvents.EMPLOYEE_STATE_TAXES_DONE)
      })
      expect(updateCalled).toBe(false)
    })
  })
})
