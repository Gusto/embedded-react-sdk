import { Button as AriaButton } from 'react-aria-components'
import classNames from 'classnames'
import { type ButtonProps } from './ButtonTypes'
import styles from './Button.module.scss'

export function Button({
  isError = false,
  isLoading = false,
  isDisabled = false,
  variant = 'primary',
  ref,
  className,
  children,
  onBlur,
  onFocus,
  onClick,
  ...props
}: ButtonProps) {
  const handlePress = onClick
    ? () => {
        onClick({} as React.MouseEvent<HTMLButtonElement>)
      }
    : undefined

  return (
    <AriaButton
      {...props}
      className={({ defaultClassName }) => classNames(styles.root, defaultClassName, className)}
      ref={ref}
      onBlur={onBlur}
      onFocus={onFocus}
      isDisabled={isDisabled || isLoading}
      data-variant={variant}
      data-loading={isLoading || undefined}
      data-error={isError || undefined}
      onPress={handlePress}
    >
      {children}
    </AriaButton>
  )
}
