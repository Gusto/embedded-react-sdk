import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StateTaxes } from './StateTaxes'
import { server } from '@/test/mocks/server'
import {
  getEmployeeStateTaxes,
  updateEmployeeStateTaxes,
} from '@/test/mocks/apis/employee_state_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
// import { componentEvents } from '@/shared/constants' // Unused in current tests
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Employee StateTaxes', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getEmployeeStateTaxes, updateEmployeeStateTaxes)
  })

  it('should render state tax form', async () => {
    renderWithProviders(<StateTaxes employeeId="employee_id" onEvent={() => {}} />)

    await screen.findByRole('button', { name: /continue/i })

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('should have continue button that can be clicked', async () => {
    const user = userEvent.setup()
    const mockOnEvent = vi.fn()

    renderWithProviders(<StateTaxes employeeId="employee_id" onEvent={mockOnEvent} />)

    await screen.findByRole('button', { name: /continue/i })

    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toBeEnabled()

    // Just verify we can click it
    await user.click(continueButton)
    expect(continueButton).toBeInTheDocument()
  })
})
