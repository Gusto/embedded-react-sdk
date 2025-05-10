import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StateTaxesList } from './StateTaxesList'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import { getEmptyAllStateTaxRequirements } from '@/test/mocks/apis/company_state_taxes'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium'],
    useContainerBreakpoints: () => ['base', 'small', 'medium'],
  }
})
describe('StateTaxesList', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  beforeEach(() => {
    setupApiTestMocks()
    render(
      <GustoTestProvider>
        <StateTaxesList companyId="company-123" onEvent={onEvent} />
      </GustoTestProvider>,
    )
  })

  it('renders empty list of state taxes', async () => {
    server.use(getEmptyAllStateTaxRequirements)
    await waitFor(() => {
      expect(screen.getByTestId('emptydata')).toBeInTheDocument()
    })
  })

  it('renders list of state taxes', async () => {
    await waitFor(() => {
      expect(screen.getByText('California')).toBeInTheDocument()
      expect(screen.getByText('Washington')).toBeInTheDocument()
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

    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_DONE)
  })

  it('fires edit state tax event when "edit" is clicked for Georgia', async () => {
    const editButton = await screen.findByText('Edit')
    await user.click(editButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_EDIT, {
      state: 'CA',
    })
  })
})
