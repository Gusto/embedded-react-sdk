/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import {
  SetupStatus,
  type TaxRequirementStatesList,
} from '@gusto/embedded-api/models/components/taxrequirementstateslist'
import type { TaxRequirementSet } from '@gusto/embedded-api/models/components/taxrequirementset'
import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import type { PrototypeComponent } from '../../prototypeTypes'
import { StateTaxesListView } from '../../../components/company/onboarding/StateTaxesWithFutureRates/StateTaxesListView'
import { TaxRatesHistoryView } from '../../../components/company/onboarding/StateTaxesWithFutureRates/TaxRatesHistoryView'
import { AddTaxRateDialog } from '../../../components/company/onboarding/StateTaxesWithFutureRates/AddTaxRateDialog'

const mockStates: TaxRequirementStatesList[] = [
  {
    state: 'CA',
    setupStatus: SetupStatus.Complete,
    readyToRunPayroll: true,
    defaultRatesApplied: false,
  },
  {
    state: 'NY',
    setupStatus: SetupStatus.InProgress,
    readyToRunPayroll: false,
    defaultRatesApplied: false,
  },
  {
    state: 'WA',
    setupStatus: SetupStatus.Complete,
    readyToRunPayroll: true,
    defaultRatesApplied: true,
  },
  {
    state: 'TX',
    setupStatus: SetupStatus.NotStarted,
    readyToRunPayroll: false,
    defaultRatesApplied: false,
  },
]

const emptyStates: TaxRequirementStatesList[] = []

const waRequirements: TaxRequirement[] = [
  {
    key: 'wa_ui_rate',
    label: 'UI tax rate',
    description: 'Combined unemployment insurance rate',
    value: '2.75',
    editable: true,
    metadata: { type: 'tax_rate' },
  },
  {
    key: 'wa_eaf_rate',
    label: 'EAF rate',
    description: 'Employment administration fund rate',
    value: '0.03',
    editable: true,
    metadata: { type: 'tax_rate' },
  },
]

const waRequirementSets: TaxRequirementSet[] = [
  {
    state: 'WA',
    key: 'wa_ui_rates',
    label: 'UI & EAF rates',
    effectiveFrom: '2024-01-01',
    requirements: waRequirements.map(r => ({
      ...r,
      value: r.key === 'wa_ui_rate' ? '2.50' : '0.02',
    })),
  },
  {
    state: 'WA',
    key: 'wa_ui_rates',
    label: 'UI & EAF rates',
    effectiveFrom: '2025-01-01',
    requirements: waRequirements,
  },
  {
    state: 'WA',
    key: 'wa_ui_rates',
    label: 'UI & EAF rates',
    effectiveFrom: '2026-01-01',
    requirements: waRequirements.map(r => ({
      ...r,
      value: r.key === 'wa_ui_rate' ? '2.90' : '0.03',
    })),
  },
  {
    state: 'WA',
    key: 'wa_ui_rates',
    label: 'UI & EAF rates',
    effectiveFrom: '2027-01-01',
    requirements: waRequirements.map(r => ({
      ...r,
      value: r.key === 'wa_ui_rate' ? '3.10' : '0.04',
    })),
  },
]

const singleCurrentRateOnly: TaxRequirementSet[] = [
  {
    state: 'CA',
    key: 'ca_sdi',
    label: 'CA SDI',
    effectiveFrom: '2025-01-01',
    requirements: [
      {
        key: 'ca_sdi_rate',
        label: 'SDI rate',
        value: '1.10',
        editable: true,
        metadata: { type: 'tax_rate' },
      },
    ],
  },
]

function ListPopulatedStory() {
  return (
    <StateTaxesListView
      stateTaxRequirements={mockStates}
      onEditCurrent={() => {}}
      onManageRates={() => {}}
    />
  )
}

function ListEmptyStory() {
  return (
    <StateTaxesListView
      stateTaxRequirements={emptyStates}
      onEditCurrent={() => {}}
      onManageRates={() => {}}
    />
  )
}

function HistoryPopulatedStory() {
  const [sets, setSets] = useState<TaxRequirementSet[]>(waRequirementSets)
  return (
    <TaxRatesHistoryView
      state="WA"
      requirementSets={sets}
      availableFutureDates={['2028-01-01', '2028-07-01', '2029-01-01']}
      onBack={() => {}}
      onAddTaxRate={submission => {
        setSets(prev => [
          ...prev,
          {
            state: 'WA',
            key: 'wa_ui_rates',
            label: 'UI & EAF rates',
            effectiveFrom: submission.effectiveFrom,
            requirements: waRequirements.map(r => ({
              ...r,
              value: r.key ? (submission.values[r.key] ?? r.value) : r.value,
            })),
          },
        ])
        return Promise.resolve(true)
      }}
    />
  )
}

function HistorySingleRateStory() {
  return (
    <TaxRatesHistoryView
      state="CA"
      requirementSets={singleCurrentRateOnly}
      availableFutureDates={['2026-01-01', '2026-07-01', '2027-01-01']}
      onBack={() => {}}
      onAddTaxRate={() => Promise.resolve(true)}
    />
  )
}

