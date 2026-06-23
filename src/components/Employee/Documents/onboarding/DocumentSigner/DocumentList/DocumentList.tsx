import { useEmployeeFormsListSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeFormsList'
import { type Form } from '@gusto/embedded-api-v-2026-02-01/models/components/form'
import { Head } from './Head'
import { List } from './List'
import { Actions } from './Actions'
import { DocumentListProvider } from './useDocumentList'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Flex } from '@/components/Common'

/**
 * Props for {@link DocumentList}.
 *
 * @public
 */
export interface DocumentListProps extends BaseComponentInterface {
  /** The associated employee identifier. */
  employeeId: string
}

/**
 * Lists the employee's documents pending signature.
 *
 * @remarks
 * Fetches the employee's forms and renders the list of documents that still
 * require signing along with a continue action once everything is signed.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/forms/view` | Fired when a form's "Sign" action is selected | `{ uuid: string; name?: string }` |
 * | `employee/forms/done` | Fired when all required forms have been signed and the parent flow can advance | — |
 *
 * @param props - See {@link DocumentListProps}.
 * @returns The employee document list.
 * @public
 */
export function DocumentList(props: DocumentListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ employeeId, className, children }: DocumentListProps) {
  useI18n('Employee.DocumentSigner')
  const { onEvent } = useBase()

  const { data, error: documentListError } = useEmployeeFormsListSuspense({ employeeId })
  const employeeForms = data.forms!

  const hasSignedAllForms = employeeForms.every(employeeForm => !employeeForm.requiresSigning)

  const handleRequestFormToSign = (data: Form) => {
    const fullForm = employeeForms.find(f => f.uuid === data.uuid)
    onEvent(componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN, { uuid: data.uuid, name: fullForm?.name })
  }

  const handleContinue = () => {
    onEvent(componentEvents.EMPLOYEE_FORMS_DONE)
  }

  return (
    <section className={className}>
      <DocumentListProvider
        value={{
          employeeForms,
          hasSignedAllForms,
          handleContinue,
          handleRequestFormToSign,
          documentListError,
        }}
      >
        {children ? (
          children
        ) : (
          <Flex flexDirection="column">
            <Head />
            <List />
            <Actions />
          </Flex>
        )}
      </DocumentListProvider>
    </section>
  )
}
