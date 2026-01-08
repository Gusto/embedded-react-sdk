import { useContractorPaymentGroupsGetSuspense } from '@gusto/embedded-api/react-query/contractorPaymentGroupsGet'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useTranslation } from 'react-i18next'
import { PaymentStatementPresentation } from './PaymentStatementPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

interface PaymentStatementProps extends BaseComponentInterface<'Contractor.Payments.PaymentStatement'> {
  paymentGroupId: string
  contractorUuid: string
}

export function PaymentStatement(props: PaymentStatementProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ paymentGroupId, contractorUuid, dictionary }: PaymentStatementProps) => {
  useComponentDictionary('Contractor.Payments.PaymentStatement', dictionary)
  const { t } = useTranslation('Contractor.Payments.PaymentStatement')

  const { data: paymentGroupResponse } = useContractorPaymentGroupsGetSuspense({
    contractorPaymentGroupUuid: paymentGroupId,
  })

  if (!paymentGroupResponse.contractorPaymentGroup) {
    throw new Error(t('errors.paymentGroupNotFound'))
  }

  const companyId = paymentGroupResponse.contractorPaymentGroup.companyUuid!

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = contractorList.contractorList || []

  const payment = paymentGroupResponse.contractorPaymentGroup.contractorPayments?.find(
    p => p.contractorUuid === contractorUuid,
  )

  if (!payment) {
    throw new Error(t('errors.paymentNotFound'))
  }

  const contractor = contractors.find(c => c.uuid === contractorUuid)
  if (!contractor) {
    throw new Error(t('errors.contractorNotFound'))
  }

  return (
    <PaymentStatementPresentation
      payment={payment}
      contractor={contractor}
      checkDate={paymentGroupResponse.contractorPaymentGroup.checkDate || ''}
    />
  )
}
