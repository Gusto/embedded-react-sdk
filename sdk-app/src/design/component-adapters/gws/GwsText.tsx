import cn from 'classnames'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'

const SIZE_CLASS: Record<string, string> = {
  xs: 'small',
  sm: 'large',
  md: '',
  lg: 'fs-5',
}

const WEIGHT_CLASS: Record<string, string> = {
  regular: 'fw-normal',
  medium: 'fw-medium',
  semibold: 'fw-semibold',
  bold: 'fw-bold',
}

const ALIGN_CLASS: Record<string, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
}

export function GwsText({
  as: Component = 'p',
  size = 'md',
  weight,
  textAlign,
  variant,
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(
        'mb-0',
        SIZE_CLASS[size],
        weight && WEIGHT_CLASS[weight],
        textAlign && ALIGN_CLASS[textAlign],
        variant === 'supporting' && 'text-muted',
        variant === 'leading' && 'fw-medium',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
