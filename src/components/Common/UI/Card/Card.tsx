import cn from 'classnames'
import { Flex } from '../../Flex/Flex'
import styles from './Card.module.scss'
import { type CardProps } from '@/components/Common/UI/Card/CardTypes'

export function Card({ children, menu, className, action }: CardProps) {
  return (
    <div className={cn(styles.cardContainer, className)} data-testid="data-card">
      <Flex flexDirection="row" gap={8}>
        {action && <div>{action}</div>}
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
