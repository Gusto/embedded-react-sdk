import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { Documents } from './Documents'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeForms, i9Form } from '@/test/mocks/apis/employee_forms'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Employee.Documents (management)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))
  })

  it('renders the card with the employee forms', async () => {
    renderWithProviders(<Documents employeeId="employee-123" onEvent={onEvent} />)

    expect(await screen.findByText('Form I-9')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Forms' })).toBeInTheDocument()
  })

  it('transitions from the card to the document viewer on View and emits the scoped event', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Documents employeeId="employee-123" onEvent={onEvent} />)

    await screen.findByText('Form I-9')
    await user.click(screen.getByRole('button', { name: 'View' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED,
      { employeeId: 'employee-123', formId: 'i9-form-123' },
    )

    expect(
      await screen.findByRole('heading', { name: /Signature required for Form I-9/i }),
    ).toBeInTheDocument()
  })

  it('returns to the card without an alert when Back is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Documents employeeId="employee-123" onEvent={onEvent} />)

    await screen.findByText('Form I-9')
    await user.click(screen.getByRole('button', { name: 'View' }))

    await screen.findByRole('heading', { name: /Signature required for Form I-9/i })
    await user.click(screen.getByRole('button', { name: 'Back' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Forms' })).toBeInTheDocument()
    })
    expect(screen.queryByText('Document successfully signed.')).toBeNull()
  })

  it('returns to the card with a success alert after the form is signed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Documents employeeId="employee-123" onEvent={onEvent} />)

    await screen.findByText('Form I-9')
    await user.click(screen.getByRole('button', { name: 'View' }))

    await screen.findByRole('heading', { name: /Signature required for Form I-9/i })

    await user.type(screen.getByLabelText('Signature'), 'Jane Employee')
    await user.click(
      screen.getByRole('checkbox', {
        name: /I am the employee and I agree to sign electronically/i,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Sign form' }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_SIGN_FORM, expect.anything())
    })

    expect(await screen.findByText('Document successfully signed.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Forms' })).toBeInTheDocument()
  })
})
