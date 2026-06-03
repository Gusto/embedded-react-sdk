import { type BoxHeaderProps, BoxHeaderDefaults } from './BoxHeaderTypes'
import styles from './BoxHeader.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex'

export function BoxHeader(rawProps: BoxHeaderProps) {
  const { title, description, action, headingLevel } = applyMissingDefaults(
    rawProps,
    BoxHeaderDefaults,
  )
  const Components = useComponentContext()

  return (
    <div className={styles.root}>
      <Flex flexDirection="row" gap={16} justifyContent="space-between" alignItems="center">
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as={headingLevel!} className={styles.headerTitle}>
            {title}
          </Components.Heading>
          {description && (
            <Components.Text as="p" variant="supporting">
              {description}
            </Components.Text>
          )}
        </Flex>

        {action}
      </Flex>
    </div>
  )
}
