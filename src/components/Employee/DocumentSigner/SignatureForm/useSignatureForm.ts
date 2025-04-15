import type { Form } from '@gusto/embedded-api/models/components/form'
import { createCompoundContext } from '@/components/Base'

type SignatureFormContextType = {
  form: Form
  pdfUrl?: string | null
  handleBack: () => void
  isPending: boolean
}

const [useSignatureForm, SignatureFormProvider] =
  createCompoundContext<SignatureFormContextType>('SignatureFormContext')
export { useSignatureForm, SignatureFormProvider }
