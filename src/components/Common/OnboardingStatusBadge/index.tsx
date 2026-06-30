import type { OnboardingStatus as ContractorOnboardingStatus } from '@gusto/embedded-api-v-2026-06-15/models/components/contractor'
import type { EmployeeOnboardingStatus1 as EmployeeOnboardingStatus } from '@gusto/embedded-api-v-2026-06-15/models/components/employee'
import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type OnboardingStatuses = ContractorOnboardingStatus | EmployeeOnboardingStatus

interface OnboardingStatusBadgeProps<T extends OnboardingStatuses> {
  onboarded?: boolean
  onboardingEntity: 'contractor' | 'employee'
  onboardingStatus?: T | null
}
/** @internal */
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
  onboardingStatus?: ContractorOnboardingStatus | null
}
/** @internal */
export const ContractorOnboardingStatusBadge = (props: ContractorOnboardingStatusBadgeProps) => (
  <OnboardingStatusBadge {...props} onboardingEntity="contractor" />
)

interface EmployeeOnboardingStatusBadgeProps {
  onboarded?: boolean
  onboardingStatus?: EmployeeOnboardingStatus | null
}
/** @internal */
export const EmployeeOnboardingStatusBadge = (props: EmployeeOnboardingStatusBadgeProps) => (
  <OnboardingStatusBadge {...props} onboardingEntity="employee" />
)
