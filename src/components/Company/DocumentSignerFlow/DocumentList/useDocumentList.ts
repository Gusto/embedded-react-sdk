import { type Signatory } from '@gusto/embedded-api/models/components/signatory'
import { type Form as FormSchema } from '@gusto/embedded-api/models/components/form'
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
