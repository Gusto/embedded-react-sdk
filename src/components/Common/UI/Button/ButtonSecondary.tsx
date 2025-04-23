import { Button as AriaButton } from 'react-aria-components'
import { type ButtonSecondaryProps } from './ButtonTypes'
import styles from './Button.module.scss'

export function ButtonSecondary({
  isError = false,
  isLoading = false,
  isDisabled = false,
  ref,
  className,
  children,
  onBlur,
  onFocus,
  onClick,
  ...props
}: ButtonSecondaryProps) {
  const handlePress = onClick
    ? () => {
        onClick({} as React.MouseEvent<HTMLButtonElement>)
      }
    : undefined

  return (
    <span className={styles.root}>
      <AriaButton
        {...props}
        ref={ref}
        onBlur={onBlur}
        onFocus={onFocus}
        isDisabled={isDisabled || isLoading}
        data-variant="secondary"
        data-loading={isLoading || undefined}
        data-error={isError || undefined}
        onPress={handlePress}
      >
        {children}
      </AriaButton>
    </span>
  )
}
