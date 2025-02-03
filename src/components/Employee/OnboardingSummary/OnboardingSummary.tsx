import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
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
import { useGetEmployee, useGetEmployeeOnboardingStatus } from '@/api/queries/employee'

import SuccessCheck from '@/assets/icons/success_check.svg?react'
import UncheckedCircular from '@/assets/icons/unchecked_circular.svg?react'

import styles from './OnboardingSummary.module.scss'

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

  const {
    data: { first_name, last_name },
  } = useGetEmployee(employeeId)

  const {
    data: { onboarding_steps, onboarding_status },
  } = useGetEmployeeOnboardingStatus(employeeId)
  const { t } = useTranslation('Employee.OnboardingSummary')

  const hasMissingRequirements =
    onboarding_steps?.length &&
    onboarding_steps.findIndex(step => step.required && !step.completed) > -1

  const isOnboardingCompleted =
    onboarding_status === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
    (!hasMissingRequirements &&
      onboarding_status === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE)

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        <Flex alignItems="center" flexDirection="column" gap={8}>
          {isAdmin ? (
            isOnboardingCompleted ? (
              <>
                <h2 className={styles.subtitle}>
                  {t('onboardedAdminSubtitle', { name: `${first_name} ${last_name}` })}
                </h2>
                <p className={styles.description}>{t('onboardedAdminDescription')}</p>
              </>
            ) : (
              <Flex flexDirection="column" alignItems="flex-start" gap={8}>
                <h2>{t('missingRequirementsSubtitle')}</h2>
                <p>{t('missingRequirementsDescription')}</p>
                <ul className={styles.list}>
                  {onboarding_steps
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
