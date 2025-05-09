import { useTranslation } from 'react-i18next'
import { Flex } from '../Flex/Flex'
import styles from './EmptyData.module.scss'
import magnifyingGlass from '@/assets/icons/magnifyingGlass.png'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type EmptyDataProps = {
  title?: string
  description?: string
  children?: React.ReactNode
}
export function EmptyData({ title, description, children }: EmptyDataProps) {
  const { t } = useTranslation()
  const { Text } = useComponentContext()
  return (
    <div className={styles.emptyData} data-testid="emptydata">
      <Flex flexDirection="column" alignItems="center">
        <img src={magnifyingGlass} alt={t('icons.magnifyingGlass')} />
        {title && (
          <Text weight="bold" className={styles.title}>
            {title}
          </Text>
        )}
        {description && <Text>{description}</Text>}
        {children && children}
      </Flex>
    </div>
  )
}
