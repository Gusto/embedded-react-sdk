import { useContractorPaymentGroupsGetSuspense } from '@gusto/embedded-api/react-query/contractorPaymentGroupsGet'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { HistoricalPaymentSuccessPresentation } from './HistoricalPaymentSuccessPresentation'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'

interface HistoricalPaymentSuccessProps {
  paymentGroupId: string
  companyId: string
  onEvent: (type: EventType, data?: unknown) => void
}

export const HistoricalPaymentSuccess = ({
  paymentGroupId,
  companyId,
  onEvent,
}: HistoricalPaymentSuccessProps) => {
  useI18n('Contractor.Payments.HistoricalPayments.CreateHistoricalPayment')

  const { data: paymentGroupData } = useContractorPaymentGroupsGetSuspense({
    contractorPaymentGroupUuid: paymentGroupId,
  })
  const contractorPaymentGroup = paymentGroupData.contractorPaymentGroup

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractors || []).filter(
    contractor => contractor.isActive && contractor.onboardingStatus === 'onboarding_completed',
  )

  if (!contractorPaymentGroup) {
    return null
  }

  const handleDone = () => {
    onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT)
  }

  return (
    <HistoricalPaymentSuccessPresentation
      contractorPaymentGroup={contractorPaymentGroup}
      contractors={contractors}
      onDone={handleDone}
    />
  )
}
