import { useTranslation } from 'react-i18next'
import { DocumentsCard } from './DocumentsCard'
import { DocumentManager } from './DocumentManager'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

export type DocumentsSuccessAlertCode = 'documentSigned'

export interface DocumentsContextInterface extends FlowContextInterface {
  employeeId?: string
  /** Set when transitioning to `viewForm` via the VIEW_REQUESTED event;
   *  consumed by `DocumentManagerContextual` to load the selected form. */
  formId?: string
  successAlert?: DocumentsSuccessAlertCode | null
}

export function DocumentsCardContextual() {
  const { employeeId, onEvent, successAlert } = useFlow<DocumentsContextInterface>()
  const { t } = useTranslation('Employee.Management.Documents')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <DocumentsCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
    </Flex>
  )
}

export function DocumentManagerContextual() {
  const { employeeId, formId, onEvent } = useFlow<DocumentsContextInterface>()
  return (
    <DocumentManager
      employeeId={ensureRequired(employeeId)}
      formId={ensureRequired(formId)}
      onEvent={onEvent}
    />
  )
}
