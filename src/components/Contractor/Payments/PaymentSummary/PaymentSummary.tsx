import { useContractorPaymentGroupsGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentGroupsGet'
import { useContractorsListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsList'
import { useBankAccountsGet } from '@gusto/embedded-api-v-2025-11-15/react-query/bankAccountsGet'
import type { PayrollCreditBlockerType } from '@gusto/embedded-api-v-2025-11-15/models/components/payrollcreditblockertype'
import type { InternalAlert } from '../types'
import { PaymentSummaryPresentation } from './PaymentSummaryPresentation'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'

/**
 * Props for {@link PaymentSummary}.
 *
 * @public
 */
export interface PaymentSummaryProps {
  /** UUID of the contractor payment group to summarize. */
  paymentGroupId: string
  /** UUID of the company that owns the payment group. */
  companyId: string
  /** Callback invoked when a flow event occurs, e.g. when the user exits. */
  onEvent: (type: EventType, data?: unknown) => void
  /**
   * @internal
   * Flow-injected alerts (e.g. wire-transfer confirmation).
   */
  alerts?: InternalAlert[]
}

const findWireInRequestUuid = (
  creditBlockers: PayrollCreditBlockerType[] = [],
): string | undefined => {
  const unresolvedCreditBlocker = creditBlockers.find(blocker => blocker.status === 'unresolved')

  if (!unresolvedCreditBlocker?.unblockOptions) {
    return undefined
  }

  const wireUnblockOption = unresolvedCreditBlocker.unblockOptions.find(
    option => option.unblockType === 'submit_wire',
  )

  if (wireUnblockOption && 'metadata' in wireUnblockOption) {
    return wireUnblockOption.metadata.wireInRequestUuid
  }

  return undefined
}

/**
 * Displays a summary of a created contractor payment group, including payment totals, debit information, contractor details, and wire transfer instructions when required.
 *
 * @remarks
 * Features:
 *
 * - **Success confirmation** — confirms the number of payments scheduled.
 * - **Payment summary** — total amount, debit amount, debit account, debit date, and contractor pay date, plus a per-contractor breakdown.
 * - **Debit account** — shows the company bank account used for the debit.
 * - **Wire transfer confirmation** — when a wire is required, surfaces the wire-details confirmation workflow.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/payments/exit` | User completes the payment flow. | — |
 *
 * @param props - Component props.
 * @returns The rendered payment summary, or `null` when the payment group cannot be loaded.
 * @public
 */
export const PaymentSummary = ({
  paymentGroupId,
  companyId,
  onEvent,
  alerts,
}: PaymentSummaryProps) => {
  useI18n('Contractor.Payments.PaymentSummary')

  const { data: paymentGroupData } = useContractorPaymentGroupsGetSuspense({
    contractorPaymentGroupUuid: paymentGroupId,
  })
  const contractorPaymentGroup = paymentGroupData.contractorPaymentGroup

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractors || []).filter(
    contractor => contractor.isActive && contractor.onboardingStatus === 'onboarding_completed',
  )

  const { data: bankAccounts } = useBankAccountsGet({ companyId })
  const bankAccount = bankAccounts?.companyBankAccounts?.[0]

  if (!contractorPaymentGroup) {
    return null
  }

  const wireInRequestUuid = findWireInRequestUuid(contractorPaymentGroup.creditBlockers || [])

  const handleDone = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_EXIT)
  }

  return (
    <PaymentSummaryPresentation
      contractorPaymentGroup={contractorPaymentGroup}
      contractors={contractors}
      bankAccount={bankAccount}
      wireInRequestUuid={wireInRequestUuid}
      onDone={handleDone}
      onEvent={onEvent}
      companyId={companyId}
      alerts={alerts}
    />
  )
}
