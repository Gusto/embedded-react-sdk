import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'

/** @internal */
export interface OffCycleTaxWithholdingModalProps {
  /** Whether the modal is currently visible. */
  isOpen: boolean
  /** Initial withholding configuration shown when the modal opens. */
  defaultConfig: OffCycleTaxWithholdingConfig
  /** Called with the updated configuration when the user confirms. */
  onDone: (config: OffCycleTaxWithholdingConfig) => void
  /** Called when the user dismisses the modal without saving. */
  onCancel: () => void
}
