import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { caEmployeeStateTaxes } from '../../shared/useEmployeeStateTaxesForm/__fixtures__/stateTaxesFixtures'
import { toWireStateTaxes } from '../../shared/useEmployeeStateTaxesForm/__fixtures__/toWireFormat'
import { StateTaxesCard } from './StateTaxesCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeStateTaxes } from '@/test/mocks/apis/employee_state_taxes'
import { componentEvents } from '@/shared/constants'

describe('StateTaxesCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the card title and the active state tax data once loaded', async () => {
    server.use(
      handleGetEmployeeStateTaxes(() => HttpResponse.json(toWireStateTaxes(caEmployeeStateTaxes))),
    )

    renderWithProviders(<StateTaxesCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'California' })).toBeInTheDocument()
    expect(screen.getByText('Filing Status')).toBeInTheDocument()
    expect(screen.getByText('Single')).toBeInTheDocument()
    expect(screen.getByText('Withholding Allowance')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders the no-state-taxes message when the API returns an empty list', async () => {
    server.use(handleGetEmployeeStateTaxes(() => HttpResponse.json([])))

    renderWithProviders(<StateTaxesCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('No state taxes on file')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('hides the Edit button and shows the no-withholding copy when every state has no questions', async () => {
    server.use(
      handleGetEmployeeStateTaxes(() =>
        HttpResponse.json([
          {
            employee_uuid: 'employee-123',
            state: 'WA',
            file_new_hire_report: false,
            is_work_state: true,
            questions: [],
          },
        ]),
      ),
    )

    renderWithProviders(<StateTaxesCard employeeId="employee-123" onEvent={onEvent} />)

    expect(await screen.findByRole('heading', { name: 'Washington' })).toBeInTheDocument()
    expect(screen.getByText('No state income tax withholding required.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('fires EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED with { employeeId } when Edit is clicked', async () => {
    server.use(
      handleGetEmployeeStateTaxes(() => HttpResponse.json(toWireStateTaxes(caEmployeeStateTaxes))),
    )

    const user = userEvent.setup()
    renderWithProviders(<StateTaxesCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('renders Edit while loading so the card chrome stays interactive once data arrives', async () => {
    server.use(
      handleGetEmployeeStateTaxes(() => HttpResponse.json(toWireStateTaxes(caEmployeeStateTaxes))),
    )

    renderWithProviders(<StateTaxesCard employeeId="employee-123" onEvent={onEvent} />)

    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
  })

  it('groups multiple states into separate sections, each with its own heading', async () => {
    server.use(
      handleGetEmployeeStateTaxes(() =>
        HttpResponse.json(
          toWireStateTaxes([
            ...caEmployeeStateTaxes,
            {
              employeeUuid: 'employee-123',
              state: 'NY',
              fileNewHireReport: null,
              isWorkState: false,
              questions: [
                {
                  isQuestionForAdminOnly: false,
                  label: 'Filing Status',
                  description: null,
                  key: 'filing_status',
                  inputQuestionFormat: {
                    type: 'Select',
                    options: [
                      { value: 'S', label: 'Single' },
                      { value: 'M', label: 'Married' },
                    ],
                  },
                  answers: [{ value: 'M', validFrom: '2010-01-01', validUpTo: null }],
                },
              ],
            },
          ]),
        ),
      ),
    )

    renderWithProviders(<StateTaxesCard employeeId="employee-123" onEvent={onEvent} />)

    expect(await screen.findByRole('heading', { name: 'California' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'New York' })).toBeInTheDocument()
    const nyHeading = screen.getByRole('heading', { name: 'New York' })
    // The NY section is the parent of its question terms; assert "Married" lives near it.
    const nySection = nyHeading.parentElement as HTMLElement
    expect(within(nySection).getByText('Married')).toBeInTheDocument()
  })
})
