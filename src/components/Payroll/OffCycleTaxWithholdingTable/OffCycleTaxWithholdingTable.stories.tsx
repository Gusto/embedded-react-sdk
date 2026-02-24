import { Suspense, useState } from 'react'
import { OffCycleTaxWithholdingModal } from '../OffCycleTaxWithholdingModal/OffCycleTaxWithholdingModal'
import { OffCycleTaxWithholdingTable } from './OffCycleTaxWithholdingTable'
import type {
  OffCycleTaxWithholdingConfig,
  PayPeriodFrequency,
  WageTypeGroup,
} from './OffCycleTaxWithholdingTableTypes'
import type { WithholdingType } from '@/components/Payroll/OffCycleReasonSelection'
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
    payPeriodFrequency: 'every_other_week',
    withholdingRate: 'regular',
  })

  const handlePayPeriodFrequencyChange = (frequency: PayPeriodFrequency) => {
    setConfig(prev => ({ ...prev, payPeriodFrequency: frequency }))
  }

  const handleWithholdingRateChange = (rate: WithholdingType) => {
    setConfig(prev => ({ ...prev, withholdingRate: rate }))
  }

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
        config={config}
        onPayPeriodFrequencyChange={handlePayPeriodFrequencyChange}
        onWithholdingRateChange={handleWithholdingRateChange}
        onDone={() => {
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
    payPeriodFrequency: 'every_other_week',
    withholdingRate: 'supplemental',
  })

  const handlePayPeriodFrequencyChange = (frequency: PayPeriodFrequency) => {
    setConfig(prev => ({ ...prev, payPeriodFrequency: frequency }))
  }

  const handleWithholdingRateChange = (rate: WithholdingType) => {
    setConfig(prev => ({ ...prev, withholdingRate: rate }))
  }

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
        config={config}
        onPayPeriodFrequencyChange={handlePayPeriodFrequencyChange}
        onWithholdingRateChange={handleWithholdingRateChange}
        onDone={() => {
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
    payPeriodFrequency: 'every_week',
    withholdingRate: 'regular',
  })

  const handlePayPeriodFrequencyChange = (frequency: PayPeriodFrequency) => {
    setConfig(prev => ({ ...prev, payPeriodFrequency: frequency }))
  }

  const handleWithholdingRateChange = (rate: WithholdingType) => {
    setConfig(prev => ({ ...prev, withholdingRate: rate }))
  }

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
        config={config}
        onPayPeriodFrequencyChange={handlePayPeriodFrequencyChange}
        onWithholdingRateChange={handleWithholdingRateChange}
        onDone={() => {
          setIsModalOpen(false)
        }}
        onCancel={() => {
          setIsModalOpen(false)
        }}
      />
    </>
  )
}
