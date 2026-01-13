import { useContractorPaymentGroupsGetSuspense } from '@gusto/embedded-api/react-query/contractorPaymentGroupsGet'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentsDeleteMutation } from '@gusto/embedded-api/react-query/contractorPaymentsDelete'
import { useTranslation } from 'react-i18next'
import { PaymentHistoryPresentation } from './PaymentHistoryPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface PaymentHistoryProps extends BaseComponentInterface<'Contractor.Payments.PaymentHistory'> {
  paymentId: string
}

export function PaymentHistory(props: PaymentHistoryProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ paymentId, dictionary, onEvent }: PaymentHistoryProps) => {
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
  const contractors = contractorList.contractorList || []

  const { mutateAsync: cancelPayment, isPending: isCancelling } =
    useContractorPaymentsDeleteMutation()

  const handleViewPayment = (contractorUuid: string) => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS, {
      contractorUuid,
      paymentGroupId: paymentId,
    })
  }

  const handleCancelPayment = async (paymentId: string) => {
    await baseSubmitHandler(paymentId, async id => {
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
