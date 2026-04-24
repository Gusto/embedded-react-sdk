import cn from 'classnames'
import type { HeadingProps } from '@/components/Common/UI/Heading/HeadingTypes'

const HEADING_TO_FS: Record<string, string> = {
  h1: 'fs-1',
  h2: 'fs-2',
  h3: 'fs-3',
  h4: 'fs-4',
  h5: 'fs-5',
  h6: 'fs-6',
}

const ALIGN_CLASS: Record<string, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
}

export function GwsHeading({
  as: Component,
  styledAs,
  textAlign,
  className,
  children,
  ...props
}: HeadingProps) {
  const visualLevel = styledAs ?? Component

  return (
    <Component
      className={cn(
        HEADING_TO_FS[visualLevel],
        'mb-0',
        textAlign && ALIGN_CLASS[textAlign],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
