import type { Contractor } from '@gusto/embedded-api-v-2026-06-15/models/components/contractor'
import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { ContractorDetailsDemo } from './ContractorDetailsStates'

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

export const contractorDetailsConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'individual',
    name: 'Individual contractor',
    description: 'Fully filled-in details for an individual contractor.',
    render: () => (
      <ContractorDetailsDemo
        editable
        contractor={build({
          uuid: 'contractor-details-individual',
          type: 'Individual',
          firstName: 'Avery',
          middleInitial: 'J',
          lastName: 'Garcia',
          email: 'avery.garcia@example.com',
          hasSsn: true,
          startDate: '2024-03-15',
        })}
      />
    ),
  },
  {
    slug: 'business',
    name: 'Business contractor',
    description: 'Business contractor — shows business name and EIN.',
    render: () => (
      <ContractorDetailsDemo
        editable
        contractor={build({
          uuid: 'contractor-details-business',
          type: 'Business',
          businessName: 'Pacific Design Co.',
          firstName: 'Mason',
          lastName: 'Park',
          email: 'mason.park@pacificdesign.com',
          hasEin: true,
          startDate: '2023-11-01',
        })}
      />
    ),
  },
  {
    slug: 'missing-data',
    name: 'Missing data',
    description: 'Individual without SSN or email — shows the dash fallback.',
    render: () => (
      <ContractorDetailsDemo
        editable
        contractor={build({
          uuid: 'contractor-details-sparse',
          type: 'Individual',
          firstName: 'Riya',
          lastName: 'Patel',
          email: '',
          hasSsn: false,
          startDate: '2024-06-22',
        })}
      />
    ),
  },
  {
    slug: 'read-only',
    name: 'Read-only',
    description: 'No `onEdit` prop, so the Edit button is hidden.',
    render: () => (
      <ContractorDetailsDemo
        contractor={build({
          uuid: 'contractor-details-readonly',
          type: 'Individual',
          firstName: 'Quinn',
          lastName: 'Chen',
          email: 'quinn.chen@example.com',
          hasSsn: true,
          startDate: '2024-01-10',
        })}
      />
    ),
  },
]
