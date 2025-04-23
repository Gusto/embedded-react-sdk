import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import { useFlowParams } from '@/components/Flow/hooks/useFlowParams'

export interface DocumentSignerContextInterface extends FlowContextInterface {
  companyId: string
  signatoryId?: string
  formId?: string
}

export function useDocumentSignerFlowParams(
  props: UseFlowParamsProps<DocumentSignerContextInterface>,
) {
  return useFlowParams(props)
}
