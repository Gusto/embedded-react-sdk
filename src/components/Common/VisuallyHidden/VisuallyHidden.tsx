import type { HTMLAttributes } from 'react'
import type React from 'react'
import classnames from 'classnames'
import styles from './VisuallyHidden.module.scss'

/** @internal */
export interface VisuallyHiddenProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The element to render the visually hidden content as.
   * @defaultValue 'div'
   */
  as?: React.ElementType
  /**
   * The content to hide visually but keep available for screen readers.
   */
  children: React.ReactNode
}

/** @internal */
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
