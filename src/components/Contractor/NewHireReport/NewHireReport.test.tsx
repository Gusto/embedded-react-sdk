import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewHireReport } from './NewHireReport'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('Contractor NewHireReport', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    renderWithProviders(<NewHireReport contractorId="contractor-123" onEvent={onEvent} />)
  })

  it('renders with mock new hire report information', async () => {
    await waitFor(() => {
      expect(screen.getByText('File new hire report?')).toBeInTheDocument()
    })
  })

  it('submits no option correctly', async () => {
    const noOption = await screen.findByLabelText(
      'No, I have already filed or will file the report myself',
    )
    await user.click(noOption)
    const submitButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(submitButton)
    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.CONTRACTOR_NEW_HIRE_REPORT_UPDATED,
        expect.any(Object),
      )
      expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE)
    })
  })
  it('submits yes option with state correctly', async () => {
    const yesOption = await screen.findByLabelText('Yes, file the report for me')
    await user.click(yesOption)

    const submitButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.CONTRACTOR_NEW_HIRE_REPORT_UPDATED,
        expect.any(Object),
      )
      expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE)
    })
  })
})
