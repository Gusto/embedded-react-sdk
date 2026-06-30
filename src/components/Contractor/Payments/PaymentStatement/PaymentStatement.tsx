import { useContractorPaymentGroupsGetSuspense } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorPaymentGroupsGet'
import { useContractorsListSuspense } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorsList'
import { useContractorPaymentsGetReceipt } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorPaymentsGetReceipt'
import { GustoEmbeddedError } from '@gusto/embedded-api-v-2026-06-15/models/errors/gustoembeddederror'
import { useTranslation } from 'react-i18next'
import { PaymentStatementPresentation } from './PaymentStatementPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

/**
 * Props for {@link PaymentStatement}.
 *
 * @public
 */
export interface PaymentStatementProps extends BaseComponentInterface<'Contractor.Payments.PaymentStatement'> {
  /** UUID of the contractor payment group the statement belongs to. */
  paymentGroupId: string
  /** UUID of the contractor whose payment within the group is being displayed. */
  contractorUuid: string
}

/**
 * Displays a single contractor's payment statement within a payment group, including wage breakdown, bonuses, reimbursements, and a receipt card for funded direct-deposit payments.
 *
 * @param props - See {@link PaymentStatementProps}.
 * @returns The rendered payment statement.
 * @public
 */
export function PaymentStatement(props: PaymentStatementProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ paymentGroupId, contractorUuid, dictionary }: PaymentStatementProps) => {
  useComponentDictionary('Contractor.Payments.PaymentStatement', dictionary)
  const { t } = useTranslation('Contractor.Payments.PaymentStatement')
  // Fetching entire payment
  const { data: paymentGroupResponse } = useContractorPaymentGroupsGetSuspense({
    contractorPaymentGroupUuid: paymentGroupId,
  })

  if (!paymentGroupResponse.contractorPaymentGroup) {
    throw new Error(t('errors.paymentGroupNotFound'))
  }

  const companyId = paymentGroupResponse.contractorPaymentGroup.companyUuid!
  // Fetching all contractors for the company
  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = contractorList.contractors || []
  // Locating the payment for the selectedcontractor
  const payment = paymentGroupResponse.contractorPaymentGroup.contractorPayments?.find(
    p => p.contractorUuid === contractorUuid,
  )

  if (!payment) {
    throw new Error(t('errors.paymentNotFound'))
  }
  // Attempting to fetch the payment receipt
  // Note: 404 is expected for receipts that aren't available (e.g., non-direct deposit or not yet funded)
  const { data: paymentResponse } = useContractorPaymentsGetReceipt(
    {
      contractorPaymentUuid: payment.uuid!,
    },
    {
      retry: false,
      throwOnError: (error: Error) => {
        // Ignore 404 errors (receipt not available), but throw other errors
        if (error instanceof GustoEmbeddedError && error.httpMeta.response.status === 404) {
          return false
        }
        return true
      },
    },
  )
  const contractor = contractors.find(c => c.uuid === contractorUuid)
  if (!contractor) {
    throw new Error(t('errors.contractorNotFound'))
  }

  return (
    <PaymentStatementPresentation
      payment={payment}
      contractor={contractor}
      paymentReceipt={paymentResponse?.contractorPaymentReceipt}
      checkDate={paymentGroupResponse.contractorPaymentGroup.checkDate || ''}
    />
  )
}
