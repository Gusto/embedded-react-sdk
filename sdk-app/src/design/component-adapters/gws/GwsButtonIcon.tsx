import cn from 'classnames'
import { GwsButton } from './GwsButton'
import type { ButtonIconProps } from '@/components/Common/UI/Button/ButtonTypes'

export function GwsButtonIcon({
  children,
  variant = 'tertiary',
  className,
  'aria-label': ariaLabel,
  ...props
}: ButtonIconProps) {
  return (
    <GwsButton
      variant={variant}
      className={cn('btn-sm px-2', className)}
      aria-label={ariaLabel}
      title={ariaLabel}
      {...props}
    >
      {children}
      <span className="visually-hidden">{ariaLabel}</span>
    </GwsButton>
  )
}
