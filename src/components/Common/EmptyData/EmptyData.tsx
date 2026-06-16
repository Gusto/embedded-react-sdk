import { Flex } from '../Flex/Flex'
import styles from './EmptyData.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type EmptyDataProps = {
  title?: string
  description?: string
  children?: React.ReactNode
  /**
   * Optional illustration rendered above the title.
   */
  icon?: React.ReactNode
}
/** @internal */
export function EmptyData({ title, description, children, icon }: EmptyDataProps) {
  const { Text } = useComponentContext()
  return (
    <div className={styles.emptyData} data-testid="emptydata">
      <Flex flexDirection="column" alignItems="center" gap={16}>
        {icon && <span className={styles.iconSlot}>{icon}</span>}
        <div className={styles.textContent}>
          {title && (
            <Text weight="medium" textAlign="center">
              {title}
            </Text>
          )}
          {description && (
            <Text size="sm" variant="supporting" textAlign="center">
              {description}
            </Text>
          )}
        </div>
        {children && children}
      </Flex>
    </div>
  )
}
