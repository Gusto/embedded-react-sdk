import type { ContractorOnboardingStatus1 } from '@gusto/embedded-api/models/components/contractor'
import type { OnboardingStatus } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type OnboardingStatuses = ContractorOnboardingStatus1 | OnboardingStatus

interface OnboardingStatusBadgeProps<T extends OnboardingStatuses> {
  onboarded?: boolean
  onboardingEntity: 'contractor' | 'employee'
  onboardingStatus?: T | null
}
export const OnboardingStatusBadge = <T extends OnboardingStatuses>({
  onboarded,
  onboardingEntity,
  onboardingStatus,
}: OnboardingStatusBadgeProps<T>) => {
  const { Badge } = useComponentContext()
  const { t } = useTranslation()

  //HACK: `never` should instead be a better type
  return (
    <Badge status={onboarded ? 'success' : 'warning'}>
      {t(`onboardingStatus.${onboardingEntity}.${onboardingStatus ?? 'undefined'}` as never)}
    </Badge>
  )
}

interface ContractorOnboardingStatusBadgeProps {
  onboarded?: boolean
  onboardingStatus?: ContractorOnboardingStatus1 | null
}
export const ContractorOnboardingStatusBadge = (props: ContractorOnboardingStatusBadgeProps) => (
  <OnboardingStatusBadge {...props} onboardingEntity="contractor" />
)

interface EmployeeOnboardingStatusBadgeProps {
  onboarded?: boolean
  onboardingStatus?: OnboardingStatus | null
}
export const EmployeeOnboardingStatusBadge = (props: EmployeeOnboardingStatusBadgeProps) => (
  <OnboardingStatusBadge {...props} onboardingEntity="employee" />
)
