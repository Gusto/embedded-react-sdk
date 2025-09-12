import { Button as AriaButton } from 'react-aria-components'
import classNames from 'classnames'
import { type ButtonProps, ButtonDefaults } from './ButtonTypes'
import styles from './Button.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'

export function Button(rawProps: ButtonProps) {
  const resolvedProps = applyMissingDefaults(rawProps, ButtonDefaults)
  const {
    isLoading,
    isDisabled,
    variant,
    buttonRef,
    className,
    children,
    onBlur,
    onFocus,
    onClick,
    ...otherProps
  } = resolvedProps
  const handlePress = onClick
    ? () => {
        onClick({} as React.MouseEvent<HTMLButtonElement>)
      }
    : undefined

  return (
    <AriaButton
      {...otherProps}
      className={({ defaultClassName }) => classNames(styles.root, defaultClassName, className)}
      ref={buttonRef}
      onBlur={onBlur}
      onFocus={onFocus}
      isDisabled={isDisabled || isLoading}
      data-variant={variant}
      data-loading={isLoading || undefined}
      onPress={handlePress}
    >
      {children}
    </AriaButton>
  )
}
