import { useCompaniesGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/companiesGetOnboardingStatus'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import styles from './OnboardingOverview.module.scss'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Flex } from '@/components/Common'
import { componentEvents } from '@/shared/constants'
import SuccessCheck from '@/assets/icons/success_check.svg?react'
import UncheckedCircular from '@/assets/icons/unchecked_circular.svg?react'

interface OnboardingOverviewProps extends CommonComponentInterface {
  companyId: string
}

export function OnboardingOverview(props: OnboardingOverviewProps & BaseComponentInterface) {
  useI18n('Company.OnboardingOverview')

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, className }: OnboardingOverviewProps) => {
  const { onEvent } = useBase()
  const { t } = useTranslation('Company.OnboardingOverview')
  const Components = useComponentContext()

  const { data } = useCompaniesGetOnboardingStatusSuspense({ companyUuid: companyId })
  const { onboardingCompleted, onboardingSteps } = data.companyOnboardingStatus!

  const handleDone = () => {
    onEvent(componentEvents.COMPANY_OVERVIEW_DONE)
  }

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        {onboardingCompleted ? (
          <Flex alignItems="center" flexDirection="column" gap={8}>
            <Components.Heading as="h2" textAlign="center">
              {t('onboardingCompletedTitle')}
            </Components.Heading>
            <p>{t('onboardingCompletedDescription')}</p>
            <Components.Button variant="secondary" onClick={handleDone}>
              {t('onboardingCompletedCta')}
            </Components.Button>
          </Flex>
        ) : (
          <Flex flexDirection="column" alignItems="flex-start" gap={8}>
            <Components.Heading as="h2">{t('missingRequirementsTitle')}</Components.Heading>
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
                      <Components.Heading as="h4">
                        {/* @ts-expect-error: id has typeof keyof steps */}
                        {t(`steps.${step.id}`, step.title)}
                      </Components.Heading>
                    </li>
                  )
                })}
            </ul>
          </Flex>
        )}
      </Flex>
    </section>
  )
}
