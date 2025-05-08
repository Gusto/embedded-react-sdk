import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocationsList } from './LocationsList'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { getCompanyLocations, getEmptyCompanyLocations } from '@/test/mocks/apis/company_locations'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium'],
    useContainerBreakpoints: () => ['base', 'small', 'medium'],
  }
})

describe('LocationsList', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getCompanyLocations)
    renderWithProviders(<LocationsList companyId="company-123" onEvent={onEvent} />)
  })
  afterEach(() => {
    cleanup()
  })

  it('renders empty list of locations', async () => {
    server.use(getEmptyCompanyLocations)
    await waitFor(() => {
      expect(screen.getByTestId('emptydata')).toBeInTheDocument()
    })
  })
  it('renders a list of locations', async () => {
    await waitFor(() => {
      expect(screen.getByText('123 Main St, Apt 101')).toBeInTheDocument()
    })
  })

  it('fires continue event when "continue" is clicked', async () => {
    // Wait for skeleton loading to disappear
    await waitFor(() => {
      const skeletonElements = document.querySelectorAll(
        'section[aria-busy="true"][aria-label="Loading component..."]',
      )
      expect(skeletonElements.length).toBe(0)
    })

    const continueButton = await screen.findByRole('button', { name: 'Continue' })
    await user.click(continueButton)

    expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_LOCATION_DONE)
  })
  it('fires create new location event when "add another" is clicked', async () => {
    const addAnotherButton = await screen.findByRole('button', { name: '+ Add another address' })
    await user.click(addAnotherButton)

    expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_LOCATION_CREATE)
  })

  it('fires edit location event when "edit" is clicked', async () => {
    const hamburger = await screen.findByRole('button', { name: /Location Actions/i })
    await user.click(hamburger)
    const editButton = await screen.findByTestId('edit-location')
    await user.click(editButton)

    expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_LOCATION_EDIT, {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
    })
  })
})
