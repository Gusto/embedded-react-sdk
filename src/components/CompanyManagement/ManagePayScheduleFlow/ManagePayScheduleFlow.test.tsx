import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManagePayScheduleFlow } from './ManagePayScheduleFlow'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('ManagePayScheduleFlow', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the landing component initially', async () => {
    renderWithProviders(<ManagePayScheduleFlow companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Pay schedule')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
  })

  it('transitions to type selection when Manage is clicked', async () => {
    renderWithProviders(<ManagePayScheduleFlow companyId="company-123" onEvent={onEvent} />)

    const manageButton = await screen.findByRole('button', { name: 'Manage' })
    await user.click(manageButton)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Choose schedule type' })).toBeInTheDocument()
    })
  })

  it('emits events through the flow', async () => {
    renderWithProviders(<ManagePayScheduleFlow companyId="company-123" onEvent={onEvent} />)

    const manageButton = await screen.findByRole('button', { name: 'Manage' })
    await user.click(manageButton)

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.MANAGE_PAY_SCHEDULE_MANAGE,
      expect.any(Object),
    )
  })
})
