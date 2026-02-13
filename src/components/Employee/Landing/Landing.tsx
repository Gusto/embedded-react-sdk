import { useTranslation } from 'react-i18next'
import { useEmployeeLanding } from './useEmployeeLanding'
import styles from './Landing.module.scss'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'

interface SummaryProps extends CommonComponentInterface<'Employee.Landing'> {
  employeeId: string
  companyId: string
}

export function Landing(props: SummaryProps & BaseComponentInterface) {
  useI18n('Employee.Landing')
  useComponentDictionary('Employee.Landing', props.dictionary)

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, companyId, className }: SummaryProps) => {
  const { onEvent } = useBase()
  const Components = useComponentContext()
  const { t } = useTranslation('Employee.Landing')

  const { data, actions } = useEmployeeLanding({ employeeId, companyId, onEvent })

  return (
    <section className={className}>
      <Flex alignItems="center" flexDirection="column" gap={32}>
        <Flex alignItems="center" flexDirection="column" gap={8}>
          <Components.Heading as="h2" textAlign="center">
            {t('landingSubtitle', { firstName: data.firstName, companyName: data.companyName })}
          </Components.Heading>
          <Components.Text className={styles.description}>
            {t('landingDescription')}
          </Components.Text>
        </Flex>
        <Flex flexDirection="column" gap={8}>
          <Components.Heading as="h3">{t('stepsSubtitle')}</Components.Heading>
          <Components.UnorderedList
            items={[t('steps.personalInfo'), t('steps.taxInfo'), t('steps.bankInfo')]}
          />
        </Flex>
        <Flex flexDirection="column" alignItems="center" gap={8}>
          <ActionsLayout justifyContent="center">
            <Components.Button variant="secondary" onClick={actions.handleStart}>
              {t('getStartedCta')}
            </Components.Button>
          </ActionsLayout>
          <Components.Text className={styles.description}>
            {t('getStartedDescription')}
          </Components.Text>
        </Flex>
      </Flex>
    </section>
  )
}
