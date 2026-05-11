import classNames from 'classnames'
import type { ButtonIconProps } from '@gusto/embedded-react-sdk'
import { Button } from './Button'
import styles from './ButtonIcon.module.scss'

export function ButtonIcon({ variant, className, children, ...props }: ButtonIconProps) {
  const resolvedVariant = variant === 'error' ? 'error' : 'secondary'
  return (
    <Button {...props} variant={resolvedVariant} className={classNames(styles.root, className)}>
      {children}
    </Button>
  )
}
