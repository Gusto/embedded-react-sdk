import type { Document } from '@gusto/embedded-api/models/components/document'
import { createCompoundContext } from '@/components/Base'

type SignatureFormContextType = {
  document: Document
  pdfUrl?: string | null
  handleBack: () => void
  isPending: boolean
}

const [useSignatureForm, SignatureFormProvider] = createCompoundContext<SignatureFormContextType>(
  'ContractorSignatureFormContext',
)
export { useSignatureForm, SignatureFormProvider }
