import { Suspense, useState } from 'react'
import { ContractorLanding } from './ContractorLanding'
import { ContractorSelfProfile } from './ContractorSelfProfile'
import { ContractorSelfAddressForm } from './ContractorSelfAddressForm'
import { ContractorSelfPaymentMethodForm } from './ContractorSelfPaymentMethodForm'
import { ContractorDocumentSigner } from './ContractorDocumentSigner'
import { ContractorOnboardingSummary } from './ContractorOnboardingSummary'
import { contractorSelfOnboardingEvents } from './events'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

type SelfOnboardingStep =
  | 'landing'
  | 'profile'
  | 'address'
  | 'paymentMethod'
  | 'documentSigner'
  | 'summary'

const STEPS_WITH_PROGRESS: SelfOnboardingStep[] = [
  'profile',
  'address',
  'paymentMethod',
  'documentSigner',
]

const STEP_NUMBER: Record<string, number> = {
  profile: 1,
  address: 2,
  paymentMethod: 3,
  documentSigner: 4,
}

function StepSkeleton() {
  return (
    <Flex flexDirection="column" gap={24}>
      <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4 }} />
      <div style={{ width: 300, height: 28, background: '#e5e7eb', borderRadius: 4 }} />
      <div style={{ width: '100%', height: 60, background: '#e5e7eb', borderRadius: 4 }} />
      <div style={{ width: '100%', height: 60, background: '#e5e7eb', borderRadius: 4 }} />
      <div style={{ width: 200, height: 40, background: '#e5e7eb', borderRadius: 4 }} />
    </Flex>
  )
}

interface ContractorSelfOnboardingWizardProps {
  contractorId: string
  companyId: string
}

export function ContractorSelfOnboardingWizard({
  contractorId,
  companyId,
}: ContractorSelfOnboardingWizardProps) {
  const Components = useComponentContext()
  const [currentStep, setCurrentStep] = useState<SelfOnboardingStep>('landing')

  const handleEvent = (...args: unknown[]) => {
    const eventType = args[0] as string
    switch (eventType) {
      case contractorSelfOnboardingEvents.CONTRACTOR_SELF_ONBOARDING_START:
        setCurrentStep('profile')
        break
      case componentEvents.CONTRACTOR_PROFILE_DONE:
        setCurrentStep('address')
        break
      case componentEvents.CONTRACTOR_ADDRESS_DONE:
        setCurrentStep('paymentMethod')
        break
      case componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE:
        setCurrentStep('documentSigner')
        break
      case contractorSelfOnboardingEvents.CONTRACTOR_DOCUMENTS_DONE:
        setCurrentStep('summary')
        break
      case contractorSelfOnboardingEvents.CONTRACTOR_SELF_ONBOARDING_DONE:
        setCurrentStep('landing')
        break
    }
  }

  const showProgress = currentStep in STEP_NUMBER
  const currentStepNumber = STEP_NUMBER[currentStep] ?? 1

  const renderStep = () => {
    switch (currentStep) {
      case 'landing':
        return (
          <ContractorLanding
            contractorId={contractorId}
            companyId={companyId}
            onEvent={handleEvent}
          />
        )
      case 'profile':
        return <ContractorSelfProfile contractorId={contractorId} onEvent={handleEvent} />
      case 'address':
        return <ContractorSelfAddressForm contractorId={contractorId} onEvent={handleEvent} />
      case 'paymentMethod':
        return <ContractorSelfPaymentMethodForm contractorId={contractorId} onEvent={handleEvent} />
      case 'documentSigner':
        return <ContractorDocumentSigner contractorId={contractorId} onEvent={handleEvent} />
      case 'summary':
        return <ContractorOnboardingSummary contractorId={contractorId} onEvent={handleEvent} />
    }
  }

  return (
    <Flex flexDirection="column" gap={32} alignItems="stretch">
      {showProgress && (
        <Components.ProgressBar
          totalSteps={STEPS_WITH_PROGRESS.length}
          currentStep={currentStepNumber}
          label={`Step ${currentStepNumber} of ${STEPS_WITH_PROGRESS.length}`}
        />
      )}
      <Suspense fallback={<StepSkeleton />}>{renderStep()}</Suspense>
    </Flex>
  )
}
