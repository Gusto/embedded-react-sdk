import type { HTMLAttributes, ReactNode } from 'react'

export interface TextProps extends Pick<HTMLAttributes<HTMLElement>, 'className'> {
  as: 'p' | 'span' | 'div'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  textAlign?: 'start' | 'center' | 'end'
  weight?: 'regular' | 'medium' | 'bold'
  children?: ReactNode
}
