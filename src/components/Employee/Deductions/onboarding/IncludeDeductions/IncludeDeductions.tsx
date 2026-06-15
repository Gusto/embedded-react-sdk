import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import styles from './IncludeDeductions.module.scss'
import { Grid } from '@/components/Common/Grid/Grid'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import CoinsHandsIcon from '@/assets/icons/coins-hand.svg?react'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

/** @internal */
export interface IncludeDeductionsProps {
  className?: string
  onAdd: () => void
  onContinue: () => void
}

/** @internal */
export function IncludeDeductions({ className, onAdd, onContinue }: IncludeDeductionsProps) {
  useI18n('Employee.Deductions')
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  return (
    <section className={classNames(styles.container, className)}>
      <Grid gridTemplateColumns="1fr">
        <Flex flexDirection="column" gap={2}>
          <Components.Heading as="h2">{t('pageTitle')}</Components.Heading>
          <Components.Text variant="supporting">
            {t('includeDeductionsDescriptionV2')}
          </Components.Text>
        </Flex>

        <section className={styles.emptyStateContainer}>
          <Flex flexDirection="column" gap={16} justifyContent="center" alignItems="center">
            <div className={styles.coinHandsIconContainer}>
              <CoinsHandsIcon width={24} height={24} />
            </div>
            <Components.Text weight="bold">{t('includeDeductionsEmptyState')}</Components.Text>
            <Components.Button
              type="button"
              variant="secondary"
              onClick={onAdd}
              className={styles.addDeductionButton}
            >
              <PlusCircleIcon />
              {t('addDeductionButtonCta')}
            </Components.Button>
          </Flex>
        </section>
        <ActionsLayout>
          <Components.Button type="button" onClick={onContinue}>
            {t('continueCta')}
          </Components.Button>
        </ActionsLayout>
      </Grid>
    </section>
  )
}
