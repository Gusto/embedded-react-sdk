import classNames from 'classnames'
import { ButtonIconDefaults, type ButtonIconProps } from './ButtonTypes'
import { Button } from './Button'
import styles from './ButtonIcon.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'

/**
 * Renders an icon-only button. Requires `aria-label` for accessibility since there is no visible text.
 *
 * @param rawProps - The {@link ButtonIconProps} controlling appearance, icon content, and click behavior.
 * @returns The rendered icon button element.
 * @internal
 */
export function ButtonIcon(rawProps: ButtonIconProps) {
  const resolvedProps = applyMissingDefaults(rawProps, ButtonIconDefaults)
  const { children, variant, className, ...props } = resolvedProps

  return (
    <Button {...props} variant={variant} className={classNames(styles.root, className)}>
      {children}
    </Button>
  )
}
