import { describe, expect, test } from 'vitest'
import { isEligibleContractor } from './useSelectContractors'
import { ContractorOnboardingStatus } from '@/shared/constants'
import { buildContractorIndividual } from '@/test/factories/contractor'

describe('isEligibleContractor', () => {
  test('is eligible when active and onboarding completed', () => {
    expect(isEligibleContractor(buildContractorIndividual())).toBe(true)
  })

  test('is not eligible when inactive', () => {
    expect(isEligibleContractor(buildContractorIndividual({ isActive: false }))).toBe(false)
  })

  test('is not eligible when onboarding is incomplete', () => {
    expect(
      isEligibleContractor(
        buildContractorIndividual({
          onboardingStatus: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
        }),
      ),
    ).toBe(false)
  })

  test('is not eligible when onboarding status is missing', () => {
    expect(isEligibleContractor(buildContractorIndividual({ onboardingStatus: undefined }))).toBe(
      false,
    )
  })
})
