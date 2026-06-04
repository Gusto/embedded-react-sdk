import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeductionsForm } from './DeductionsForm'
import type { DeductionsFormDictionary } from './types'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

describe('DeductionsForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('updates the Amount helper text when toggling between Percentage and Fixed dollar amount', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <DeductionsForm employeeId="employee-123" onSaved={vi.fn()} onCancel={vi.fn()} />,
    )

    await user.click(await screen.findByRole('radio', { name: /Custom deduction/i }))

    // Default selection: Percentage of pay → percentage copy
    await waitFor(() => {
      expect(
        screen.getByText('Enter the percentage of your employee’s wages to withhold.'),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /Fixed dollar amount/i }))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Enter the amount of money to withhold each pay period from your employee’s wages.',
        ),
      ).toBeInTheDocument()
    })

    // And flipping back restores the percentage copy.
    await user.click(screen.getByRole('radio', { name: /Percentage of pay/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Enter the percentage of your employee’s wages to withhold.'),
      ).toBeInTheDocument()
    })
  })

  it('renders strings from the formDictionary prop in place of the defaults', async () => {
    const formDictionary: DeductionsFormDictionary = {
      en: {
        addTitle: 'Add a payroll deduction',
        variantLabel: 'Choose deduction type',
        customOption: 'Voluntary deduction',
      },
    }

    renderWithProviders(
      <DeductionsForm
        employeeId="employee-123"
        formDictionary={formDictionary}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(
      await screen.findByRole('heading', { name: 'Add a payroll deduction' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Choose deduction type')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Voluntary deduction' })).toBeInTheDocument()
  })
})
