import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { I9SignatureForm } from './I9SignatureForm'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import { handleSignEmployeeForm, i9Form } from '@/test/mocks/apis/employee_forms'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('I9SignatureForm', () => {
  const mockOnEvent = vi.fn()
  const defaultProps = {
    employeeId: 'employee-123',
    formId: 'i9-form-123',
    onEvent: mockOnEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    mockOnEvent.mockClear()
  })

  it('renders the form title, signature field, and preparer question', async () => {
    renderWithProviders(<I9SignatureForm {...defaultProps} />)

    await screen.findByRole('heading', { name: 'Sign I-9 document' })
    expect(screen.getByLabelText('Signature')).toBeInTheDocument()
    expect(screen.getByText('Did you use a preparer/translator?')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'No, I completed this myself' })).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: 'Yes, I used a preparer/translator' }),
    ).toBeInTheDocument()
  })

  it('shows preparer fields when "yes" is selected and hides them when switching back to "no"', async () => {
    const user = userEvent.setup()
    renderWithProviders(<I9SignatureForm {...defaultProps} />)

    await screen.findByRole('heading', { name: 'Sign I-9 document' })
    await user.click(screen.getByRole('radio', { name: 'Yes, I used a preparer/translator' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Preparer and/or translator certification',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'No, I completed this myself' }))

    expect(
      screen.queryByRole('heading', {
        name: 'Preparer and/or translator certification',
      }),
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()
  })

  it('validates preparer fields when a preparer is added but incomplete', async () => {
    const user = userEvent.setup()
    renderWithProviders(<I9SignatureForm {...defaultProps} />)

    await screen.findByRole('heading', { name: 'Sign I-9 document' })
    await user.type(screen.getByLabelText('Signature'), 'Test User')
    await user.click(screen.getByRole('checkbox', { name: /I agree to electronically sign/i }))
    await user.click(screen.getByRole('radio', { name: 'Yes, I used a preparer/translator' }))
    await screen.findByRole('heading', {
      name: 'Preparer and/or translator certification',
    })

    await user.click(screen.getByRole('button', { name: 'Sign' }))

    expect(await screen.findByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Last name is required')).toBeInTheDocument()
  })

  it('fires the sign event on successful submission without preparer', async () => {
    const user = userEvent.setup()
    const signedForm = { ...i9Form, requires_signing: false }
    server.use(handleSignEmployeeForm(() => HttpResponse.json(signedForm)))

    renderWithProviders(<I9SignatureForm {...defaultProps} />)

    await screen.findByRole('heading', { name: 'Sign I-9 document' })
    await user.type(screen.getByLabelText('Signature'), 'Test User')
    await user.click(screen.getByRole('checkbox', { name: /I agree to electronically sign/i }))
    await user.click(screen.getByRole('button', { name: 'Sign' }))

    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_SIGN_FORM,
        expect.objectContaining({ uuid: i9Form.uuid }),
      )
    })
  })

  it('supports adding and removing preparers with correct button visibility', async () => {
    const user = userEvent.setup()
    renderWithProviders(<I9SignatureForm {...defaultProps} />)

    await screen.findByRole('heading', { name: 'Sign I-9 document' })
    await user.click(screen.getByRole('radio', { name: 'Yes, I used a preparer/translator' }))

    const preparerHeadings = () =>
      screen.getAllByRole('heading', { name: 'Preparer and/or translator certification' })

    expect(preparerHeadings()).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Add preparer' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove preparer' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add preparer' }))

    expect(preparerHeadings()).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Add preparer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove preparer' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove preparer' }))

    expect(preparerHeadings()).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Add preparer' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove preparer' })).not.toBeInTheDocument()
  })

  it('fires the cancel event when cancel button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<I9SignatureForm {...defaultProps} />)

    await screen.findByRole('heading', { name: 'Sign I-9 document' })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
  })
})
