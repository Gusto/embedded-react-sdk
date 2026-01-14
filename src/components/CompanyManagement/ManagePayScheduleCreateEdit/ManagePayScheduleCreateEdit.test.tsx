import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManagePayScheduleCreateEdit } from './ManagePayScheduleCreateEdit'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('ManagePayScheduleCreateEdit', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  describe('create mode', () => {
    it('renders create form when no payScheduleUuid is provided', async () => {
      renderWithProviders(<ManagePayScheduleCreateEdit companyId="company-123" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Add pay schedule' })).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Frequency/)).toBeInTheDocument()
    })

    it('shows preview alert when dates are not set', async () => {
      renderWithProviders(<ManagePayScheduleCreateEdit companyId="company-123" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getByText('Pay Schedule Preview')).toBeInTheDocument()
      })
    })

    it('fires cancel event when Cancel is clicked', async () => {
      renderWithProviders(<ManagePayScheduleCreateEdit companyId="company-123" onEvent={onEvent} />)

      const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(onEvent).toHaveBeenCalledWith(componentEvents.MANAGE_PAY_SCHEDULE_CANCEL)
    })
  })

  describe('edit mode', () => {
    it('renders edit form when payScheduleUuid is provided', async () => {
      renderWithProviders(
        <ManagePayScheduleCreateEdit
          companyId="company-123"
          payScheduleUuid="schedule-1"
          onEvent={onEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Edit pay schedule' })).toBeInTheDocument()
      })
    })
  })

  describe('frequency options', () => {
    it('shows twice per month options when frequency is selected', async () => {
      renderWithProviders(<ManagePayScheduleCreateEdit companyId="company-123" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/Frequency/)).toBeInTheDocument()
      })

      const frequencySelect = screen.getByRole('button', { name: /Frequency/ })
      await user.click(frequencySelect)

      const twicePerMonth = await screen.findByRole('option', { name: 'Twice per month' })
      await user.click(twicePerMonth)

      await waitFor(() => {
        expect(screen.getByText('Frequency options')).toBeInTheDocument()
      })
    })
  })
})
