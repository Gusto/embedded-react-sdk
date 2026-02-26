import cn from 'classnames'
import styles from './Box.module.scss'
import { type BoxProps } from '@/components/Common/UI/Box/BoxTypes'

export function Box({ children, className }: BoxProps) {
  return (
    <div className={cn(styles.boxContainer, className)} data-testid="data-box">
      {children}
    </div>
  )
}
