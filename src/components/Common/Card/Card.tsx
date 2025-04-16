import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import styles from './Card.module.scss'
import { Checkbox, Flex } from '@/components/Common'

interface CardProps {
  onSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void
  children: React.ReactNode
  menu?: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ className, menu, children, onSelect }: CardProps) => {
  const { t } = useTranslation('common')

  return (
    <div className={cn(styles.cardContainer, className)}>
      <Flex flexDirection="row" gap={8}>
        {onSelect && (
          <div>
            <Checkbox
              onChange={onSelect}
              label={t('card.selectRowLabel')}
              shouldVisuallyHideLabel
            />
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
