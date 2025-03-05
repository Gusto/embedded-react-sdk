import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InviteSignatory } from './InviteSignatory'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'

describe('InviteSignatory', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    mockOnEvent.mockClear()
  })

  it('shows error when emails do not match', async () => {
    const user = userEvent.setup()

    render(
      <GustoTestApiProvider>
        <InviteSignatory companyId="company-123" onEvent={mockOnEvent} />
      </GustoTestApiProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Invite a signatory')).toBeInTheDocument()
    })

    const emailInput = screen.getByLabelText('Signatory email')
    await user.type(emailInput, 'test@example.com')

    const confirmEmailInput = screen.getByLabelText('Confirm signatory email')
    await user.type(confirmEmailInput, 'different@example.com')

    const firstNameInput = screen.getByLabelText('First name')
    await user.type(firstNameInput, 'John')

    const lastNameInput = screen.getByLabelText('Last name')
    await user.type(lastNameInput, 'Doe')

    const titleControl = screen.getByRole('button', {
      name: /Select an item/i,
      expanded: false,
    })

    await user.click(titleControl)

    const ownerOption = screen.getByRole('option', { name: 'Owner' })
    await user.click(ownerOption)

    const submitButton = screen.getByRole('button', { name: 'Invite signatory' })
    await user.click(submitButton)

    expect(screen.getByText('Email addresses must match')).toBeInTheDocument()
    expect(mockOnEvent).not.toHaveBeenCalled()

    await user.clear(confirmEmailInput)
    await user.type(confirmEmailInput, 'test@example.com')

    await user.click(submitButton)

    expect(screen.queryByText('Email addresses must match')).not.toBeInTheDocument()
    expect(mockOnEvent).toHaveBeenCalledWith(
      companyEvents.COMPANY_SIGNATORY_INVITED,
      expect.any(Object),
    )
  })

  it('successfully submits form when all fields are valid', async () => {
    const user = userEvent.setup()

    render(
      <GustoTestApiProvider>
        <InviteSignatory companyId="company-123" onEvent={mockOnEvent} />
      </GustoTestApiProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Invite a signatory')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('First name'), 'John')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Signatory email'), 'john.doe@example.com')
    await user.type(screen.getByLabelText('Confirm signatory email'), 'john.doe@example.com')

    const titleControl = screen.getByRole('button', {
      name: /Select an item/i,
      expanded: false,
    })

    await user.click(titleControl)

    const ownerOption = screen.getByRole('option', { name: 'Owner' })
    await user.click(ownerOption)

    const submitButton = screen.getByRole('button', { name: 'Invite signatory' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(
        companyEvents.COMPANY_SIGNATORY_INVITED,
        expect.any(Object),
      )
      expect(mockOnEvent).toHaveBeenCalledWith(companyEvents.COMPANY_INVITE_SIGNATORY_DONE)
    })
  })
})
