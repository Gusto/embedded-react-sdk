import cn from 'classnames'
import styles from './Container.module.scss'
import { type ContainerProps } from '@/components/Common/UI/Container/ContainerTypes'

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn(styles.containerContainer, className)} data-testid="data-container">
      {children}
    </div>
  )
}
