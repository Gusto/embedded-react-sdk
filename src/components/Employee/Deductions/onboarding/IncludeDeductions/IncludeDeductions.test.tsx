import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IncludeDeductions } from './IncludeDeductions'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('IncludeDeductions', () => {
  const user = userEvent.setup()

  it('invokes onAdd when the "Add deduction" button is clicked', async () => {
    const onAdd = vi.fn()
    const onContinue = vi.fn()
    renderWithProviders(<IncludeDeductions onAdd={onAdd} onContinue={onContinue} />)

    await waitFor(() => {
      expect(screen.getByText('Deductions')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add deduction'))

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onContinue).not.toHaveBeenCalled()
  })

  it('invokes onContinue when the Continue button is clicked', async () => {
    const onAdd = vi.fn()
    const onContinue = vi.fn()
    renderWithProviders(<IncludeDeductions onAdd={onAdd} onContinue={onContinue} />)

    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    expect(onContinue).toHaveBeenCalledTimes(1)
    expect(onAdd).not.toHaveBeenCalled()
  })
})
