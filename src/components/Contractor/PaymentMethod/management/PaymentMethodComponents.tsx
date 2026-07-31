import { useTranslation } from 'react-i18next'
import { PaymentMethodEditForm } from './PaymentMethodEditForm'
import { PaymentMethodCard } from './PaymentMethodCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type PaymentMethodSuccessAlertCode = 'bankAccountAdded' | 'bankAccountRemoved'

/** @internal */
export interface PaymentMethodContextInterface extends FlowContextInterface {
  contractorId?: string
  successAlert?: PaymentMethodSuccessAlertCode | null
}

/** @internal */
export function CardContextual() {
  const { contractorId, onEvent, successAlert, LoaderComponent } =
    useFlow<PaymentMethodContextInterface>()
  const { t } = useTranslation('Contractor.Management.PaymentMethod')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <PaymentMethodCard
        contractorId={ensureRequired(contractorId)}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </Flex>
  )
}

/** @internal */
export function PaymentMethodEditFormContextual() {
  const { contractorId, onEvent, LoaderComponent } = useFlow<PaymentMethodContextInterface>()
  return (
    <PaymentMethodEditForm
      contractorId={ensureRequired(contractorId)}
      onEvent={onEvent}
      LoaderComponent={LoaderComponent}
    />
  )
}
