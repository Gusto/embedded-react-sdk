import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaySchedule } from './PaySchedule'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'
const unstableFeatures = { companySettingsDashboard: true, managePaySchedules: true }

describe('CompanyManagement.PaySchedule', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it.each([
    { name: 'companySettingsDashboard', features: { managePaySchedules: true } },
    { name: 'managePaySchedules', features: { companySettingsDashboard: true } },
  ])('renders the SDK error card without the $name flag', async ({ features }) => {
    // Both gates sit on the block so it fails loudly and immediately, rather than deep inside
    // the card or the surface, which each check only one of them.
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<PaySchedule companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures: features,
    })

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it('opens on the card and returns to it via the back header', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaySchedule companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage pay schedules' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage pay schedules' }))

    await user.click(await screen.findByRole('button', { name: 'Back to pay schedules' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage pay schedules' })).toBeInTheDocument()
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_PAY_SCHEDULE_EDIT_CANCELLED,
      undefined,
    )
  })
})
