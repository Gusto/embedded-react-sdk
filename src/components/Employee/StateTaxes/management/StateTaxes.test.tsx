import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import {
  caEmployeeStateTaxes,
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

describe('Employee.StateTaxes (management)', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    mockOnEvent.mockClear()

    server.use(
      handleGetEmployeeStateTaxes(() => HttpResponse.json(toWireStateTaxes(caEmployeeStateTaxes))),
      handleUpdateEmployeeStateTaxes(() =>
        HttpResponse.json(toWireStateTaxes(caEmployeeStateTaxes)),
      ),
    )
  })

  it('renders the state heading and form fields', async () => {
    renderWithProviders(<StateTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /California Tax Requirements/i })
    expect(screen.getByLabelText(/Filing Status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Withholding Allowance/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Additional Withholding/i)).toBeInTheDocument()
  })

  it('never shows the file_new_hire_report radio controls', async () => {
    renderWithProviders(<StateTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /California Tax Requirements/i })

    expect(
      screen.queryByRole('radio', { name: /Yes, file the state new hire report for me/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('radio', { name: /No, I have already filed/i }),
    ).not.toBeInTheDocument()
  })

  it('renders Cancel and Save buttons (no Continue)', async () => {
    renderWithProviders(<StateTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /California Tax Requirements/i })

    expect(screen.getByRole('button', { name: /^Cancel$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Save$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Continue/i })).not.toBeInTheDocument()
  })

  it('emits CANCEL when the Cancel button is clicked without submitting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /California Tax Requirements/i })

    await user.click(screen.getByRole('button', { name: /^Cancel$/i }))

    expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
    expect(mockOnEvent).not.toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_STATE_TAXES_UPDATED,
      expect.anything(),
    )
    expect(mockOnEvent).not.toHaveBeenCalledWith(componentEvents.EMPLOYEE_STATE_TAXES_DONE)
  })

  it('saves and shows a success alert without emitting DONE', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /California Tax Requirements/i })

    expect(screen.queryByText(/Successfully updated state tax settings/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Save$/i }))

    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_STATE_TAXES_UPDATED,
        expect.objectContaining({ employeeStateTaxesList: expect.any(Array) }),
      )
    })

    expect(mockOnEvent).not.toHaveBeenCalledWith(componentEvents.EMPLOYEE_STATE_TAXES_DONE)

    await waitFor(() => {
      expect(screen.getByText(/Successfully updated state tax settings/i)).toBeInTheDocument()
    })

    expect(
      screen.getByRole('heading', { name: /California Tax Requirements/i }),
    ).toBeInTheDocument()
  })

  it('dismisses the success alert when onDismiss is called', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /California Tax Requirements/i })
    await user.click(screen.getByRole('button', { name: /^Save$/i }))

    await waitFor(() => {
      expect(screen.getByText(/Successfully updated state tax settings/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    await waitFor(() => {
      expect(screen.queryByText(/Successfully updated state tax settings/i)).not.toBeInTheDocument()
    })
  })

  it('does not submit and surfaces validation errors when required fields are empty', async () => {
    server.use(
      handleGetEmployeeStateTaxes(() =>
        HttpResponse.json(toWireStateTaxes(unsetAnswersStateTaxes)),
      ),
    )

    const user = userEvent.setup()
    let updateCalled = false
    server.use(
      handleUpdateEmployeeStateTaxes(() => {
        updateCalled = true
        return HttpResponse.json([])
      }),
    )

    renderWithProviders(<StateTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /California Tax Requirements/i })
    await user.click(screen.getByRole('button', { name: /^Save$/i }))

    await waitFor(() => {
      expect(mockOnEvent).not.toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_STATE_TAXES_UPDATED,
        expect.anything(),
      )
    })
    expect(updateCalled).toBe(false)
  })

  it('renders inline API error messages on the correct field on 422', async () => {
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

    renderWithProviders(<StateTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /California Tax Requirements/i })
    await user.click(screen.getByRole('button', { name: /^Save$/i }))

    const allowanceField = await screen.findByLabelText(/Withholding Allowance/i)
    await waitFor(() => {
      expect(allowanceField).toHaveAttribute('aria-invalid', 'true')
    })

    const describedByIds = allowanceField.getAttribute('aria-describedby')?.split(' ') ?? []
    const errorMessageId = describedByIds.find(id => id.startsWith('error-message-'))
    expect(errorMessageId).toBeTruthy()
    const inlineError = document.getElementById(errorMessageId!)
    expect(inlineError).toHaveTextContent(/Total Exemptions must be less than or equal to 20/i)

    expect(screen.queryByText(/Successfully updated state tax settings/i)).not.toBeInTheDocument()
  })
})
