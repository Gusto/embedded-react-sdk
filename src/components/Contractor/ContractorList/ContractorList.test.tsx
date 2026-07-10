import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { ContractorList } from './index'
import { server } from '@/test/mocks/server'
import { handleGetContractorsList } from '@/test/mocks/apis/contractors'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const baseContractor = {
  uuid: 'contractor-123',
  company_uuid: 'company-123',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  wage_type: 'Hourly',
  hourly_rate: '50.00',
  start_date: '2024-01-01',
  is_active: true,
  version: 'version-123',
  onboarded: false,
}

function mockContractorWithStatus(onboardingStatus: string, onboarded = false) {
  server.use(
    handleGetContractorsList(() =>
      HttpResponse.json([{ ...baseContractor, onboarding_status: onboardingStatus, onboarded }], {
        headers: { 'x-total-pages': '1', 'x-total-count': '1' },
      }),
    ),
  )
}

describe('ContractorList hamburger menu edit/review CTA', () => {
  beforeEach(() => {
    mockContractorWithStatus('admin_onboarding_incomplete')
  })

  it('labels the menu action "Edit" while onboarding is still incomplete', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeTruthy()
  })

  it('labels the menu action "Review" when the contractor is awaiting self-onboarding review', async () => {
    mockContractorWithStatus('self_onboarding_review')

    const user = userEvent.setup()
    renderWithProviders(<ContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Review' }))

    expect(await screen.findByRole('menuitem', { name: 'Review' })).toBeTruthy()
  })

  it('labels the menu action "Edit" for admin-facilitated onboarding review (admin entered the data)', async () => {
    mockContractorWithStatus('admin_onboarding_review')

    const user = userEvent.setup()
    renderWithProviders(<ContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeTruthy()
  })

  it('labels the menu action "Edit" once onboarding is complete', async () => {
    mockContractorWithStatus('onboarding_completed', true)

    const user = userEvent.setup()
    renderWithProviders(<ContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeTruthy()
  })
})
