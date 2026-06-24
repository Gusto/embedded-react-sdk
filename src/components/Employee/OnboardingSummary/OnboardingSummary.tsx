import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useEmployeesGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGet'
import { useEmployeesGetOnboardingStatusSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGetOnboardingStatus'
import DOMPurify from 'dompurify'
import { useMemo } from 'react'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import styles from './OnboardingSummary.module.scss'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import SuccessCheck from '@/assets/icons/success_check.svg?react'
import UncheckedCircular from '@/assets/icons/unchecked_circular.svg?react'
import { useFlow } from '@/components/Flow/useFlow'
import { useComponentDictionary } from '@/i18n/I18n'

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
                <Components.Text variant="supporting" className={styles.description}>
                  {t('onboardedAdminDescription')}
                </Components.Text>
              </Flex>
            ) : (
              <Flex flexDirection="column" alignItems="flex-start" gap={8}>
                <Components.Heading as="h2">{t('missingRequirementsSubtitle')}</Components.Heading>
                <Components.Text>{t('missingRequirementsDescription')}</Components.Text>
                <ul className={styles.list}>
                  {onboardingSteps
                    ?.sort((a, b) => (a.completed ? -1 : 1))
                    .map(step => {
                      return (
                        <li key={step.id} className={styles.listItem}>
                          {step.completed ? (
                            <SuccessCheck width={24} height={24} className={styles.listItemIcon} />
                          ) : (
                            <UncheckedCircular
                              width={24}
                              height={24}
                              className={classNames(styles.listItemIcon, styles.incomplete)}
                            />
                          )}
                          <Components.Heading as="h4">
                            {/* @ts-expect-error: id has typeof keyof steps */}
                            {t(`steps.${step.id}`, step.title)}
                          </Components.Heading>
                        </li>
                      )
                    })}
                </ul>
              </Flex>
            )
          ) : (
            <>
              <Flex flexDirection="column" gap={20} alignItems="center">
                <Flex flexDirection="column" gap={4} alignItems="center">
                  <Components.Heading as="h2" textAlign="center">
                    {t('onboardedSelfSubtitle')}
                  </Components.Heading>
                  <Components.Text variant="supporting" className={styles.description}>
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

        {isAdmin && (
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