function HistoryEmptyStory() {
  return (
    <TaxRatesHistoryView
      state="TX"
      requirementSets={[]}
      availableFutureDates={['2026-01-01', '2027-01-01']}
      onBack={() => {}}
      onAddTaxRate={() => Promise.resolve(true)}
    />
  )
}

const caRequirementSet: TaxRequirementSet = {
  state: 'CA',
  key: 'ca_ui_rates',
  label: 'CA UI & ETT rates',
  effectiveFrom: '2026-01-01',
  requirements: [
    {
      key: 'has_tax_rates',
      label: 'Have you received your tax rates from your state agency?',
      value: null,
      editable: true,
      metadata: {
        type: 'radio',
        options: [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' },
        ],
      },
    },
    {
      key: 'ca_ui_rate',
      label: 'Unemployment tax rate',
      description: 'The unemployment tax rate assigned to you by the state agency.',
      value: null,
      editable: true,
      metadata: { type: 'tax_rate' },
      applicableIf: [{ key: 'has_tax_rates', value: 'true' }],
    },
    {
      key: 'ca_ett_rate',
      label: 'ETT rate',
      description: 'Most companies are assigned a rate of 0.1%.',
      value: null,
      editable: true,
      metadata: { type: 'tax_rate' },
      applicableIf: [{ key: 'has_tax_rates', value: 'true' }],
    },
  ],
}

const waRequirementTemplate: TaxRequirementSet = {
  state: 'WA',
  key: 'wa_ui_rates',
  label: 'UI & EAF rates',
  effectiveFrom: '2027-01-01',
  requirements: waRequirements,
}

function AddDialogOpenStory() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <>
      <AddTaxRateDialog
        isOpen={isOpen}
        state="CA"
        availableEffectiveDates={['2026-01-01', '2026-07-01', '2027-01-01']}
        requirementTemplate={caRequirementSet}
        onClose={() => {
          setIsOpen(false)
        }}
        onSubmit={() => {
          setIsOpen(false)
        }}
      />
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
          }}
        >
          Reopen dialog
        </button>
      )}
    </>
  )
}

function AddDialogWaStory() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <>
      <AddTaxRateDialog
        isOpen={isOpen}
        state="WA"
        availableEffectiveDates={['2027-01-01', '2027-07-01', '2028-01-01']}
        requirementTemplate={waRequirementTemplate}
        onClose={() => {
          setIsOpen(false)
        }}
        onSubmit={() => {
          setIsOpen(false)
        }}
      />
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
          }}
        >
          Reopen dialog
        </button>
      )}
    </>
  )
}

function AddDialogNoFieldsStory() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <>
      <AddTaxRateDialog
        isOpen={isOpen}
        state="FL"
        availableEffectiveDates={['2027-01-01', '2028-01-01']}
        requirementTemplate={null}
        onClose={() => {
          setIsOpen(false)
        }}
        onSubmit={() => {
          setIsOpen(false)
        }}
      />
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
          }}
        >
          Reopen dialog
        </button>
      )}
    </>
  )
}

export const components: PrototypeComponent[] = [
  {
    slug: 'state-taxes-list',
    name: 'State taxes list',
    description:
      'Duplicated onboarding list with a hamburger menu that includes "Manage tax rates".',
    configurations: [
      {
        slug: 'populated',
        name: 'Populated',
        description: 'A mix of complete, in-progress, and not-started states.',
        render: () => <ListPopulatedStory />,
      },
      {
        slug: 'empty',
        name: 'Empty',
        description: 'No states configured yet.',
        render: () => <ListEmptyStory />,
      },
    ],
  },
  {
    slug: 'tax-rates-history',
    name: 'Tax rates history',
    description:
      'DataView showing effective-dated rate configurations for a state, including historical, current, and scheduled future rates.',
    configurations: [
      {
        slug: 'multi-year',
        name: 'Multi-year timeline',
        description: 'Historical, current, and future rates in one view — the multi-badge case.',
        render: () => <HistoryPopulatedStory />,
      },
      {
        slug: 'current-only',
        name: 'Current rate only',
        description: 'No history and no future rates yet — just the active configuration.',
        render: () => <HistorySingleRateStory />,
      },
      {
        slug: 'empty',
        name: 'Empty',
        description: 'No rates on record for the state.',
        render: () => <HistoryEmptyStory />,
      },
    ],
  },
  {
    slug: 'add-tax-rate-dialog',
    name: 'Add tax rate dialog',
    description:
      'Dialog for selecting a future effective date and setting dynamic requirement values.',
    configurations: [
      {
        slug: 'ca-with-applicable-if',
        name: 'CA — with conditional question',
        description:
          'The CA case: yes/no gate on "Have you received your tax rates" conditionally reveals Unemployment tax rate and ETT rate.',
        render: () => <AddDialogOpenStory />,
      },
      {
        slug: 'wa-flat',
        name: 'WA — flat rate inputs',
        description: 'A simpler state with no conditional gate — both rate inputs shown directly.',
        render: () => <AddDialogWaStory />,
      },
      {
        slug: 'no-fields',
        name: 'No editable fields',
        description:
          'A state that has no editable tax requirement fields — dialog degrades gracefully.',
        render: () => <AddDialogNoFieldsStory />,
      },
    ],
  },
]
