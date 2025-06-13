import type { FlowContextInterface } from '@/components/Flow/useFlow'

export interface DocumentSignerContextInterface extends FlowContextInterface {
  companyId: string
  signatoryId?: string
  formId?: string
}
