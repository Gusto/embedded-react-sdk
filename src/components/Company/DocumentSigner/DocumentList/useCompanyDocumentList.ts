import { type Form as FormSchema } from '@gusto/embedded-api/models/components/form'
import { useCompanyFormsGetAllSuspense } from '@gusto/embedded-api/react-query/companyFormsGetAll'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { useBase } from '@/components/Base/useBase'
import { companyEvents } from '@/shared/constants'

interface UseCompanyDocumentListProps {
  companyId: string
  signatoryId?: string
}

export function useCompanyDocumentList({ companyId, signatoryId }: UseCompanyDocumentListProps) {
  const { onEvent } = useBase()

  const {
    data: { formList },
    error: documentListError,
  } = useCompanyFormsGetAllSuspense({
    companyId,
  })
  const companyForms = formList!

  const {
    data: { signatoryList },
  } = useSignatoriesListSuspense({
    companyUuid: companyId,
  })
  const signatories = signatoryList!

  const signatory = signatories[0]
  const isSelfSignatory = !!signatoryId && signatory?.uuid === signatoryId

  const handleRequestFormToSign = (form: FormSchema) => {
    onEvent(companyEvents.COMPANY_VIEW_FORM_TO_SIGN, form)
  }

  const handleChangeSignatory = () => {
    onEvent(companyEvents.COMPANY_FORM_EDIT_SIGNATORY, signatory)
  }

  const handleContinue = () => {
    onEvent(companyEvents.COMPANY_FORMS_DONE)
  }

  return {
    data: {
      companyForms,
      signatory,
      isSelfSignatory,
      documentListError,
    },
    actions: {
      handleRequestFormToSign,
      handleChangeSignatory,
      handleContinue,
    },
    meta: {},
  }
}
