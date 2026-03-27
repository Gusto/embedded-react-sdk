import classNames from 'classnames'
import type { DetailViewLayoutProps } from './DetailViewLayoutTypes'
import styles from './DetailViewLayout.module.scss'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function DetailViewLayout({
  title,
  subtitle,
  onBack,
  backLabel,
  actions,
  tabs,
  selectedTabId,
  onTabChange,
  className,
}: DetailViewLayoutProps) {
  const { Button, Heading, Text, Tabs } = useComponentContext()

  return (
    <section className={classNames(styles.root, className)}>
      {onBack && (
        <Button
          variant="tertiary"
          className={styles.backButton}
          icon={
            <span className={styles.backButtonIcon}>
              <CaretLeftIcon />
            </span>
          }
          onClick={onBack}
        >
          {backLabel}
        </Button>
      )}

      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <Heading as="h2" styledAs="h2">
            {title}
          </Heading>
          {subtitle && <Text variant="supporting">{subtitle}</Text>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      <Tabs
        tabs={tabs}
        selectedId={selectedTabId}
        onSelectionChange={onTabChange}
        aria-label={title}
      />
    </section>
  )
}
