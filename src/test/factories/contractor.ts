import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { ContractorOnboardingStatus } from '@/shared/constants'

const DEFAULT_PROPS: Contractor = {
  uuid: 'contractor-uuid',
  isActive: true,
  onboardingStatus: ContractorOnboardingStatus.ONBOARDING_COMPLETED,
}

export function buildContractorIndividual(
  overrides: Partial<Omit<Contractor, 'type' | 'businessName'>> = {},
): Contractor {
  return {
    ...DEFAULT_PROPS,
    type: 'Individual',
    firstName: 'Contractor',
    lastName: 'Test',
    ...overrides,
  }
}

export function buildContractorBusiness(
  overrides: Partial<Omit<Contractor, 'type' | 'firstName' | 'lastName'>> = {},
): Contractor {
  return {
    ...DEFAULT_PROPS,
    type: 'Business',
    businessName: 'Contractor Business',
    ...overrides,
  }
}
