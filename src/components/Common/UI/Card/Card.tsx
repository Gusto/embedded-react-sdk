import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import { Flex } from '../../Flex/Flex'
import { Checkbox } from '../Checkbox/Checkbox'
import styles from './Card.module.scss'
import { type CardProps } from '@/components/Common/UI/Card/CardTypes'

export function Card({ onSelect, children, menu, className }: CardProps) {
  const { t } = useTranslation('common')

  return (
    <div className={cn(styles.cardContainer, className)} data-testid="data-card">
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
