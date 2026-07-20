import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { ContractorDismissalFormDemo } from './ContractorDismissalFormStates'

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

const daysFromNow = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

export const contractorDismissalFormConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'default',
    name: 'Individual contractor',
    description: 'Standard dismissal form for an hourly individual contractor.',
    render: () => (
      <ContractorDismissalFormDemo
        contractor={build({
          uuid: 'contractor-dismiss-1',
          firstName: 'Avery',
          lastName: 'Garcia',
          email: 'avery.garcia@example.com',
          hourlyRate: '65.00',
          startDate: '2024-03-15',
        })}
      />
    ),
  },
  {
    slug: 'business',
    name: 'Business contractor',
    description: 'Dismissal form for a Business-type contractor — heading uses the business name.',
    render: () => (
      <ContractorDismissalFormDemo
        contractor={build({
          uuid: 'contractor-dismiss-business',
          type: 'Business',
          businessName: 'Pacific Design Co.',
          firstName: 'Mason',
          lastName: 'Park',
          email: 'mason.park@pacificdesign.com',
          wageType: 'Fixed',
          hourlyRate: '0.00',
          paymentMethod: 'Check',
          startDate: '2023-11-01',
        })}
      />
    ),
  },
  {
    slug: 'recent-start',
    name: 'Recent start date',
    description:
      'Contractor started a few days ago — the date picker enforces a minDate of (start + 1 day) so earlier dates are disabled.',
    render: () => (
      <ContractorDismissalFormDemo
        contractor={build({
          uuid: 'contractor-dismiss-new',
          firstName: 'Riya',
          lastName: 'Patel',
          email: 'riya.patel@example.com',
          hourlyRate: '85.00',
          startDate: daysFromNow(-3),
        })}
      />
    ),
  },
  {
    slug: 'pending',
    name: 'Submitting',
    description: 'The submit button shows its loading state while the dismissal is in flight.',
    render: () => (
      <ContractorDismissalFormDemo
        isPending
        contractor={build({
          uuid: 'contractor-dismiss-pending',
          firstName: 'Imani',
          lastName: 'Okonkwo',
          email: 'imani.okonkwo@example.com',
          hourlyRate: '75.00',
          startDate: '2024-01-10',
        })}
      />
    ),
  },
]
