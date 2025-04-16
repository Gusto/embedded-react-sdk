import { type Form as FormSchema } from '@gusto/embedded-api/models/components/form'
import { createCompoundContext } from '@/components/Base'

type SignatureFormContextType = {
  form: FormSchema
  pdfUrl?: string | null
  isPending: boolean
  onBack: () => void
}

const [useSignatureForm, SignatureFormProvider] = createCompoundContext<SignatureFormContextType>(
  'CompanySignatureFormContext',
)

export { useSignatureForm, SignatureFormProvider }
