import cn from 'classnames'
import type { ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'

const VARIANT_CLASS: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-outline-secondary',
  tertiary: 'btn-link',
  error: 'btn-outline-danger',
}

export function GwsButton({
  variant = 'primary',
  isLoading,
  isDisabled,
  icon,
  children,
  buttonRef,
  className,
  ...props
}: ButtonProps) {
  const disabled = isDisabled || isLoading

  return (
    <button
      ref={buttonRef}
      className={cn('btn', VARIANT_CLASS[variant], className)}
      disabled={disabled}
      aria-busy={isLoading || undefined}
      data-loading={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
      ) : (
        <>
          {icon && <span className="me-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
