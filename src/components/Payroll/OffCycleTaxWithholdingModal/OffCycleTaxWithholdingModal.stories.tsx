import { Suspense, useState } from 'react'
import { WithholdingPayPeriod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import { OffCycleTaxWithholdingModal } from './OffCycleTaxWithholdingModal'
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
    withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
    withholdingRate: 'regular',
  })

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
        defaultConfig={config}
        onDone={updatedConfig => {
          setConfig(updatedConfig)
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
    withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
    withholdingRate: 'supplemental',
  })

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
        defaultConfig={config}
        onDone={updatedConfig => {
          setConfig(updatedConfig)
          setIsOpen(false)
        }}
        onCancel={() => {
          setIsOpen(false)
        }}
      />
    </>
  )
}
