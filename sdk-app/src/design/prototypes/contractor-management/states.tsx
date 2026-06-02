import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { PrototypeComponent } from '../prototypeTypes'
import { ContractorDetailsDemo } from '../../components/contractor/management/ContractorDetails/ContractorDetailsStates'
import { ContractorDismissalFormDemo } from '../../components/contractor/management/ContractorDismissalForm/ContractorDismissalFormStates'
import {
  ContractorListDemo,
  type ContractorTabFixtures,
} from '../../components/contractor/management/ContractorList/ContractorListStates'

/**
 * Mock contractor builder.
 *
 * Defaults are tuned for a "happy active contractor": fully onboarded,
 * currently active, no dismissal, no upcoming employment, hourly,
 * started a while ago. Override per-fixture to express the variants the
 * View cares about — see the per-tab fixture groups below for what
 * shape each tab expects.
 */
function build(overrides: Partial<Contractor>): Contractor {
  return {
    uuid: `contractor-${Math.random().toString(36).slice(2, 8)}`,
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

// -- Active tab fixtures ------------------------------------------------
// Regular active contractors: onboarded, currently active, started in
// the past, no upcomingEmployment, no dismissalDate. The View shows no
// status badge for these.
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

// Pending rehire: previously dismissed, scheduled to come back. The
// container merges these into the active list from the dismissed query.
// They show with the blue "Starts {date}" info badge and a "Cancel
// rehire" menu item.
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

// Active contractor with a scheduled dismissal — shows the yellow
// "Last day {date}" warning badge and a "Cancel dismissal" menu item.
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

// -- Onboarding tab fixtures --------------------------------------------
// Each entry exercises a different onboarding state. The fully-onboarded
// ones with `upcomingEmployment` set ALSO show the "Starts {date}" info
// badge next to their Onboarded status.
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

// -- Dismissed tab fixtures ---------------------------------------------
// Truly dismissed contractors: past dismissalDate, NO upcomingEmployment
// (the View filters those out of the dismissed table because they live
// on the active tab as pending rehires instead).
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

// -- Many-active fixture (longer-list demo) -----------------------------
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

// -----------------------------------------------------------------------

function renderListDemo(byTab: ContractorTabFixtures) {
  function ContractorListConfigDemo() {
    return <ContractorListDemo byTab={byTab} />
  }
  return ContractorListConfigDemo
}

function renderDismissalFormDemo(args: { contractor: Contractor; isPending?: boolean }) {
  function ContractorDismissalFormConfigDemo() {
    return <ContractorDismissalFormDemo contractor={args.contractor} isPending={args.isPending} />
  }
  return ContractorDismissalFormConfigDemo
}

function renderDetailsDemo(args: { contractor: Contractor; editable?: boolean }) {
  function ContractorDetailsConfigDemo() {
    return <ContractorDetailsDemo contractor={args.contractor} editable={args.editable} />
  }
  return ContractorDetailsConfigDemo
}

export const components: PrototypeComponent[] = [
  {
    slug: 'list',
    name: 'List',
    configurations: [
      {
        slug: 'empty',
        name: 'Empty',
        description: 'No contractors in any tab.',
        handlers: [],
        render: renderListDemo({ active: [], onboarding: [], dismissed: [] }),
      },
      {
        slug: 'active',
        name: 'Active list',
        description: 'Three regular active contractors. No status badges.',
        handlers: [],
        render: renderListDemo({
          active: regularActives,
          onboarding: [],
          dismissed: [],
        }),
      },
      {
        slug: 'pending-rehires',
        name: 'Pending rehires',
        description:
          'Active tab includes a previously-dismissed contractor scheduled to be rehired — shows the "Starts {date}" info badge.',
        handlers: [],
        render: renderListDemo({
          active: [...regularActives, ...pendingRehires],
          onboarding: [],
          dismissed: [],
        }),
      },
      {
        slug: 'upcoming-dismissal',
        name: 'Upcoming dismissal',
        description:
          'Active tab includes a contractor with a scheduled dismissal — shows the "Last day {date}" warning badge.',
        handlers: [],
        render: renderListDemo({
          active: [...regularActives, activeWithUpcomingDismissal],
          onboarding: [],
          dismissed: [],
        }),
      },
      {
        slug: 'onboarding',
        name: 'Onboarding states',
        description:
          'Onboarding tab with several states: admin-incomplete, self-invited, self-review, and two onboarded-with-future-start.',
        handlers: [],
        render: renderListDemo({
          active: [],
          onboarding: onboardingContractors,
          dismissed: [],
        }),
      },
      {
        slug: 'dismissed',
        name: 'Dismissed',
        description:
          'Dismissed tab with two terminated contractors — one with a recent (cancellable) dismissal, one with an older one.',
        handlers: [],
        render: renderListDemo({
          active: [],
          onboarding: [],
          dismissed: dismissedContractors,
        }),
      },
      {
        slug: 'mixed',
        name: 'Mixed',
        description:
          'All three tabs populated with semantically correct contractor states — the full surface in one config.',
        handlers: [],
        render: renderListDemo({
          active: [...regularActives, activeWithUpcomingDismissal, ...pendingRehires],
          onboarding: onboardingContractors,
          dismissed: dismissedContractors,
        }),
      },
      {
        slug: 'many',
        name: 'Many contractors',
        description: 'Twelve active contractors — exercises a longer list.',
        handlers: [],
        render: renderListDemo({ active: manyActives, onboarding: [], dismissed: [] }),
      },
    ],
  },
  {
    slug: 'dismissal-form',
    name: 'Dismissal Form',
    configurations: [
      {
        slug: 'default',
        name: 'Individual contractor',
        description: 'Standard dismissal form for an hourly individual contractor.',
        handlers: [],
        render: renderDismissalFormDemo({
          contractor: build({
            uuid: 'contractor-dismiss-1',
            firstName: 'Avery',
            lastName: 'Garcia',
            email: 'avery.garcia@example.com',
            hourlyRate: '65.00',
            startDate: '2024-03-15',
          }),
        }),
      },
      {
        slug: 'business',
        name: 'Business contractor',
        description:
          'Dismissal form for a Business-type contractor — heading uses the business name.',
        handlers: [],
        render: renderDismissalFormDemo({
          contractor: build({
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
          }),
        }),
      },
      {
        slug: 'recent-start',
        name: 'Recent start date',
        description:
          'Contractor started a few days ago — the date picker enforces a minDate of (start + 1 day) so earlier dates are disabled.',
        handlers: [],
        render: renderDismissalFormDemo({
          contractor: build({
            uuid: 'contractor-dismiss-new',
            firstName: 'Riya',
            lastName: 'Patel',
            email: 'riya.patel@example.com',
            hourlyRate: '85.00',
            startDate: daysFromNow(-3),
          }),
        }),
      },
      {
        slug: 'pending',
        name: 'Submitting',
        description: 'The submit button shows its loading state while the dismissal is in flight.',
        handlers: [],
        render: renderDismissalFormDemo({
          isPending: true,
          contractor: build({
            uuid: 'contractor-dismiss-pending',
            firstName: 'Imani',
            lastName: 'Okonkwo',
            email: 'imani.okonkwo@example.com',
            hourlyRate: '75.00',
            startDate: '2024-01-10',
          }),
        }),
      },
    ],
  },
  {
    slug: 'basic-details',
    name: 'Basic Details',
    configurations: [
      {
        slug: 'individual',
        name: 'Individual contractor',
        description: 'Fully filled-in details for an individual contractor.',
        handlers: [],
        render: renderDetailsDemo({
          editable: true,
          contractor: build({
            uuid: 'contractor-details-individual',
            type: 'Individual',
            firstName: 'Avery',
            middleInitial: 'J',
            lastName: 'Garcia',
            email: 'avery.garcia@example.com',
            hasSsn: true,
            startDate: '2024-03-15',
          }),
        }),
      },
      {
        slug: 'business',
        name: 'Business contractor',
        description: 'Business contractor — shows business name and EIN.',
        handlers: [],
        render: renderDetailsDemo({
          editable: true,
          contractor: build({
            uuid: 'contractor-details-business',
            type: 'Business',
            businessName: 'Pacific Design Co.',
            firstName: 'Mason',
            lastName: 'Park',
            email: 'mason.park@pacificdesign.com',
            hasEin: true,
            startDate: '2023-11-01',
          }),
        }),
      },
      {
        slug: 'missing-data',
        name: 'Missing data',
        description: 'Individual without SSN or email — shows the dash fallback.',
        handlers: [],
        render: renderDetailsDemo({
          editable: true,
          contractor: build({
            uuid: 'contractor-details-sparse',
            type: 'Individual',
            firstName: 'Riya',
            lastName: 'Patel',
            email: '',
            hasSsn: false,
            startDate: '2024-06-22',
          }),
        }),
      },
      {
        slug: 'read-only',
        name: 'Read-only',
        description: 'No `onEdit` prop, so the Edit button is hidden.',
        handlers: [],
        render: renderDetailsDemo({
          contractor: build({
            uuid: 'contractor-details-readonly',
            type: 'Individual',
            firstName: 'Quinn',
            lastName: 'Chen',
            email: 'quinn.chen@example.com',
            hasSsn: true,
            startDate: '2024-01-10',
          }),
        }),
      },
    ],
  },
]
