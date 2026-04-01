import { useId } from 'react'
import classNames from 'classnames'
import type { DetailViewLayoutProps } from './DetailViewLayoutTypes'
import styles from './DetailViewLayout.module.scss'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ActionsLayout } from '@/components/Common/ActionsLayout'

export function DetailViewLayout({
  title,
  subtitle,
  onBack,
  backLabel,
  actions,
  tabs,
  selectedTabId,
  onTabChange,
  children,
  className,
}: DetailViewLayoutProps) {
  const { Button, Heading, Text, Tabs } = useComponentContext()
  const headingId = useId()

  return (
    <section className={classNames(styles.root, className)} aria-labelledby={headingId}>
      {onBack && (
        <Button
          variant="tertiary"
          className={styles.backButton}
          icon={<CaretLeftIcon aria-hidden="true" />}
          onClick={onBack}
        >
          {backLabel}
        </Button>
      )}

      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <Heading as="h2" styledAs="h2" id={headingId}>
            {title}
          </Heading>
          {subtitle && <Text variant="supporting">{subtitle}</Text>}
        </div>
        {actions && <ActionsLayout>{actions}</ActionsLayout>}
      </div>

      {tabs !== undefined ? (
        <Tabs
          tabs={tabs}
          selectedId={selectedTabId}
          onSelectionChange={onTabChange}
          aria-label={title}
        />
      ) : (
        children
      )}
    </section>
  )
}
