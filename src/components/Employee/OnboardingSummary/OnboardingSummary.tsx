import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeesGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/employeesGetOnboardingStatus'
import styles from './OnboardingSummary.module.scss'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex, Button, ActionsLayout } from '@/components/Common'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import SuccessCheck from '@/assets/icons/success_check.svg?react'
import UncheckedCircular from '@/assets/icons/unchecked_circular.svg?react'

interface SummaryProps extends CommonComponentInterface {
  employeeId: string
  isAdmin?: boolean
}

export function OnboardingSummary(props: SummaryProps & BaseComponentInterface) {
  useI18n('Employee.OnboardingSummary')

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, className, isAdmin = false }: SummaryProps) => {
  const { onEvent } = useBase()
  const { t } = useTranslation('Employee.OnboardingSummary')

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
                <h2 className={styles.subtitle}>
                  {t('onboardedAdminSubtitle', { name: `${firstName} ${lastName}` })}
                </h2>
                <p className={styles.description}>{t('onboardedAdminDescription')}</p>
              </>
            ) : (
              <Flex flexDirection="column" alignItems="flex-start" gap={8}>
                <h2>{t('missingRequirementsSubtitle')}</h2>
                <p>{t('missingRequirementsDescription')}</p>
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
                          {/* @ts-expect-error: id has typeof keyof steps */}
                          <h4>{t(`steps.${step.id}`, step.title)}</h4>
                        </li>
                      )
                    })}
                </ul>
              </Flex>
            )
          ) : (
            <>
              <h2 className={styles.subtitle}>{t('onboardedSelfSubtitle')}</h2>
              <p className={styles.description}>{t('onboardedSelfDescription')}</p>
            </>
          )}
        </Flex>

        {isAdmin && (
          <ActionsLayout justifyContent={isOnboardingCompleted ? 'center' : 'start'}>
            <Button
              variant="secondary"
              onPress={() => {
                onEvent(componentEvents.EMPLOYEES_LIST)
              }}
            >
              {t('returnToEmployeeListCta')}
            </Button>
            {isOnboardingCompleted && (
              <Button
                variant="primary"
                onPress={() => {
                  onEvent(componentEvents.EMPLOYEE_CREATE)
                }}
              >
                {t('addAnotherCta')}
              </Button>
            )}
          </ActionsLayout>
        )}
      </Flex>
    </section>
  )
}

export const OnboardingSummaryContextual = () => {
  const { employeeId, onEvent, isAdmin } = useFlow<EmployeeOnboardingContextInterface>()
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
