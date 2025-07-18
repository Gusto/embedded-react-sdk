import { useEmployeeFormsListSuspense } from '@gusto/embedded-api/react-query/employeeFormsList'
import { type Form } from '@gusto/embedded-api/models/components/form'
import { Head } from './Head'
import { List } from './List'
import { Actions } from './Actions'
import { DocumentListProvider } from './useDocumentList'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Flex } from '@/components/Common'

interface DocumentListProps extends CommonComponentInterface {
  employeeId: string
}

export function DocumentList(props: DocumentListProps & BaseComponentInterface) {
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
  const employeeForms = data.formList!

  const hasSignedAllForms = employeeForms.every(employeeForm => !employeeForm.requiresSigning)

  const handleRequestFormToSign = (data: Form) => {
    onEvent(componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN, { uuid: data.uuid })
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
