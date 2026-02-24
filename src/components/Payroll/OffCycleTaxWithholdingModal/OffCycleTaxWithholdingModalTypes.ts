import type {
  PayPeriodFrequency,
  OffCycleTaxWithholdingConfig,
} from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { WithholdingType } from '@/components/Payroll/OffCycleReasonSelection'

export type { PayPeriodFrequency, OffCycleTaxWithholdingConfig }

export interface OffCycleTaxWithholdingModalProps {
  isOpen: boolean
  config: OffCycleTaxWithholdingConfig
  onPayPeriodFrequencyChange: (frequency: PayPeriodFrequency) => void
  onWithholdingRateChange: (rate: WithholdingType) => void
  onDone: () => void
  onCancel: () => void
}
