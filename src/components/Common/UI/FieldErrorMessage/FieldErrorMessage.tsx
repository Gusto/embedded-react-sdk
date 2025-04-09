import type { HTMLAttributes } from 'react'
import classNames from 'classnames'
import styles from './FieldErrorMessage.module.scss'

export function FieldErrorMessage({
  children,
  id,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    children && (
      <p id={id} className={classNames(styles.root, className)} {...props}>
        {children}
      </p>
    )
  )
}
