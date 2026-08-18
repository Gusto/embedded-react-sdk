import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { CompensationCard } from './CompensationCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetContractor } from '@/test/mocks/apis/contractors'
import { componentEvents } from '@/shared/constants'

function mockContractor(overrides: Record<string, unknown> = {}) {
  server.use(
    handleGetContractor(() =>
      HttpResponse.json({
        uuid: 'contractor-123',
        type: 'Individual',
        is_active: true,
        version: 'v1',
        wage_type: 'Hourly',
        hourly_rate: '45.00',
        file_new_hire_report: false,
        ...overrides,
      }),
    ),
  )
}

describe('CompensationCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    mockContractor()
  })

  it('renders the compensation type and wage rows for an Hourly contractor', async () => {
    renderWithProviders(<CompensationCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('Compensation')).toBeInTheDocument()
    expect(screen.getByText('Hourly')).toBeInTheDocument()
    expect(screen.getByText('$45.00/hr')).toBeInTheDocument()
  })

  it('omits the wage row for a Fixed contractor', async () => {
    mockContractor({ wage_type: 'Fixed' })

    renderWithProviders(<CompensationCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Fixed')).toBeInTheDocument()
    })
    expect(screen.queryByText('Wage')).toBeNull()
  })

  it('fires CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_REQUESTED with { contractorId } when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompensationCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_REQUESTED,
      { contractorId: 'contractor-123' },
    )
  })
})
