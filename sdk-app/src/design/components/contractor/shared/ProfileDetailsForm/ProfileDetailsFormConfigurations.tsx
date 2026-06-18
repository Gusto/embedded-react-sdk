import type { Contractor } from '@gusto/embedded-api-v-2025-11-15/models/components/contractor'
import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { ProfileDetailsFormDemo } from './ProfileDetailsFormStates'
import { CONTRACTOR_TYPE } from '@/shared/constants'

function build(overrides: Partial<Contractor>): Contractor {
  return {
    uuid: 'contractor-default',
    companyUuid: 'mock-company-uuid',
    wageType: 'Hourly',
    startDate: '2024-01-01',
    isActive: true,
    version: 'version-1',
    type: 'Individual',
    firstName: 'Contractor',
    lastName: 'Name',
    middleInitial: null,
    businessName: null,
    ein: null,
    hasEin: false,
    hasSsn: true,
    email: 'contractor@example.com',
    fileNewHireReport: true,
    workState: 'CA',
    onboarded: true,
    onboardingStatus: 'onboarding_completed',
    address: null,
    hourlyRate: '50.00',
    paymentMethod: 'Direct Deposit',
    upcomingEmployment: null,
    dismissalDate: null,
    ...overrides,
  } as Contractor
}

export const profileDetailsFormManagementConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'individual',
    name: 'Individual contractor',
    description:
      'Edit basic details for an individual contractor with SSN already on file. Renders the LockedField with a Change button.',
    render: () => (
      <ProfileDetailsFormDemo
        contractor={build({
          uuid: 'contractor-profile-individual',
          type: CONTRACTOR_TYPE.INDIVIDUAL,
          firstName: 'Avery',
          middleInitial: 'J',
          lastName: 'Garcia',
          email: 'avery.garcia@example.com',
          hasSsn: true,
          startDate: '2024-03-15',
        })}
        heading="Edit basic details"
        description="Update Avery Garcia’s personal information."
        showStartDate
        showEmail
      />
    ),
  },
  {
    slug: 'business',
    name: 'Business contractor',
    description: 'Edit basic details for a Business-type contractor with EIN already on file.',
    render: () => (
      <ProfileDetailsFormDemo
        contractor={build({
          uuid: 'contractor-profile-business',
          type: CONTRACTOR_TYPE.BUSINESS,
          businessName: 'Pacific Design Co.',
          firstName: 'Mason',
          lastName: 'Park',
          email: 'mason.park@pacificdesign.com',
          hasEin: true,
          startDate: '2023-11-01',
        })}
        heading="Edit basic details"
        description="Update Pacific Design Co.’s business information."
        showStartDate
        showEmail
      />
    ),
  },
]

export const profileDetailsFormSelfOnboardingConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'individual-fresh',
    name: 'Individual, no SSN on file',
    description:
      'Fresh self-onboarding individual. SSN field is editable; Save button reads "Continue" because there is no cancel handler.',
    render: () => (
      <ProfileDetailsFormDemo
        cancelable={false}
        contractor={build({
          uuid: 'contractor-uuid',
          firstName: 'Sasha',
          lastName: 'Singh',
          email: 'sasha.singh@example.com',
          hasSsn: false,
          onboarded: false,
          onboardingStatus: 'self_onboarding_invited',
        })}
        heading="Complete your profile"
        description="Please verify your name and provide your Social Security Number."
      />
    ),
  },
  {
    slug: 'business-fresh',
    name: 'Business, no EIN on file',
    description: 'Business contractor. Shows business name field and editable EIN.',
    render: () => (
      <ProfileDetailsFormDemo
        cancelable={false}
        contractor={build({
          uuid: 'contractor-uuid',
          type: CONTRACTOR_TYPE.BUSINESS,
          businessName: 'Pacific Design Co.',
          firstName: null,
          lastName: null,
          email: 'mason.park@pacificdesign.com',
          hasEin: false,
          hasSsn: false,
          onboarded: false,
          onboardingStatus: 'self_onboarding_invited',
        })}
        heading="Complete your profile"
        description="Please verify your business name and provide your EIN."
      />
    ),
  },
  {
    slug: 'individual-returning',
    name: 'Individual, SSN already on file',
    description:
      'Returning contractor whose SSN was previously submitted. Renders the LockedField with a "Change" button.',
    render: () => (
      <ProfileDetailsFormDemo
        cancelable={false}
        contractor={build({
          uuid: 'contractor-uuid',
          firstName: 'Sasha',
          lastName: 'Singh',
          email: 'sasha.singh@example.com',
          hasSsn: true,
          onboarded: false,
          onboardingStatus: 'self_onboarding_invited',
        })}
        heading="Complete your profile"
        description="Please verify your name and provide your Social Security Number."
      />
    ),
  },
]
