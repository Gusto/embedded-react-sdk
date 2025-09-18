import { useTranslation } from 'react-i18next'
import styles from './EmptyState.module.scss'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  useBase,
} from '@/components/Base'
import { Grid } from '@/components/Common/Grid/Grid'
import { ActionsLayout, Flex } from '@/components/Common'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary } from '@/i18n/I18n'
import CoinsHandsIcon from '@/assets/icons/coins-hand.svg?react'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

interface EmptyStateProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
}

export function EmptyState(props: EmptyStateProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ className, dictionary }: EmptyStateProps) {
  const { onEvent } = useBase()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  useComponentDictionary('Employee.Deductions', dictionary)
  useI18n('Employee.Deductions')

  const handleAdd = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES)
  }

  const handleContinue = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_NO)
  }

  return (
    <section className={className}>
      <Grid gridTemplateColumns="1fr">
        <Components.Heading as="h2">{t('pageTitle')}</Components.Heading>
        <Components.Text variant="supporting">
          {t('includeDeductionsDescriptionV2')}
        </Components.Text>
        <Components.Text weight="bold" size="lg">
          {t('includeDeductionsSubtitle')}
        </Components.Text>
        <section className={styles.emptyStateContainer}>
          <Flex flexDirection="column" gap={16} justifyContent="center" alignItems="center">
            <section className={styles.coinHandsIconContainer}>
              <CoinsHandsIcon width={36} height={36} />
            </section>
            <Components.Text weight="bold">{t('includeDeductionsEmptyState')}</Components.Text>
            <Components.Button
              type="button"
              variant="secondary"
              onClick={handleAdd}
              className={styles.addDeductionButton}
            >
              <PlusCircleIcon width={24} height={24} className={styles.plusCircleIcon} />
              {t('addDeductionButtonCta')}
            </Components.Button>
          </Flex>
        </section>
        <ActionsLayout>
          <Components.Button type="button" onClick={handleContinue}>
            {t('continueCta')}
          </Components.Button>
        </ActionsLayout>
      </Grid>
    </section>
  )
}
