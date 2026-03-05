import { useContractorPaymentGroupsGetSuspense } from '@gusto/embedded-api/react-query/contractorPaymentGroupsGet'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useBankAccountsGet } from '@gusto/embedded-api/react-query/bankAccountsGet'
import type { PayrollCreditBlockerType } from '@gusto/embedded-api/models/components/payrollcreditblockertype'
import type { InternalAlert } from '../types'
import { PaymentSummaryPresentation } from './PaymentSummaryPresentation'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'

interface PaymentSummaryProps {
  paymentGroupId: string
  companyId: string
  onEvent: (type: EventType, data?: unknown) => void
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
  const contractors = (contractorList.contractorList || []).filter(
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
