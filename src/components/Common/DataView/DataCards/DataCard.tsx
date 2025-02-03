import { DisconnectedCheckbox, Flex } from '@/components/Common'
import styles from './DataCard.module.scss'
import { VisuallyHidden } from 'react-aria'
import { useTranslation } from 'react-i18next'

interface DataCardProps {
  onSelect?: () => void
  children: React.ReactNode
  menu?: React.ReactNode
}

export const DataCard: React.FC<DataCardProps> = ({ menu, children, onSelect }: DataCardProps) => {
  const { t } = useTranslation('common')

  return (
    <div className={styles.cardContainer}>
      <Flex flexDirection="row" gap={4}>
        {onSelect && (
          <div>
            <DisconnectedCheckbox onChange={onSelect} aria-label="select">
              <VisuallyHidden>{t('card.selectRowLabel')}</VisuallyHidden>
            </DisconnectedCheckbox>
          </div>
        )}
        <div style={{ flexGrow: 1, flexShrink: 1 }}>
          <Flex flexDirection={'column'} gap={16}>
            {children}
          </Flex>
        </div>
        {menu && <div>{menu}</div>}
      </Flex>
    </div>
  )
}
