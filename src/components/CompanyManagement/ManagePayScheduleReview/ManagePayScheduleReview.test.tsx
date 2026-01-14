import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import { ManagePayScheduleReview } from './ManagePayScheduleReview'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('ManagePayScheduleReview', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  const mockAssignmentData = {
    type: PayScheduleAssignmentBodyType.Single,
    defaultPayScheduleUuid: 'schedule-1',
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders and loads preview data', async () => {
    renderWithProviders(
      <ManagePayScheduleReview
        companyId="company-123"
        assignmentData={mockAssignmentData}
        onEvent={onEvent}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })
  })

  it('displays employee assignment preview after loading', async () => {
    renderWithProviders(
      <ManagePayScheduleReview
        companyId="company-123"
        assignmentData={mockAssignmentData}
        onEvent={onEvent}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('fires back event when Back is clicked', async () => {
    renderWithProviders(
      <ManagePayScheduleReview
        companyId="company-123"
        assignmentData={mockAssignmentData}
        onEvent={onEvent}
      />,
    )

    const backButton = await screen.findByRole('button', { name: 'Back' })
    await user.click(backButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.MANAGE_PAY_SCHEDULE_BACK)
  })

  it('fires confirmed event when Confirm is clicked', async () => {
    renderWithProviders(
      <ManagePayScheduleReview
        companyId="company-123"
        assignmentData={mockAssignmentData}
        onEvent={onEvent}
      />,
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const confirmButton = await screen.findByRole('button', { name: 'Confirm' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.MANAGE_PAY_SCHEDULE_CONFIRMED,
        mockAssignmentData,
      )
    })
  })
})
