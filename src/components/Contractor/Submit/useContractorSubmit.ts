import { useTranslation } from 'react-i18next'
import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/contractorsUpdateOnboardingStatus'
import { useContractorsGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/contractorsGetOnboardingStatus'
import { useBase } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { type EventType, componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { useI18n } from '@/i18n'

export interface UseContractorSubmitProps {
  contractorId: string
  selfOnboarding?: boolean
  onEvent?: OnEventType<EventType, unknown>
}

export function useContractorSubmit({ contractorId, selfOnboarding }: UseContractorSubmitProps) {
  useI18n('Contractor.Submit')
  const { t } = useTranslation('Contractor.Submit')
  const { onEvent, baseSubmitHandler } = useBase()

  const warningItems = Object.values(t('warningItems', { returnObjects: true }))

  const { data } = useContractorsGetOnboardingStatusSuspense({
    contractorUuid: contractorId,
  })
  const onboardingStatus = data.contractorOnboardingStatus?.onboardingStatus

  const { mutateAsync, isPending } = useContractorsUpdateOnboardingStatusMutation()

  const onSubmit = async () => {
    await baseSubmitHandler(null, async () => {
      const response = await mutateAsync({
        request: {
          contractorUuid: contractorId,
          requestBody: { onboardingStatus: ContractorOnboardingStatus.ONBOARDING_COMPLETED },
        },
      })
      onEvent(
        componentEvents.CONTRACTOR_ONBOARDING_STATUS_UPDATED,
        response.contractorOnboardingStatus,
      )
      onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE, { message: t('submitDone.successMessage') })
    })
  }

  const handleInviteContractor = () => {
    onEvent(componentEvents.CONTRACTOR_INVITE_CONTRACTOR, { contractorId })
    onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE, {
      message: t('inviteContractor.successMessage'),
    })
  }

  const handleSubmitDone = () => {
    onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE, {
      onboardingStatus,
      message: t('submitDone.successMessage'),
    })
  }

  return {
    data: {
      onboardingStatus,
      warningItems,
    },
    actions: {
      onSubmit,
      handleInviteContractor,
      handleSubmitDone,
    },
    meta: {
      isPending,
    },
  }
}
