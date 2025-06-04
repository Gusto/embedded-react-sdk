import { type Form as FormSchema } from '@gusto/embedded-api/models/components/form'
import { useCompanyFormsGetAllSuspense } from '@gusto/embedded-api/react-query/companyFormsGetAll'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { Head } from './Head'
import { List } from './List'
import { ManageSignatories } from './ManageSignatories'
import { Actions } from './Actions'
import { DocumentListProvider } from './useDocumentList'
import { useI18n } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'

interface DocumentListProps extends BaseComponentInterface<'Company.DocumentList'> {
  companyId: string
  signatoryId?: string
}

export function DocumentList(props: DocumentListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, signatoryId, className, children }: DocumentListProps) {
  useI18n('Company.DocumentList')
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

  // For now, this will only ever have one entry for the current signatory since companies can
  // only have one signatory. If that changes in the future, this UX will need to be revisited.
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

  return (
    <section className={className}>
      <DocumentListProvider
        value={{
          companyForms,
          documentListError,
          handleRequestFormToSign,
          handleChangeSignatory,
          handleContinue,
          isSelfSignatory,
          signatory,
        }}
      >
        <Flex flexDirection="column" gap={32}>
          {children ? (
            children
          ) : (
            <>
              <Head />
              <ManageSignatories />
              <List />
              <Actions />
            </>
          )}
        </Flex>
      </DocumentListProvider>
    </section>
  )
}

DocumentList.Head = Head
DocumentList.ManageSignatories = ManageSignatories
DocumentList.List = List
DocumentList.Actions = Actions
