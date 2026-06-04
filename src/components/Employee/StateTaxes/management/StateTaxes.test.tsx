import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { caEmployeeStateTaxes } from '../shared/useEmployeeStateTaxesForm/__fixtures__/stateTaxesFixtures'
import { toWireStateTaxes } from '../shared/useEmployeeStateTaxesForm/__fixtures__/toWireFormat'
import { StateTaxes } from './StateTaxes'
import { server } from '@/test/mocks/server'
import {
  handleGetEmployeeStateTaxes,
  handleUpdateEmployeeStateTaxes,
} from '@/test/mocks/apis/employee_state_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('StateTaxes (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetEmployeeStateTaxes(() => HttpResponse.json(toWireStateTaxes(caEmployeeStateTaxes))),
      handleUpdateEmployeeStateTaxes(() =>
        HttpResponse.json(toWireStateTaxes(caEmployeeStateTaxes)),
      ),
    )
  })

  it('renders the card initially with the State taxes title and an Edit button', async () => {
    renderWithProviders(<StateTaxes employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /California Tax Requirements/i })).toBeNull()
  })

  it('transitions card → editStateTaxes when the Edit button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /California Tax Requirements/i }),
      ).toBeInTheDocument()
    })

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('returns to the card when Cancel is clicked from the edit screen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Cancel$/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^Cancel$/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    })

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED,
      undefined,
    )
  })

  it('returns to the card with a success alert after a successful Save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Save$/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^Save$/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_UPDATED,
        expect.objectContaining({ employeeStateTaxesList: expect.any(Array) }),
      )
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    })
    expect(await screen.findByText(/Successfully updated state tax settings/i)).toBeInTheDocument()
  })

  it('dismisses the success alert when the dismiss control is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Save$/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /^Save$/i }))

    const alertText = await screen.findByText(/Successfully updated state tax settings/i)
    expect(alertText).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    await waitFor(() => {
      expect(screen.queryByText(/Successfully updated state tax settings/i)).toBeNull()
    })
    expect(screen.getByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
  })

  it('clears the success alert when the user clicks Edit again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Save$/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /^Save$/i }))

    await screen.findByText(/Successfully updated state tax settings/i)

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Save$/i })).toBeInTheDocument()
    })
    expect(screen.queryByText(/Successfully updated state tax settings/i)).toBeNull()
  })
})
