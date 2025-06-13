import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeesGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/employeesGetOnboardingStatus'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlow'
import styles from './OnboardingSummary.module.scss'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import SuccessCheck from '@/assets/icons/success_check.svg?react'
import UncheckedCircular from '@/assets/icons/unchecked_circular.svg?react'
import { useFlow } from '@/components/Flow/useFlow'
import { useComponentDictionary } from '@/i18n/I18n'

interface SummaryProps extends CommonComponentInterface<'Employee.OnboardingSummary'> {
  employeeId: string
  isAdmin?: boolean
}

export function OnboardingSummary(props: SummaryProps & BaseComponentInterface) {
  useI18n('Employee.OnboardingSummary')
  useComponentDictionary('Employee.OnboardingSummary', props.dictionary)

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, className, isAdmin = false }: SummaryProps) => {
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

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        <Flex alignItems="center" flexDirection="column" gap={8}>
          {isAdmin ? (
            isOnboardingCompleted ? (
              <>
                <Components.Heading as="h2" textAlign="center">
                  {t('onboardedAdminSubtitle', { name: `${firstName} ${lastName}` })}
                </Components.Heading>
                <Components.Text className={styles.description}>
                  {t('onboardedAdminDescription')}
                </Components.Text>
              </>
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
              <Components.Heading as="h2" textAlign="center">
                {t('onboardedSelfSubtitle')}
              </Components.Heading>
              <Components.Text className={styles.description}>
                {t('onboardedSelfDescription')}
              </Components.Text>
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
