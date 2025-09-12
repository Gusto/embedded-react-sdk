import classNames from 'classnames'
import { type ButtonIconProps } from './ButtonTypes'
import { Button } from './Button'
import styles from './ButtonIcon.module.scss'

export function ButtonIcon({ variant, className, ...props }: ButtonIconProps) {
  return (
    <Button {...props} variant={variant} className={classNames(styles.root, className)}>
      {props.children}
    </Button>
  )
}
