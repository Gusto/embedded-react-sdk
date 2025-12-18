import classNames from 'classnames'
import { ButtonIconDefaults, type ButtonIconProps } from './ButtonTypes'
import { Button } from './Button'
import styles from './ButtonIcon.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'

export function ButtonIcon(rawProps: ButtonIconProps) {
  const resolvedProps = applyMissingDefaults(rawProps, ButtonIconDefaults)
  const { children, variant, className, ...props } = resolvedProps

  return (
    <Button {...props} variant={variant} className={classNames(styles.root, className)}>
      {children}
    </Button>
  )
}
