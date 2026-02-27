import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'

export type { OffCycleTaxWithholdingConfig }

export interface OffCycleTaxWithholdingModalProps {
  isOpen: boolean
  defaultConfig: OffCycleTaxWithholdingConfig
  onDone: (config: OffCycleTaxWithholdingConfig) => void
  onCancel: () => void
}
