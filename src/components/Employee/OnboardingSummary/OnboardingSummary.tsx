import { useTranslation } from 'react-i18next'
import { useEmployeesGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesGet'
import { useEmployeesGetOnboardingStatusSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesGetOnboardingStatus'
import DOMPurify from 'dompurify'
import { useMemo } from 'react'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { RequirementsList } from '@/components/Common/RequirementsList/RequirementsList'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import { useFlow } from '@/components/Flow/useFlow'
import { useComponentDictionary } from '@/i18n/I18n'

const KNOWN_STEP_IDS = [
  'personal_details',
  'compensation_details',
  'add_work_address',
  'add_home_address',
  'federal_tax_setup',
  'state_tax_setup',
  'direct_deposit_setup',
  'employee_form_signing',
  'file_new_hire_report',
  'admin_review',
] as const

type KnownStepId = (typeof KNOWN_STEP_IDS)[number]

const isKnownStepId = (id: string | undefined): id is KnownStepId =>
  id !== undefined && (KNOWN_STEP_IDS as readonly string[]).includes(id)

/**
 * Props for {@link OnboardingSummary}.
 *
 * @public
 */
export interface OnboardingSummaryProps extends BaseComponentInterface<'Employee.OnboardingSummary'> {
  /** The associated employee identifier. */
  employeeId: string
  /** When `true`, renders the admin-facing view of the onboarding summary. Defaults to `false`. */
  isAdmin?: boolean
}

/**
 * Displays a summary of an employee's onboarding status, listing completed and
 * outstanding steps. Rendered as a standalone step inside `OnboardingFlow`.
 *
 * @public
 */
export function OnboardingSummary(props: OnboardingSummaryProps) {
  useI18n('Employee.OnboardingSummary')
  useComponentDictionary('Employee.OnboardingSummary', props.dictionary)

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, className, isAdmin = false }: OnboardingSummaryProps) => {
  const { onEvent } = useBase()
  const { t } = useTranslation('Employee.OnboardingSummary')
  const Components = useComponentContext()

  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })
  const { firstName, lastName } = employee!

  const { data } = useEmployeesGetOnboardingStatusSuspense({ employeeId })
  const { onboardingStatus, onboardingSteps } = data.employeeOnboardingStatus!

  const hasMissingRequirements =
    onboardingSteps?.length &&
    onboardingSteps.findIndex(step => step.required && !step.completed) > -1

  const isOnboardingCompleted =
    onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
    (!hasMissingRequirements &&
      onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE)

  const sanitizedFirstName = useMemo(() => DOMPurify.sanitize(firstName), [firstName])
  const sanitizedLastName = useMemo(() => DOMPurify.sanitize(lastName), [lastName])

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={20}>
        <Flex alignItems="center" flexDirection="column" gap={8}>
          {isAdmin ? (
            isOnboardingCompleted ? (
              <Flex flexDirection="column" gap={4} alignItems="center">
                <Components.Heading as="h2" textAlign="center">
                  {t('onboardedAdminSubtitle', {
                    name: `${sanitizedFirstName} ${sanitizedLastName}`,
                    interpolation: { escapeValue: false },
                  })}
                </Components.Heading>
                <Components.Text variant="supporting">
                  {t('onboardedAdminDescription')}
                </Components.Text>
              </Flex>
            ) : (
              <Components.Box
                header={
                  <Flex flexDirection="column" gap={4}>
                    <Components.Heading as="h2">
                      {t('missingRequirementsSubtitle')}
                    </Components.Heading>
                    <Components.Text variant="supporting">
                      {t('missingRequirementsDescription')}
                    </Components.Text>
                  </Flex>
                }
                footer={
                  <ActionsLayout>
                    <Components.Button
                      variant="secondary"
                      onClick={() => {
                        onEvent(componentEvents.EMPLOYEES_LIST)
                      }}
                    >
                      {t('doneCta')}
                    </Components.Button>
                  </ActionsLayout>
                }
              >
                {onboardingSteps && (
                  <RequirementsList
                    requirements={onboardingSteps
                      .filter(
                        (step): step is typeof step & { id: KnownStepId; completed: boolean } =>
                          step.completed !== undefined && isKnownStepId(step.id),
                      )
                      .map(step => ({
                        completed: step.completed,
                        title: t(`steps.${step.id}`),
                        description: t(`stepsDescriptions.${step.id}`),
                      }))}
                  />
                )}
              </Components.Box>
            )
          ) : (
            <>
              <Flex flexDirection="column" gap={20} alignItems="center">
                <Flex flexDirection="column" gap={4} alignItems="center">
                  <Components.Heading as="h2" textAlign="center">
                    {t('onboardedSelfSubtitle')}
                  </Components.Heading>
                  <Components.Text variant="supporting">
                    {t('onboardedSelfDescription')}
                  </Components.Text>
                </Flex>
                <ActionsLayout justifyContent={isOnboardingCompleted ? 'center' : 'start'}>
                  <Components.Button
                    variant="secondary"
                    onClick={() => {
                      onEvent(componentEvents.EMPLOYEE_ONBOARDING_DONE)
                    }}
                  >
                    {t('doneCta')}
                  </Components.Button>
                </ActionsLayout>
              </Flex>
            </>
          )}
        </Flex>

        {isAdmin && isOnboardingCompleted && (
          <ActionsLayout justifyContent={'center'}>
            <Components.Button
              variant="secondary"
              onClick={() => {
                onEvent(componentEvents.EMPLOYEES_LIST)
              }}
            >
              {t('doneCta')}
            </Components.Button>
          </ActionsLayout>
        )}
      </Flex>
    </section>
  )
}

/** @internal */
export const OnboardingSummaryContextual = () => {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'Summary',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <OnboardingSummary employeeId={employeeId} onEvent={onEvent} isAdmin={isAdmin} />
}
