import type { Contractor } from '@gusto/embedded-api-v-2025-11-15/models/components/contractor'
import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { ContractorListDemo } from './ContractorListStates'

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

const regularActives: Contractor[] = [
  build({
    uuid: 'contractor-active-1',
    firstName: 'Avery',
    lastName: 'Garcia',
    email: 'avery.garcia@example.com',
    hourlyRate: '65.00',
    startDate: '2024-03-15',
  }),
  build({
    uuid: 'contractor-active-2',
    type: 'Business',
    businessName: 'Pacific Design Co.',
    firstName: 'Mason',
    lastName: 'Park',
    email: 'mason.park@pacificdesign.com',
    wageType: 'Fixed',
    hourlyRate: '0.00',
    paymentMethod: 'Check',
    startDate: '2023-11-01',
  }),
  build({
    uuid: 'contractor-active-3',
    firstName: 'Riya',
    lastName: 'Patel',
    email: 'riya.patel@example.com',
    hourlyRate: '85.00',
    startDate: '2024-06-22',
  }),
]

const pendingRehires: Contractor[] = [
  build({
    uuid: 'contractor-rehire-1',
    firstName: 'Noor',
    lastName: 'Bauer',
    email: 'noor.bauer@example.com',
    hourlyRate: '90.00',
    isActive: false,
    dismissalDate: daysFromNow(-60),
    upcomingEmployment: { startDate: daysFromNow(14) },
    rehireCancellationEligible: true,
  }),
]

const activeWithUpcomingDismissal: Contractor = build({
  uuid: 'contractor-leaving',
  firstName: 'Theo',
  lastName: 'Romano',
  email: 'theo.romano@example.com',
  hourlyRate: '95.00',
  startDate: '2023-08-01',
  dismissalDate: daysFromNow(10),
  dismissalCancellationEligible: true,
})

const onboardingContractors: Contractor[] = [
  build({
    uuid: 'contractor-onboarding-admin',
    firstName: 'Quinn',
    lastName: 'Chen',
    email: 'quinn.chen@example.com',
    hourlyRate: '70.00',
    onboarded: false,
    onboardingStatus: 'admin_onboarding_incomplete',
  }),
  build({
    uuid: 'contractor-onboarding-invited',
    firstName: 'Sasha',
    lastName: 'Singh',
    email: 'sasha.singh@example.com',
    hourlyRate: '55.00',
    onboarded: false,
    onboardingStatus: 'self_onboarding_invited',
  }),
  build({
    uuid: 'contractor-onboarding-review',
    firstName: 'Diego',
    lastName: 'Lopez',
    email: 'diego.lopez@example.com',
    hourlyRate: '60.00',
    onboarded: false,
    onboardingStatus: 'self_onboarding_review',
  }),
  build({
    uuid: 'contractor-onboarding-future-1',
    firstName: 'Jordan',
    lastName: 'Walker',
    email: 'jordan.walker@example.com',
    hourlyRate: '60.00',
    onboarded: true,
    onboardingStatus: 'onboarding_completed',
    startDate: daysFromNow(21),
    upcomingEmployment: { startDate: daysFromNow(21) },
  }),
  build({
    uuid: 'contractor-onboarding-future-2',
    type: 'Business',
    businessName: 'Bright Studios',
    firstName: 'Kai',
    lastName: 'Brooks',
    email: 'kai.brooks@brightstudios.com',
    wageType: 'Fixed',
    hourlyRate: '0.00',
    paymentMethod: 'Direct Deposit',
    onboarded: true,
    onboardingStatus: 'onboarding_completed',
    startDate: daysFromNow(45),
    upcomingEmployment: { startDate: daysFromNow(45) },
  }),
]

