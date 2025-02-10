import { DisconnectedCheckbox, Flex } from '@/components/Common'
import styles from './Card.module.scss'
import { VisuallyHidden } from 'react-aria'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'

interface CardProps {
  onSelect?: () => void
  children: React.ReactNode
  menu?: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ className, menu, children, onSelect }: CardProps) => {
  const { t } = useTranslation('common')

  return (
    <div className={cn(styles.cardContainer, className)}>
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
