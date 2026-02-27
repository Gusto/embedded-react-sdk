import { Suspense, useState } from 'react'
import { WithholdingPayPeriod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import { OffCycleTaxWithholdingModal } from '../OffCycleTaxWithholdingModal/OffCycleTaxWithholdingModal'
import { OffCycleTaxWithholdingTable } from './OffCycleTaxWithholdingTable'
import type {
  OffCycleTaxWithholdingConfig,
  WageTypeGroup,
} from './OffCycleTaxWithholdingTableTypes'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.OffCycleTaxWithholding')
  return <>{children}</>
}

const DEFAULT_WAGE_TYPE_GROUPS: WageTypeGroup[] = [
  {
    id: 'regular',
    label: 'Regular hours, regular wages, tips',
    description:
      "These earnings should be taxed at a rate that matches your employees' regular pay schedule.",
    category: 'regular',
  },
  {
    id: 'supplemental',
    label: 'Supplemental wages, bonus wages, commission',
    description:
      'These are typically taxed at the rate required by the IRS for federal income taxes and by the state for state income taxes.',
    category: 'supplemental',
  },
  {
    id: 'reimbursement',
    label: 'Reimbursements',
    category: 'reimbursement',
  },
]

export default {
  title: 'Domain/Payroll/OffCycleTaxWithholdingTable',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <I18nLoader>
          <Story />
        </I18nLoader>
      </Suspense>
    ),
  ],
}

export const Default = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [config, setConfig] = useState<OffCycleTaxWithholdingConfig>({
    withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
    withholdingRate: 'regular',
  })

  return (
    <>
      <OffCycleTaxWithholdingTable
        wageTypeGroups={DEFAULT_WAGE_TYPE_GROUPS}
        config={config}
        onEditClick={() => {
          setIsModalOpen(true)
        }}
      />
      <OffCycleTaxWithholdingModal
        isOpen={isModalOpen}
        defaultConfig={config}
        onDone={updatedConfig => {
          setConfig(updatedConfig)
          setIsModalOpen(false)
        }}
        onCancel={() => {
          setIsModalOpen(false)
        }}
      />
    </>
  )
}

export const WithSupplementalRate = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [config, setConfig] = useState<OffCycleTaxWithholdingConfig>({
    withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
    withholdingRate: 'supplemental',
  })

  return (
    <>
      <OffCycleTaxWithholdingTable
        wageTypeGroups={DEFAULT_WAGE_TYPE_GROUPS}
        config={config}
        onEditClick={() => {
          setIsModalOpen(true)
        }}
      />
      <OffCycleTaxWithholdingModal
        isOpen={isModalOpen}
        defaultConfig={config}
        onDone={updatedConfig => {
          setConfig(updatedConfig)
          setIsModalOpen(false)
        }}
        onCancel={() => {
          setIsModalOpen(false)
        }}
      />
    </>
  )
}

export const WeeklyFrequency = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [config, setConfig] = useState<OffCycleTaxWithholdingConfig>({
    withholdingPayPeriod: WithholdingPayPeriod.EveryWeek,
    withholdingRate: 'regular',
  })

  return (
    <>
      <OffCycleTaxWithholdingTable
        wageTypeGroups={DEFAULT_WAGE_TYPE_GROUPS}
        config={config}
        onEditClick={() => {
          setIsModalOpen(true)
        }}
      />
      <OffCycleTaxWithholdingModal
        isOpen={isModalOpen}
        defaultConfig={config}
        onDone={updatedConfig => {
          setConfig(updatedConfig)
          setIsModalOpen(false)
        }}
        onCancel={() => {
          setIsModalOpen(false)
        }}
      />
    </>
  )
}
