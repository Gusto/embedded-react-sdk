import type { ContractorOnboardingStatus1 } from '@gusto/embedded-api/models/components/contractor'
import type { OnboardingStatus } from '@gusto/embedded-api/models/components/employee'
import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface OnboardingStatusBadgeProps {
  onboarded?: boolean
  onboardingStatus?: ContractorOnboardingStatus1 | OnboardingStatus
}

export function OnboardingStatusBadge({ onboarded, onboardingStatus }: OnboardingStatusBadgeProps) {
  const { Badge } = useComponentContext()
  const { t } = useTranslation('common')

  return (
    <Badge status={onboarded ? 'success' : 'warning'}>
      {t(`onboardingStatus.${onboardingStatus ?? 'undefined'}`)}
    </Badge>
  )
}
