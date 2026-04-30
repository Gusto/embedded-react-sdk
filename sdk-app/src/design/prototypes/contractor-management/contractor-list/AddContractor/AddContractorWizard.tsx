import { Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '../../contractor-profile/components/Skeleton'
import { ContractorProfile } from './ContractorProfile'
import { ContractorAddress } from './ContractorAddress'
import { ContractorPaymentMethod } from './ContractorPaymentMethod'
import { ContractorNewHireReport } from './ContractorNewHireReport'
import { ContractorSubmit } from './ContractorSubmit'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

export type WizardStep = 'profile' | 'address' | 'paymentMethod' | 'newHireReport' | 'submit'

const STEP_CONFIG = {
  full: {
    totalSteps: 5,
    stepMap: { profile: 1, address: 2, paymentMethod: 3, newHireReport: 4, submit: 5 } as Record<
      WizardStep,
      number
    >,
  },
  selfOnboarding: {
    totalSteps: 3,
    stepMap: { profile: 1, address: 2, paymentMethod: 2, newHireReport: 2, submit: 3 } as Record<
      WizardStep,
      number
    >,
  },
}

function StepSkeleton() {
  return (
    <Flex flexDirection="column" gap={24}>
      <Skeleton width={300} height={28} />
      <Skeleton width="100%" height={60} />
      <Skeleton width="100%" height={60} />
      <Skeleton width={200} height={40} />
    </Flex>
  )
}

interface AddContractorWizardProps {
  companyId: string
  contractorId?: string
  initialStep?: WizardStep
}

export function AddContractorWizard({
  companyId,
  contractorId: initialContractorId,
  initialStep = 'profile',
}: AddContractorWizardProps) {
  const Components = useComponentContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep)
  const [contractorId, setContractorId] = useState<string | null>(initialContractorId ?? null)
  const [selfOnboarding, setSelfOnboarding] = useState(false)

  const config = selfOnboarding ? STEP_CONFIG.selfOnboarding : STEP_CONFIG.full
  const currentStepNumber = config.stepMap[currentStep]

  const handleEvent = (eventType: string, data?: unknown) => {
    switch (eventType) {
      case componentEvents.CONTRACTOR_PROFILE_DONE: {
        const payload = data as { contractorId: string; selfOnboarding: boolean }
        setContractorId(payload.contractorId)
        setSelfOnboarding(payload.selfOnboarding)
        setCurrentStep(payload.selfOnboarding ? 'newHireReport' : 'address')
        break
      }
      case componentEvents.CONTRACTOR_ADDRESS_DONE:
        setCurrentStep('paymentMethod')
        break
      case componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE:
        setCurrentStep('newHireReport')
        break
      case componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE:
        setCurrentStep('submit')
        break
      case componentEvents.CONTRACTOR_SUBMIT_DONE: {
        const payload = data as { message?: string } | undefined
        const message = payload?.message ?? 'Contractor added successfully'
        queryClient.removeQueries({ queryKey: ['@gusto/embedded-api', 'Contractors'] })
        void navigate(`..?success=${encodeURIComponent(message)}`, { replace: true })
        break
      }
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'profile':
        return (
          <ContractorProfile
            companyId={companyId}
            contractorId={contractorId ?? undefined}
            onEvent={handleEvent}
          />
        )
      case 'address':
        return <ContractorAddress contractorId={contractorId!} onEvent={handleEvent} />
      case 'paymentMethod':
        return <ContractorPaymentMethod contractorId={contractorId!} onEvent={handleEvent} />
      case 'newHireReport':
        return (
          <ContractorNewHireReport
            contractorId={contractorId!}
            selfOnboarding={selfOnboarding}
            onEvent={handleEvent}
          />
        )
      case 'submit':
        return (
          <ContractorSubmit
            contractorId={contractorId!}
            selfOnboarding={selfOnboarding}
            onEvent={handleEvent}
          />
        )
    }
  }

  return (
    <Flex flexDirection="column" gap={32}>
      <Components.ProgressBar
        totalSteps={config.totalSteps}
        currentStep={currentStepNumber}
        label={`Step ${currentStepNumber} of ${config.totalSteps}`}
      />
      <Suspense fallback={<StepSkeleton />}>{renderStep()}</Suspense>
    </Flex>
  )
}
