import { useTranslation } from 'react-i18next'
import { ContractorList } from '../ContractorList'
import { ContractorProfile } from '../Profile'
import { Address } from '../Address'
import { PaymentMethod } from '../PaymentMethod/PaymentMethod'
import { NewHireReport } from '../NewHireReport/NewHireReport'
import { ContractorSubmit } from '../Submit/Submit'
import type { UseContractorProfileProps } from '../Profile/useContractorProfile'
import type { AddressDefaultValues } from '../Address/useAddress'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { RequireAtLeastOne } from '@/types/Helpers'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export type OnboardingFlowDefaultValues = RequireAtLeastOne<{
  profile?: UseContractorProfileProps['defaultValues']
  address?: AddressDefaultValues
}>
export interface OnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: RequireAtLeastOne<OnboardingFlowDefaultValues>
}
export interface OnboardingFlowContextInterface extends FlowContextInterface {
  companyId: string
  contractorId?: string
  defaultValues?: OnboardingFlowDefaultValues
  selfOnboarding?: boolean
  successMessage?: string
}

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
export function PaymentMethodContextual() {
  const { onEvent, contractorId } = useFlow<OnboardingFlowContextInterface>()
  return <PaymentMethod onEvent={onEvent} contractorId={ensureRequired(contractorId)} />
}
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
