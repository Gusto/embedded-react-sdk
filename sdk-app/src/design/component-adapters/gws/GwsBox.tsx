import cn from 'classnames'
import type { BoxProps } from '@/components/Common/UI/Box/BoxTypes'

export function GwsBox({ children, header, footer, withPadding = true, className }: BoxProps) {
  return (
    <div className={cn('card w-100', className)} data-testid="data-box">
      <div className="card-body d-flex flex-column">
        {header && <div className="mb-3">{header}</div>}
        <div className="flex-grow-1">{children}</div>
        {footer && <div className="pt-4">{footer}</div>}
      </div>
    </div>
  )
}
