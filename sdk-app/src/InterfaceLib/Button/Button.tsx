// eslint-disable-next-line no-restricted-imports
import { Button as AriaButton } from 'react-aria-components'
import classNames from 'classnames'
import type { ButtonProps } from '@gusto/embedded-react-sdk'
import styles from './Button.module.scss'

export function Button({
  variant = 'primary',
  isLoading = false,
  isDisabled = false,
  buttonRef,
  className,
  icon,
  children,
  onBlur,
  onFocus,
  onClick,
  ...otherProps
}: ButtonProps) {
  const handlePress = onClick
    ? () => {
        onClick({} as React.MouseEvent<HTMLButtonElement>)
      }
    : undefined

  return (
    <AriaButton
      {...otherProps}
      className={classNames(styles.root, className)}
      ref={buttonRef}
      onBlur={onBlur}
      onFocus={onFocus}
      isDisabled={isDisabled || isLoading}
      data-variant={variant}
      data-loading={isLoading || undefined}
      onPress={handlePress}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </AriaButton>
  )
}
