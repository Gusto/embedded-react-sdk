import cn from 'classnames'
import styles from './Box.module.scss'
import type { BoxProps, BoxSectionProps } from '@/components/Common/UI/Box/BoxTypes'

function BoxHeader({ children, className }: BoxSectionProps) {
  return <div className={cn(styles.header, className)}>{children}</div>
}

function BoxContent({ children, className, variant = 'default' }: BoxSectionProps) {
  return (
    <div className={cn(variant === 'flush' ? styles.contentFlush : styles.content, className)}>
      {children}
    </div>
  )
}

function BoxFooter({ children, className }: BoxSectionProps) {
  return <div className={cn(styles.footer, className)}>{children}</div>
}

function BoxRoot({ children, className }: BoxProps) {
  return (
    <div className={cn(styles.root, className)} data-testid="data-box">
      {children}
    </div>
  )
}

export const Box = Object.assign(BoxRoot, {
  Header: BoxHeader,
  Content: BoxContent,
  Footer: BoxFooter,
})
