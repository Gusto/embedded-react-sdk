import { useContractorsGet } from '@gusto/embedded-api-v-2026-02-01/react-query/contractorsGet'
import { ContractorType } from './shared/useContractorDetailsForm'
import { IndividualSelfOnboardingProfile } from './IndividualSelfOnboardingProfile'
import { BusinessSelfOnboardingProfile } from './BusinessSelfOnboardingProfile'
import { BaseLayout } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { useI18n } from '@/i18n'
import type { EventType } from '@/shared/constants'

/**
 * Props shared by the contractor self-onboarding profile components.
 *
 * @internal
 */
export interface ContractorSelfOnboardingProfileProps {
  /** UUID of the existing contractor completing self-onboarding. */
  contractorId: string
  /** Callback invoked when the component emits an event. */
  onEvent: OnEventType<EventType, unknown>
  /** Optional class name applied to the root element. */
  className?: string
}

/**
 * Resolves the contractor's type and renders the matching self-onboarding
 * profile — individual or business.
 *
 * @internal
 */
export function SelfOnboardingContractorProfile({
  contractorId,
  onEvent,
  className,
}: ContractorSelfOnboardingProfileProps) {
  useI18n('Contractor.Profile')

  const contractorQuery = useContractorsGet({ contractorUuid: contractorId })
  const contractor = contractorQuery.data?.contractor

  if (contractorQuery.isLoading || !contractor) {
    const errorHandling = composeErrorHandler([contractorQuery])
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  return contractor.type === ContractorType.Business ? (
    <BusinessSelfOnboardingProfile
      contractorId={contractorId}
      onEvent={onEvent}
      className={className}
    />
  ) : (
    <IndividualSelfOnboardingProfile
      contractorId={contractorId}
      onEvent={onEvent}
      className={className}
    />
  )
}
