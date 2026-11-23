import type { FlowContextInterface } from '@/components/Flow/useFlow'

/** @internal */
export interface DocumentSignerContextInterface extends FlowContextInterface {
  companyId: string
  signatoryId?: string
  formId?: string
  /**
   * Whether a signatory created or updated from the assign screen becomes `signatoryId`, which
   * unlocks signing for the viewer. `false` keeps signing bound to the host-supplied `signatoryId`.
   */
  adoptsAssignedSignatory: boolean
}
