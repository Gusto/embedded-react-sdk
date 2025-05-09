import type { HTMLAttributes } from 'react'
import classNames from 'classnames'
import styles from './FieldErrorMessage.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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
  const { Text } = useComponentContext()

  return (
    children && (
      <Text
        id={id}
        className={classNames(styles.root, className, {
          [styles.withErrorIcon as string]: withErrorIcon,
        })}
        {...props}
      >
        {children}
      </Text>
    )
  )
}
