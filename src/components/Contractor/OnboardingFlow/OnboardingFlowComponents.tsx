import { useTranslation } from 'react-i18next'
import { ContractorList } from '../ContractorList'
import { ContractorProfile } from '../Profile'
import { Address } from '../Address'
import { PaymentMethod } from '../PaymentMethod/PaymentMethod'
import { NewHireReport } from '../NewHireReport/NewHireReport'
import { ContractorSubmit } from '../Submit/Submit'
import type { ContractorDetailsFormData } from '../Profile/shared'
import type { AddressDefaultValues } from '../Address/useAddress'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { RequireAtLeastOne } from '@/types/Helpers'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/**
 * Default pre-fill values for the contractor onboarding flow.
 * At least one of `profile` or `address` must be provided.
 *
 * @public
 */
export type OnboardingFlowDefaultValues = RequireAtLeastOne<{
  profile?: Partial<ContractorDetailsFormData>
  address?: AddressDefaultValues
}>
/**
 * Props for {@link OnboardingFlow}.
 *
 * @public
 */
export interface OnboardingFlowProps extends BaseComponentInterface {
  /** The associated company identifier. */
  companyId: string
  /** Default values for individual flow step components — `profile` and/or `address` sub-objects. */
  defaultValues?: RequireAtLeastOne<OnboardingFlowDefaultValues>
}
/** @internal */
export interface OnboardingFlowContextInterface extends FlowContextInterface {
  /** The associated company identifier. */
  companyId: string
  /** The contractor currently being onboarded; populated once the profile step creates or selects one. */
  contractorId?: string
  /** Default values for individual flow step components. */
  defaultValues?: OnboardingFlowDefaultValues
  /** True when the contractor will be self-onboarding; switches the flow to the shorter self-onboarding path. */
  selfOnboarding?: boolean
  /** Success message to display on the contractor list when returning from a completed sub-flow. */
  successMessage?: string
}

/** @internal */
export function ContractorListContextual() {
  const { companyId, onEvent, successMessage } = useFlow<OnboardingFlowContextInterface>()
  return (
    <ContractorList
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      successMessage={successMessage}
    />
  )
}

/** @internal */
export function ProfileContextual() {
  const { companyId, onEvent, contractorId, defaultValues } =
    useFlow<OnboardingFlowContextInterface>()
  return (
    <ContractorProfile
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      contractorId={contractorId}
      defaultValues={defaultValues?.profile}
    />
  )
}

/** @internal */
export function AddressContextual() {
  const { onEvent, contractorId, defaultValues } = useFlow<OnboardingFlowContextInterface>()
  return (
    <Address
      onEvent={onEvent}
      contractorId={ensureRequired(contractorId)}
      defaultValues={defaultValues?.address}
    />
  )
}
/** @internal */
export function PaymentMethodContextual() {
  const { onEvent, contractorId } = useFlow<OnboardingFlowContextInterface>()
  return <PaymentMethod onEvent={onEvent} contractorId={ensureRequired(contractorId)} />
}
/** @internal */
export function NewHireReportContextual() {
  const { onEvent, contractorId, selfOnboarding } = useFlow<OnboardingFlowContextInterface>()
  return (
    <NewHireReport
      onEvent={onEvent}
      contractorId={ensureRequired(contractorId)}
      selfOnboarding={selfOnboarding}
    />
  )
}
/** @internal */
export function SubmitContextual() {
  const { onEvent, contractorId, selfOnboarding } = useFlow<OnboardingFlowContextInterface>()
  return (
    <ContractorSubmit
      onEvent={onEvent}
      contractorId={ensureRequired(contractorId)}
      selfOnboarding={selfOnboarding}
    />
  )
}

/** @internal */
export function ProgressBarCta() {
  const { onEvent } = useFlow<OnboardingFlowContextInterface>()
  const { Button } = useComponentContext()
  useI18n('Contractor.ContractorList')
  const { t } = useTranslation('Contractor.ContractorList')
  return (
    <Button
      onClick={() => {
        onEvent(componentEvents.CANCEL)
      }}
      variant="secondary"
    >
      {t('progressBarCta')}
    </Button>
  )
}
