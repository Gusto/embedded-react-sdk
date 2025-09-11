import classNames from 'classnames'
import { type ButtonIconProps } from './ButtonTypes'
import { Button } from './Button'
import styles from './ButtonIcon.module.scss'

export function ButtonIcon({ variant, className, ...props }: ButtonIconProps) {
  // Fallback to defaults if not provided (for direct usage outside component adapter)
  const buttonVariant = variant || 'tertiary'

  return (
    <Button {...props} variant={buttonVariant} className={classNames(styles.root, className)}>
      {props.children}
    </Button>
  )
}
