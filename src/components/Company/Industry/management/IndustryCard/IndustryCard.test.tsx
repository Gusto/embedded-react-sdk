import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { IndustryCard } from './IndustryCard'
import { server } from '@/test/mocks/server'
import { handleGetIndustrySelection } from '@/test/mocks/apis/company'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// The industry endpoint returns the industry object as the response body itself;
// the SDK nests it under `industry` when parsing.
const fixtureIndustry = {
  company_uuid: 'company-123',
  naics_code: '541511',
  title: 'Custom Computer Programming Services',
  sic_codes: ['7371'],
}

describe('IndustryCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(handleGetIndustrySelection(() => HttpResponse.json(fixtureIndustry)))
  })

  it('renders the card title, the industry classification, and an enabled Edit button once loaded', async () => {
    renderWithProviders(<IndustryCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit industry' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'Industry' })).toBeInTheDocument()
    expect(screen.getByText('Custom Computer Programming Services')).toBeInTheDocument()
    expect(screen.getByText('541511')).toBeInTheDocument()
  })

  it('emits the edit-requested event with the company id when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<IndustryCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit industry' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit industry' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_REQUESTED,
      { companyId: 'company-123' },
    )
  })

  it('renders the empty state when no industry has been selected', async () => {
    server.use(
      handleGetIndustrySelection(() =>
        HttpResponse.json({ ...fixtureIndustry, naics_code: null, title: null }),
      ),
    )

    renderWithProviders(<IndustryCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('No industry selected')).toBeInTheDocument()
    })
  })
})
