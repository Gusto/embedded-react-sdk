import { ReactNode } from 'react'
import cn from 'classnames'
import styles from './Grid.module.scss'
import {
  setResponsiveCustomProperties,
  transformResponsiveSpacingValue,
  type CustomPropertyValue,
  type Responsive,
  type ResponsiveSpacing,
} from '@/helpers/responsive'

type Flow = 'row' | 'column' | 'row dense' | 'column dense'
type Alignment = 'start' | 'end' | 'center' | 'stretch'

export interface GridProps {
  children: ReactNode
  gap?: ResponsiveSpacing
  gridTemplateColumns?: Responsive<CustomPropertyValue[]>
  gridTemplateRows?: Responsive<CustomPropertyValue[]>
  gridTemplateAreas?: Responsive<string>
  gridAutoFlow?: Responsive<Flow>
  alignItems?: Responsive<Alignment>
  justifyItems?: Responsive<Alignment>
  className?: string
}

export function Grid({
  children,
  gap = 16,
  gridTemplateColumns = ['1fr'],
  gridTemplateRows,
  gridTemplateAreas,
  gridAutoFlow,
  alignItems,
  justifyItems,
  className,
}: GridProps) {
  const properties = setResponsiveCustomProperties({
    gap: transformResponsiveSpacingValue(gap),
    'grid-template-columns': gridTemplateColumns,
    'grid-template-rows': gridTemplateRows,
    'grid-template-areas': gridTemplateAreas,
    'grid-auto-flow': gridAutoFlow,
    'align-items': alignItems,
    'justify-items': justifyItems,
  })

  return (
    <div className={cn(styles.gridContainer, className)}>
      <div className={styles.grid} style={properties}>
        {children}
      </div>
    </div>
  )
}
