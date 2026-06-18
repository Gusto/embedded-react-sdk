import { type Form as FormSchema } from '@gusto/embedded-api-v-2025-11-15/models/components/form'
import { useCompanyFormsGetAllSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/companyFormsGetAll'
import { useSignatoriesListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/signatoriesList'
import { Head } from './Head'
import { List } from './List'
import { ManageSignatories } from './ManageSignatories'
import { Actions } from './Actions'
import { DocumentListProvider } from './useDocumentList'
import { useI18n, useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'

interface DocumentListProps extends BaseComponentInterface<'Company.DocumentList'> {
  companyId: string
  signatoryId?: string
}

/**
 * Displays the list of company documents to be signed and lets the user manage signatories.
 *
 * @remarks
 * Lower-level building block used internally by `CompanyOnboarding.DocumentSigner` for its list
 * view. Use this component directly when you need full control over navigation between the
 * document list and the signature form.
 *
 * When `signatoryId` matches the currently saved signatory's id, the user is treated as the
 * signatory and is allowed to sign documents.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/forms/view` | Fired when a user selects a form to sign from the document list | The selected company form |
 * | `company/forms/editSignatory` | Fired when user requests to change the document signatory | The current signatory entity |
 * | `company/forms/done` | Fired when user completes the document signing process | — |
 *
 * @param props - Component props including the company id and optional signatory id
 * @returns The document list view with signatory management and continue action
 * @public
 */
export function DocumentList(props: DocumentListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, signatoryId, className, children, dictionary }: DocumentListProps) {
  useComponentDictionary('Company.DocumentList', dictionary)
  useI18n('Company.DocumentList')
  const { onEvent } = useBase()

  const {
    data: { forms },
    error: documentListError,
  } = useCompanyFormsGetAllSuspense({
    companyId,
  })
  const companyForms = forms!

  const {
    data: { signatories: signatoryList },
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
