import { useTranslation } from 'react-i18next'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useCompaniesGetSuspense } from '@gusto/embedded-api/react-query/companiesGet'
import styles from './Landing.module.scss'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

interface SummaryProps extends CommonComponentInterface {
  employeeId: string
  companyId: string
}

export function Landing(props: SummaryProps & BaseComponentInterface) {
  useI18n('Employee.Landing')

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, companyId, className }: SummaryProps) => {
  const { onEvent } = useBase()
  const Components = useComponentContext()

  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })
  const firstName = employee!.firstName

  const {
    data: { company },
  } = useCompaniesGetSuspense({ companyId })
  const companyName = company?.name

  const { t } = useTranslation('Employee.Landing')

  return (
    <section className={className}>
      <Flex alignItems="center" flexDirection="column" gap={32}>
        <Flex alignItems="center" flexDirection="column" gap={8}>
          <h2 className={styles.subtitle}>{t('landingSubtitle', { firstName, companyName })}</h2>
          <p className={styles.description}>{t('landingDescription')}</p>
        </Flex>
        <Flex flexDirection="column" gap={8}>
          <h3>{t('stepsSubtitle')}</h3>
          <ul>
            <li>{t('steps.personalInfo')}</li>
            <li>{t('steps.taxInfo')}</li>
            <li>{t('steps.bankInfo')}</li>
          </ul>
        </Flex>
        <Flex flexDirection="column" alignItems="center" gap={8}>
          <ActionsLayout justifyContent="center">
            <Components.Button
              variant="secondary"
              onClick={() => {
                onEvent(componentEvents.EMPLOYEE_SELF_ONBOARDING_START)
              }}
            >
              {t('getStartedCta')}
            </Components.Button>
          </ActionsLayout>
          <p className={styles.description}>{t('getStartedDescription')}</p>
        </Flex>
      </Flex>
    </section>
  )
}
