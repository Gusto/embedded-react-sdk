import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, delay } from 'msw'
import { DocumentsCard } from './DocumentsCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeForms, i9Form } from '@/test/mocks/apis/employee_forms'
import { componentEvents } from '@/shared/constants'

describe('DocumentsCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the card chrome with an inline loading state while data is loading', async () => {
    server.use(
      handleGetEmployeeForms(async () => {
        await delay('infinite')
        return HttpResponse.json([i9Form])
      }),
    )

    renderWithProviders(<DocumentsCard employeeId="employee-123" onEvent={onEvent} />)

    expect(await screen.findByRole('heading', { name: 'Forms' })).toBeInTheDocument()
    expect(screen.getByLabelText('Loading component...')).toBeInTheDocument()
  })

  it('renders the card title and the employee forms once loaded', async () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))

    renderWithProviders(<DocumentsCard employeeId="employee-123" onEvent={onEvent} />)

    expect(await screen.findByText('Form I-9')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Forms' })).toBeInTheDocument()
    expect(screen.getByText('Not signed')).toBeInTheDocument()
  })

  it('renders the empty state when the employee has no forms', async () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([])))

    renderWithProviders(<DocumentsCard employeeId="employee-123" onEvent={onEvent} />)

    expect(await screen.findByText('No forms')).toBeInTheDocument()
  })

  it('fires EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED with { employeeId, formId } when View is clicked', async () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))

    const user = userEvent.setup()
    renderWithProviders(<DocumentsCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Form I-9')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'View' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED,
      { employeeId: 'employee-123', formId: 'i9-form-123' },
    )
  })
})
