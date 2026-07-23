import { describe, expect, test } from 'vitest'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { isEligibleContractor } from './useSelectContractors'
import { ContractorOnboardingStatus } from '@/shared/constants'

function makeContractor(overrides: Partial<Contractor> = {}): Contractor {
  return {
    uuid: 'contractor-1',
    isActive: true,
    onboardingStatus: ContractorOnboardingStatus.ONBOARDING_COMPLETED,
    ...overrides,
  } as Contractor
}

describe('isEligibleContractor', () => {
  test('is eligible when active and onboarding completed', () => {
    expect(isEligibleContractor(makeContractor())).toBe(true)
  })

  test('is not eligible when inactive', () => {
    expect(isEligibleContractor(makeContractor({ isActive: false }))).toBe(false)
  })

  test('is not eligible when onboarding is incomplete', () => {
    expect(
      isEligibleContractor(
        makeContractor({
          onboardingStatus: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
        }),
      ),
    ).toBe(false)
  })

  test('is not eligible when onboarding status is missing', () => {
    expect(isEligibleContractor(makeContractor({ onboardingStatus: undefined }))).toBe(false)
  })
})
