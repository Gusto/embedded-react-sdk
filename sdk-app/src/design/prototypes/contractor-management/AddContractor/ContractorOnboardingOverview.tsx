import classNames from 'classnames'
import { useContractorsGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/contractorsGetOnboardingStatus'
import type { WizardStep } from './AddContractorWizard'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import ArrowRightIcon from '@/assets/icons/icon-arrow-right.svg?react'
import SuccessCheck from '@/assets/icons/checkbox.svg?react'
import styles from '@/components/Common/RequirementsList/RequirementsList.module.scss'

interface OverviewStep {
  id: string
  title: string
  description: string
  completed: boolean
  wizardStep: WizardStep
}

const API_STEP_TO_WIZARD_STEP: Record<string, WizardStep> = {
  basic_details: 'profile',
  add_address: 'address',
  compensation_details: 'profile',
  payment_details: 'paymentMethod',
  sign_documents: 'newHireReport',
}

const STEP_META: Record<string, { title: string; description: string }> = {
  add_address: { title: 'Add address', description: "Add the contractor's mailing address." },
  payment_details: {
    title: 'Payment method',
    description: 'Set up direct deposit or check payment.',
  },
  sign_documents: {
    title: 'Submit contractor',
    description: 'Review and complete contractor onboarding.',
  },
}

function buildOverviewSteps(
  apiSteps: Array<{ id?: string; completed?: boolean; required?: boolean }>,
): OverviewStep[] {
  const basicDetails = apiSteps.find(s => s.id === 'basic_details')
  const compensation = apiSteps.find(s => s.id === 'compensation_details')
  const basicDetailsCompleted =
    (basicDetails?.completed ?? false) && (compensation?.completed ?? false)

  const steps: OverviewStep[] = []

  if (basicDetails || compensation) {
    steps.push({
      id: 'basic_details',
      title: 'Basic details',
      description: 'Add contractor name, type, and compensation.',
      completed: basicDetailsCompleted,
      wizardStep: 'profile',
    })
  }

  for (const step of apiSteps) {
    if (step.id === 'basic_details' || step.id === 'compensation_details') continue
    const wizardStep = step.id ? API_STEP_TO_WIZARD_STEP[step.id] : undefined
    if (!wizardStep) continue
    const meta = STEP_META[step.id!]
    if (!meta) continue
    steps.push({
      id: step.id!,
      title: meta.title,
      description: meta.description,
      completed: step.id === 'payment_details' ? true : (step.completed ?? false),
      wizardStep,
    })
  }

  return steps
}

function getFirstIncompleteWizardStep(steps: OverviewStep[]): WizardStep {
  for (const step of steps) {
    if (!step.completed) return step.wizardStep
  }
  return 'profile'
}

interface ContractorOnboardingOverviewProps {
  contractorId: string
  onContinue: (startStep: WizardStep) => void
}

export function ContractorOnboardingOverview({
  contractorId,
  onContinue,
}: ContractorOnboardingOverviewProps) {
  const Components = useComponentContext()

  const { data } = useContractorsGetOnboardingStatusSuspense({
    contractorUuid: contractorId,
  })

  const apiSteps = data.contractorOnboardingStatus?.onboardingSteps ?? []
  const steps = buildOverviewSteps(apiSteps)
  const isInitialSetup = !steps.some(step => step.completed)
  const firstIncompleteStep = getFirstIncompleteWizardStep(steps)

  return (
    <Components.Box
      footer={
        <ActionsLayout>
          <Components.Button
            variant="secondary"
            onClick={() => {
              onContinue(firstIncompleteStep)
            }}
          >
            {isInitialSetup ? 'Start onboarding' : 'Continue onboarding'}
            <ArrowRightIcon aria-hidden />
          </Components.Button>
        </ActionsLayout>
      }
    >
      <Flex flexDirection="column" alignItems="flex-start" gap={32}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">
            {isInitialSetup ? "Let's get started" : 'A few more details needed'}
          </Components.Heading>
          <Components.Text variant="supporting">
            {isInitialSetup
              ? 'Complete the following steps to onboard this contractor.'
              : 'Complete the remaining steps to finish contractor onboarding.'}
          </Components.Text>
        </Flex>
        {steps.length > 0 && (
          <Flex flexDirection="column" alignItems="flex-start" gap={8}>
            <Components.UnorderedList
              className={styles.list}
              items={steps.map((step, i) => (
                <div key={step.id} className={styles.listItem}>
                  {step.completed ? (
                    <div className={classNames(styles.listItemIcon, styles.success)}>
                      <SuccessCheck width={16} height={16} />
                    </div>
                  ) : (
                    <div className={styles.listItemIcon}>{i + 1}</div>
                  )}
                  <Flex flexDirection="column" gap={0}>
                    <Components.Text size="md" weight="medium">
                      {step.title}
                    </Components.Text>
                    <Components.Text variant="supporting">{step.description}</Components.Text>
                  </Flex>
                </div>
              ))}
            />
          </Flex>
        )}
      </Flex>
    </Components.Box>
  )
}
