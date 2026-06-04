import { useTranslation } from 'react-i18next'
import { DeductionsCard } from './DeductionsCard'
import { DeductionsEditForm } from './DeductionsEditForm'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

export type DeductionsSuccessAlertCode = 'deductionAdded' | 'deductionUpdated' | 'deductionDeleted'

export interface DeductionsContextInterface extends FlowContextInterface {
  employeeId?: string
  /** Set when transitioning to `editDeduction` via the EDIT event; consumed
   *  by `DeductionsEditFormContextual` to pre-populate the form. Omit on
   *  ADD to open the form in create mode. */
  editingDeductionId?: string
  successAlert?: DeductionsSuccessAlertCode | null
}

export function DeductionsCardContextual() {
  const { employeeId, onEvent, successAlert } = useFlow<DeductionsContextInterface>()
  const { t } = useTranslation('Employee.Management.Deductions')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <DeductionsCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
    </Flex>
  )
}

export function DeductionsEditFormContextual() {
  const { employeeId, editingDeductionId, onEvent } = useFlow<DeductionsContextInterface>()
  return (
    <DeductionsEditForm
      employeeId={ensureRequired(employeeId)}
      editingDeductionId={editingDeductionId}
      onEvent={onEvent}
    />
  )
}
