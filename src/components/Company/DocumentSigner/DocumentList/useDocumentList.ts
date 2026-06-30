import { type Signatory } from '@gusto/embedded-api-v-2026-06-15/models/components/signatory'
import { type Form as FormSchema } from '@gusto/embedded-api-v-2026-06-15/models/components/form'
import { createCompoundContext } from '@/components/Base'

type DocumentListContextType = {
  companyForms: FormSchema[]
  documentListError: Error | null
  handleRequestFormToSign: (form: FormSchema) => void
  handleChangeSignatory: () => void
  handleContinue: () => void
  isSelfSignatory: boolean
  signatory?: Signatory
}

const [useDocumentList, DocumentListProvider] = createCompoundContext<DocumentListContextType>(
  'CompanyDocumentListContext',
)

export { useDocumentList, DocumentListProvider }
