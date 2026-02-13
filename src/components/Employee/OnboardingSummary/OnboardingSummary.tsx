import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { useEmployeeOnboardingSummary } from './useEmployeeOnboardingSummary'
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

  const { data, actions } = useEmployeeOnboardingSummary({ employeeId, isAdmin, onEvent })

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        <Flex alignItems="center" flexDirection="column" gap={8}>
          {data.isAdmin ? (
            data.isOnboardingCompleted ? (
              <>
                <Components.Heading as="h2" textAlign="center">
                  {t('onboardedAdminSubtitle', {
                    name: `${data.sanitizedFirstName} ${data.sanitizedLastName}`,
                    interpolation: { escapeValue: false },
                  })}
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
                  {data.onboardingSteps
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
              <ActionsLayout justifyContent={data.isOnboardingCompleted ? 'center' : 'start'}>
                <Components.Button variant="secondary" onClick={actions.handleDone}>
                  {t('doneCta')}
                </Components.Button>
              </ActionsLayout>
            </>
          )}
        </Flex>

        {data.isAdmin && (
          <ActionsLayout justifyContent={'center'}>
            <Components.Button variant="secondary" onClick={actions.handleEmployeesList}>
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
