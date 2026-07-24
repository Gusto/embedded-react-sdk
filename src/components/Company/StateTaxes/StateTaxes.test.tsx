import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StateTaxes } from './StateTaxes'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'

describe('StateTaxes', () => {
  it('remains editable after the "done" event instead of getting stuck on the list view', async () => {
    setupApiTestMocks()
    const onEvent = vi.fn()
    const user = userEvent.setup()

    render(
      <GustoTestProvider>
        <StateTaxes companyId="company-123" onEvent={onEvent} />
      </GustoTestProvider>,
    )

    const continueButton = await screen.findByRole('button', { name: 'Continue' })
    await user.click(continueButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_DONE, undefined)

    const hamburger = await screen.findByRole('button', { name: /Actions for California/i })
    await user.click(hamburger)
    const editButton = await screen.findByTestId('edit-state-tax')
    await user.click(editButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_EDIT, {
      state: 'CA',
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
    })
  })
})
