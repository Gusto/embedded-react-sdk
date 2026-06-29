import { useTranslation } from 'react-i18next'
import { PaymentMethodBankForm } from './PaymentMethodBankForm'
import { PaymentMethodSplitForm } from './PaymentMethodSplitForm'
import { PaymentMethodCard } from './PaymentMethodCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents } from '@/shared/constants'

/** @internal */
export type PaymentMethodSuccessAlertCode =
  'bankAccountAdded' | 'bankAccountDeleted' | 'splitUpdated'

/** @internal */
export interface PaymentMethodContextInterface extends FlowContextInterface {
  employeeId: string
  isAdmin: boolean
  successAlert?: PaymentMethodSuccessAlertCode | null
}

/** @internal */
export function PaymentMethodCardContextual() {
  const { employeeId, onEvent, successAlert } = useFlow<PaymentMethodContextInterface>()
  const { t } = useTranslation('Employee.Management.PaymentMethod')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <PaymentMethodCard employeeId={employeeId} onEvent={onEvent} />
    </Flex>
  )
}

/** @internal */
export function PaymentMethodBankFormContextual() {
  const { employeeId, onEvent } = useFlow<PaymentMethodContextInterface>()
  return <PaymentMethodBankForm employeeId={employeeId} onEvent={onEvent} />
}

/** @internal */
export function PaymentMethodSplitFormContextual() {
  const { employeeId, onEvent } = useFlow<PaymentMethodContextInterface>()
  return <PaymentMethodSplitForm employeeId={employeeId} onEvent={onEvent} />
}
