import { useTranslation } from 'react-i18next'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorPaymentsGetReceipt } from '@gusto/embedded-api/react-query/contractorPaymentsGetReceipt'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import type { ContractorPaymentHistoryEntry } from '../../shared/useContractorPaymentsList'
import { PaymentStatementPresentation } from '../../PaymentStatement/PaymentStatementPresentation'
import { BaseBoundaries } from '@/components/Base/Base'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link PaymentStatementView}.
 *
 * @internal
 */
export interface PaymentStatementViewProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** The payment history entry to render a statement for. */
  payment: ContractorPaymentHistoryEntry
  /** Event handler fired when the user dismisses the statement. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Payment statement for a single payment reached from the contractor dashboard's
 * recent payments card.
 *
 * @remarks
 * Renders {@link PaymentStatementPresentation} from a payment history entry. Unlike
 * `ContractorManagement.PaymentStatement`, this needs no payment group: the history entry
 * already carries the wage breakdown, and the receipt is keyed by the payment UUID alone.
 * Internal to the dashboard flow — it takes the entry rather than an ID because the card
 * that routes here already holds it.
 *
 * @param props - See {@link PaymentStatementViewProps}.
 * @returns The rendered payment statement with a back action.
 * @internal
 */
export function PaymentStatementView({ LoaderComponent, ...props }: PaymentStatementViewProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Management.Payments"
      LoaderComponent={LoaderComponent}
    >
      <PaymentStatementViewContent {...props} />
    </BaseBoundaries>
  )
}

function PaymentStatementViewContent({
  contractorId,
  payment,
  onEvent,
}: Omit<PaymentStatementViewProps, 'LoaderComponent'>) {
  useI18n('Contractor.Management.Payments')
  const { t } = useTranslation('Contractor.Management.Payments')
  const Components = useComponentContext()

  const { data: contractorResponse } = useContractorsGetSuspense({ contractorUuid: contractorId })

  // 404 is expected when no receipt exists (not direct deposit, or not yet funded).
  const { data: receiptResponse } = useContractorPaymentsGetReceipt(
    { contractorPaymentUuid: payment.uuid },
    {
      retry: false,
      throwOnError: (error: Error) => {
        if (error instanceof GustoEmbeddedError && error.httpMeta.response.status === 404) {
          return false
        }
        return true
      },
    },
  )

  const contractor = contractorResponse.contractorShow
  if (!contractor) {
    throw new Error(t('errors.contractorNotFound'))
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <PaymentStatementPresentation
        payment={payment}
        contractor={contractor}
        paymentReceipt={receiptResponse?.contractorPaymentReceipt}
        checkDate={payment.checkDate?.toString() ?? ''}
      />
      <ActionsLayout>
        <Components.Button
          variant="secondary"
          onClick={() => {
            onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PAYMENTS_STATEMENT_CLOSED, {
              contractorId,
              payment,
            })
          }}
        >
          {t('backCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
