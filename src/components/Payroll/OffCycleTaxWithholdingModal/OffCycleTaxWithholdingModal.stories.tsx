import { Suspense, useState } from 'react'
import type {
  OffCycleTaxWithholdingConfig,
  PayPeriodFrequency,
} from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import { OffCycleTaxWithholdingModal } from './OffCycleTaxWithholdingModal'
import type { WithholdingType } from '@/components/Payroll/OffCycleReasonSelection'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.OffCycleTaxWithholding')
  return <>{children}</>
}

export default {
  title: 'Domain/Payroll/OffCycleTaxWithholdingModal',
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
  const { Button } = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)
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
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open Tax Withholding Modal
      </Button>
      <OffCycleTaxWithholdingModal
        isOpen={isOpen}
        config={config}
        onPayPeriodFrequencyChange={handlePayPeriodFrequencyChange}
        onWithholdingRateChange={handleWithholdingRateChange}
        onDone={() => {
          setIsOpen(false)
        }}
        onCancel={() => {
          setIsOpen(false)
        }}
      />
    </>
  )
}

export const WithSupplementalRate = () => {
  const { Button } = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)
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
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open Tax Withholding Modal (Supplemental)
      </Button>
      <OffCycleTaxWithholdingModal
        isOpen={isOpen}
        config={config}
        onPayPeriodFrequencyChange={handlePayPeriodFrequencyChange}
        onWithholdingRateChange={handleWithholdingRateChange}
        onDone={() => {
          setIsOpen(false)
        }}
        onCancel={() => {
          setIsOpen(false)
        }}
      />
    </>
  )
}
