import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FederalTaxes } from './FederalTaxes'
import { server } from '@/test/mocks/server'
import {
  getEmployeeFederalTaxes,
  updateEmployeeFederalTaxes,
} from '@/test/mocks/apis/employee_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupMswForTest } from '@/test/mocks/setupMswForTest'

// Setup MSW server for this test file since it uses API mocking
setupMswForTest()

describe('Employee FederalTaxes', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getEmployeeFederalTaxes, updateEmployeeFederalTaxes)
  })

  it('should render federal tax form', async () => {
    renderWithProviders(<FederalTaxes employeeId="employee_id" onEvent={() => {}} />)

    await screen.findByText('Federal tax withholdings (Form W-4)')

    expect(screen.getByText('Federal tax withholdings (Form W-4)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('should have continue button that can be clicked', async () => {
    const user = userEvent.setup()
    const mockOnEvent = vi.fn()

    renderWithProviders(<FederalTaxes employeeId="employee_id" onEvent={mockOnEvent} />)

    await screen.findByText('Federal tax withholdings (Form W-4)')

    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toBeEnabled()

    // Just verify we can click it (form validation will prevent actual submission)
    await user.click(continueButton)
    expect(continueButton).toBeInTheDocument()
  })
})
