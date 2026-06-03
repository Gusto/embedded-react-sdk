import { type BoxHeaderProps, BoxHeaderDefaults } from './BoxHeaderTypes'
import styles from './BoxHeader.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function BoxHeader(rawProps: BoxHeaderProps) {
  const { title, description, action, headingLevel } = applyMissingDefaults(
    rawProps,
    BoxHeaderDefaults,
  )
  const Components = useComponentContext()

  return (
    <div className={styles.root}>
      <div className={styles.titleColumn}>
        <Components.Heading as={headingLevel!} className={styles.headerTitle}>
          {title}
        </Components.Heading>
        {description && (
          <Components.Text as="p" variant="supporting">
            {description}
          </Components.Text>
        )}
      </div>
      {action}
    </div>
  )
}