const dismissedContractors: Contractor[] = [
  build({
    uuid: 'contractor-dismissed-1',
    firstName: 'Imani',
    lastName: 'Okonkwo',
    email: 'imani.okonkwo@example.com',
    hourlyRate: '75.00',
    isActive: false,
    dismissalDate: daysFromNow(-7),
    dismissalCancellationEligible: true,
  }),
  build({
    uuid: 'contractor-dismissed-2',
    firstName: 'Maya',
    lastName: 'Nguyen',
    email: 'maya.nguyen@example.com',
    hourlyRate: '80.00',
    isActive: false,
    dismissalDate: daysFromNow(-120),
    dismissalCancellationEligible: false,
  }),
]

const FIRST_NAMES = [
  'Avery',
  'Mason',
  'Riya',
  'Jordan',
  'Kai',
  'Sasha',
  'Quinn',
  'Noor',
  'Theo',
  'Imani',
  'Diego',
  'Maya',
]
const LAST_NAMES = [
  'Garcia',
  'Park',
  'Patel',
  'Nguyen',
  'Walker',
  'Brooks',
  'Singh',
  'Chen',
  'Romano',
  'Okonkwo',
  'Bauer',
  'Lopez',
]

const manyActives: Contractor[] = FIRST_NAMES.map((first, i) =>
  build({
    uuid: `contractor-many-${i + 1}`,
    firstName: first,
    lastName: LAST_NAMES[i] ?? 'Doe',
    email: `${first.toLowerCase()}.${(LAST_NAMES[i] ?? 'doe').toLowerCase()}@example.com`,
    hourlyRate: (40 + i * 5).toFixed(2),
    startDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-01`,
  }),
)

export const contractorListConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'empty',
    name: 'Empty',
    description: 'No contractors in any tab.',
    render: () => <ContractorListDemo byTab={{ active: [], onboarding: [], dismissed: [] }} />,
  },
  {
    slug: 'active',
    name: 'Active list',
    description: 'Three regular active contractors. No status badges.',
    render: () => (
      <ContractorListDemo byTab={{ active: regularActives, onboarding: [], dismissed: [] }} />
    ),
  },
  {
    slug: 'pending-rehires',
    name: 'Pending rehires',
    description:
      'Active tab includes a previously-dismissed contractor scheduled to be rehired — shows the "Starts {date}" info badge.',
    render: () => (
      <ContractorListDemo
        byTab={{
          active: [...regularActives, ...pendingRehires],
          onboarding: [],
          dismissed: [],
        }}
      />
    ),
  },
  {
    slug: 'upcoming-dismissal',
    name: 'Upcoming dismissal',
    description:
      'Active tab includes a contractor with a scheduled dismissal — shows the "Last day {date}" warning badge.',
    render: () => (
      <ContractorListDemo
        byTab={{
          active: [...regularActives, activeWithUpcomingDismissal],
          onboarding: [],
          dismissed: [],
        }}
      />
    ),
  },
  {
    slug: 'onboarding',
    name: 'Onboarding states',
    description:
      'Onboarding tab with several states: admin-incomplete, self-invited, self-review, and two onboarded-with-future-start.',
    render: () => (
      <ContractorListDemo
        byTab={{ active: [], onboarding: onboardingContractors, dismissed: [] }}
      />
    ),
  },
  {
    slug: 'dismissed',
    name: 'Dismissed',
    description:
      'Dismissed tab with two terminated contractors — one with a recent (cancellable) dismissal, one with an older one.',
    render: () => (
      <ContractorListDemo byTab={{ active: [], onboarding: [], dismissed: dismissedContractors }} />
    ),
  },
  {
    slug: 'mixed',
    name: 'Mixed',
    description:
      'All three tabs populated with semantically correct contractor states — the full surface in one config.',
    render: () => (
      <ContractorListDemo
        byTab={{
          active: [...regularActives, activeWithUpcomingDismissal, ...pendingRehires],
          onboarding: onboardingContractors,
          dismissed: dismissedContractors,
        }}
      />
    ),
  },
  {
    slug: 'many',
    name: 'Many contractors',
    description: 'Twelve active contractors — exercises a longer list.',
    render: () => (
      <ContractorListDemo byTab={{ active: manyActives, onboarding: [], dismissed: [] }} />
    ),
  },
]
