import { useCompaniesGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/companiesGetOnboardingStatus'
import { useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface UseCompanyOnboardingOverviewProps {
  companyId: string
}

export function useCompanyOnboardingOverview({ companyId }: UseCompanyOnboardingOverviewProps) {
  const { onEvent } = useBase()

  const { data } = useCompaniesGetOnboardingStatusSuspense({ companyUuid: companyId })
  const { onboardingCompleted, onboardingSteps } = data.companyOnboardingStatus!

  const handleDone = () => {
    onEvent(componentEvents.COMPANY_OVERVIEW_DONE)
  }
  const handleContinue = () => {
    onEvent(componentEvents.COMPANY_OVERVIEW_CONTINUE)
  }

  return {
    data: {
      onboardingCompleted,
      onboardingSteps,
    },
    actions: {
      handleDone,
      handleContinue,
    },
    meta: {},
  }
}
