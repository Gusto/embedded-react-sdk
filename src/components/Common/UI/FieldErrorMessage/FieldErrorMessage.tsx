import type { HTMLAttributes } from 'react'
import classNames from 'classnames'
import styles from './FieldErrorMessage.module.scss'

interface FieldErrorMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  withErrorIcon?: boolean
}

export function FieldErrorMessage({
  children,
  id,
  className,
  withErrorIcon = true,
  ...props
}: FieldErrorMessageProps) {
  return (
    children && (
      <p
        id={id}
        className={classNames(styles.root, className, {
          [styles.withErrorIcon as string]: withErrorIcon,
        })}
        {...props}
      >
        {children}
      </p>
    )
  )
}
