import type { HTMLAttributes, ReactNode } from 'react'

export interface TextProps extends Pick<HTMLAttributes<HTMLParagraphElement>, 'className' | 'id'> {
  as?: 'p' | 'span' | 'div'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  textAlign?: 'start' | 'center' | 'end'
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  children?: ReactNode
}
