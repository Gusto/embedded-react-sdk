import { useContractorPaymentGroupsGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/contractorPaymentGroupsGet'
import { useContractorsListSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/contractorsList'
import { useContractorPaymentsDeleteMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/contractorPaymentsDelete'
import { useTranslation } from 'react-i18next'
import { PaymentHistoryPresentation } from './PaymentHistoryPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link PaymentHistory}.
 *
 * @public
 */
export interface PaymentHistoryProps extends BaseComponentInterface<'Contractor.Payments.PaymentHistory'> {
  /** UUID of the contractor payment group to display. */
  paymentId: string
}

/**
 * Displays a contractor payment group, including each individual contractor payment, with actions to view details or cancel.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/payments/view/details` | A row's view-details action was triggered. | `{ contractor: Contractor \| undefined, paymentGroupId: string }` — `contractor` is `undefined` if the contractor UUID is not found in the loaded list |
 * | `contractor/payments/cancel` | An individual contractor payment was successfully canceled. | `{ paymentId: string }` — the individual contractor payment UUID, not the payment group UUID passed as `paymentId` prop |
 *
 * @param props - Component props including the payment group `paymentId` and the standard `onEvent` callback.
 * @returns The rendered payment history view for the payment group.
 * @public
 *
 * @example
 * ```tsx
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * <ContractorManagement.PaymentHistory
 *   paymentId="payment-group-uuid"
 *   onEvent={() => {}}
 * />
 * ```
 */
export function PaymentHistory(props: PaymentHistoryProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ paymentId, dictionary, onEvent }: PaymentHistoryProps) => {
  useComponentDictionary('Contractor.Payments.PaymentHistory', dictionary)
  const { t } = useTranslation('Contractor.Payments.PaymentHistory')
  const { baseSubmitHandler } = useBase()

  const { data: paymentGroupResponse } = useContractorPaymentGroupsGetSuspense({
    contractorPaymentGroupUuid: paymentId,
  })
  if (!paymentGroupResponse.contractorPaymentGroup) {
    throw new Error(t('errors.paymentGroupNotFound'))
  }

  const companyId = paymentGroupResponse.contractorPaymentGroup.companyUuid!

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = contractorList.contractors || []

  const { mutateAsync: cancelPayment, isPending: isCancelling } =
    useContractorPaymentsDeleteMutation()

  const handleViewPayment = (contractorUuid: string) => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS, {
      contractor: contractors.find(c => c.uuid === contractorUuid),
      paymentGroupId: paymentId,
    })
  }

  const handleCancelPayment = async (paymentId: string) => {
    await baseSubmitHandler(paymentId, async () => {
      await cancelPayment({
        request: {
          contractorPaymentId: paymentId,
          companyId,
        },
      })
    })

    onEvent(componentEvents.CONTRACTOR_PAYMENT_CANCEL, { paymentId })
  }

  return (
    <>
      <PaymentHistoryPresentation
        paymentGroup={paymentGroupResponse.contractorPaymentGroup}
        contractors={contractors}
        isCancelling={isCancelling}
        onViewPayment={handleViewPayment}
        onCancelPayment={handleCancelPayment}
      />
    </>
  )
}
