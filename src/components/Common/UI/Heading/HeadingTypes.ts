import type { HTMLAttributes, ReactNode } from 'react'

export interface HeadingProps extends Pick<HTMLAttributes<HTMLHeadingElement>, 'className'> {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  styledAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  textAlign?: 'start' | 'center' | 'end'
  children?: ReactNode
}
