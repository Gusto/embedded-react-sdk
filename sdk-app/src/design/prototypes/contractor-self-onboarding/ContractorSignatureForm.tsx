import { useContractorDocumentsGetSuspense } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorDocumentsGet'
import { useContractorDocumentsGetPdfSuspense } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorDocumentsGetPdf'
import { useContractorDocumentsSignMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorDocumentsSign'
import {
  ContractorDocumentSignature,
  type ContractorDocumentSignatureValues,
} from '../../components/contractor/self-onboarding/ContractorDocumentSignature/ContractorDocumentSignature'
import { contractorSelfOnboardingEvents } from './events'
import { useBase } from '@/components/Base'

interface ContractorSignatureFormProps {
  contractorId: string
  documentUuid: string
  onSignComplete: () => void
  onBack: () => void
}

export function ContractorSignatureForm({
  documentUuid,
  onSignComplete,
  onBack,
}: ContractorSignatureFormProps) {
  const { onEvent: _onEvent } = useBase()
  const onEvent = _onEvent as (type: string, data?: unknown) => void

  const {
    data: { document },
  } = useContractorDocumentsGetSuspense({ documentUuid })

  const {
    data: { documentPdf },
  } = useContractorDocumentsGetPdfSuspense({ documentUuid })

  const { mutateAsync: signDocument, isPending } = useContractorDocumentsSignMutation()

  const pdfUrl = documentPdf?.documentUrl ?? null

  const onSubmit = async (data: ContractorDocumentSignatureValues) => {
    const fields = (document?.fields ?? []).map(field => ({
      key: field.key ?? '',
      value: field.key?.includes('signature') ? data.signature : (field.value ?? ''),
    }))

    const result = await signDocument({
      request: {
        documentUuid,
        requestBody: {
          fields,
          agree: data.agree,
        },
      },
    })

    onEvent(contractorSelfOnboardingEvents.CONTRACTOR_SIGN_DOCUMENT, result.documentSigned)
    onSignComplete()
  }

  return (
    <ContractorDocumentSignature
      title={document?.title ?? 'Sign document'}
      description={document?.description}
      pdfUrl={pdfUrl}
      isPending={isPending}
      onSubmit={onSubmit}
      onBack={onBack}
    />
  )
}
