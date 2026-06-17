import cn from 'classnames'
import { Flex } from '../../Flex/Flex'
import styles from './Card.module.scss'
import { type CardProps } from '@/components/Common/UI/Card/CardTypes'

/**
 * Renders a content card with optional left-side action element and right-side menu.
 *
 * @param props - The {@link CardProps} controlling the card's content, optional action, and optional menu.
 * @returns The rendered card element.
 * @internal
 */
export function Card({ children, menu, className, action }: CardProps) {
  return (
    <div className={cn(styles.cardContainer, className)} data-testid="data-card">
      <Flex flexDirection="row" gap={8}>
        {action && <div>{action}</div>}
        <div className={styles.cardBody}>
          <Flex flexDirection={'column'} gap={16}>
            {children}
          </Flex>
        </div>
        {menu && <div>{menu}</div>}
      </Flex>
    </div>
  )
}
