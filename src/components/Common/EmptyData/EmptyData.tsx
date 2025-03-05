import { useTranslation } from 'react-i18next'
import styles from './EmptyData.module.scss'
import magnifyingGlass from '@/assets/icons/magnifyingGlass.png'
import { Flex } from '@/components/Common'

type EmptyDataProps = {
  title?: string
  description?: string
  children?: React.ReactNode
}
export function EmptyData({ title, description, children }: EmptyDataProps) {
  const { t } = useTranslation()
  return (
    <div className={styles.emptyData}>
      <Flex flexDirection="column" alignItems="center">
        <img src={magnifyingGlass} alt={t('icons.magnifyingGlass')} />
        {title && <p className={styles.title}>{title}</p>}
        {description && <p>{description}</p>}
        {children && children}
      </Flex>
    </div>
  )
}
