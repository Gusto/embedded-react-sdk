import type { Form } from '@gusto/embedded-api/models/components/form'
import { createCompoundContext } from '@/components/Base'

type DocumentListContextType = {
  employeeForms: Form[]
  hasSignedAllForms: boolean
  handleContinue: () => void
  handleRequestFormToSign: (form: Form) => void
  documentListError: Error | null
  formToSign?: Form
}

const [useDocumentList, DocumentListProvider] =
  createCompoundContext<DocumentListContextType>('DocumentListContext')
export { useDocumentList, DocumentListProvider }
