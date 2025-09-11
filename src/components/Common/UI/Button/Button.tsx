import { Button as AriaButton } from 'react-aria-components'
import classNames from 'classnames'
import { type ButtonProps } from './ButtonTypes'
import styles from './Button.module.scss'

export function Button({
  isLoading,
  isDisabled,
  variant,
  buttonRef,
  className,
  children,
  onBlur,
  onFocus,
  onClick,
  ...props
}: ButtonProps) {
  // Fallback to defaults if not provided (for direct usage outside component adapter)
  const buttonVariant = variant || 'primary'
  const buttonIsLoading = isLoading || false
  const buttonIsDisabled = isDisabled || false

  const handlePress = onClick
    ? () => {
        onClick({} as React.MouseEvent<HTMLButtonElement>)
      }
    : undefined

  return (
    <AriaButton
      {...props}
      className={({ defaultClassName }) => classNames(styles.root, defaultClassName, className)}
      ref={buttonRef}
      onBlur={onBlur}
      onFocus={onFocus}
      isDisabled={buttonIsDisabled || buttonIsLoading}
      data-variant={buttonVariant}
      data-loading={buttonIsLoading || undefined}
      onPress={handlePress}
    >
      {children}
    </AriaButton>
  )
}
