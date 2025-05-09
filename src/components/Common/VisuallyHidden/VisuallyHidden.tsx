import type { HTMLAttributes } from 'react'
import type React from 'react'
import classnames from 'classnames'
import styles from './VisuallyHidden.module.scss'

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The element to render the visually hidden content as.
   * @default 'div'
   */
  as?: React.ElementType
  /**
   * The content to hide visually but keep available for screen readers.
   */
  children: React.ReactNode
}

export function VisuallyHidden({
  as: Component = 'div',
  children,
  className,
  ...props
}: VisuallyHiddenProps) {
  return (
    <Component {...props} className={classnames(styles.visuallyHidden, className)}>
      {children}
    </Component>
  )
}
