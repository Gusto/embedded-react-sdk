import type { ReactNode } from 'react'
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
  gridTemplateColumns?: Responsive<CustomPropertyValue | CustomPropertyValue[]>
  gridTemplateRows?: Responsive<CustomPropertyValue | CustomPropertyValue[]>
  gridTemplateAreas?: Responsive<string>
  gridAutoFlow?: Responsive<Flow>
  alignItems?: Responsive<Alignment>
  justifyItems?: Responsive<Alignment>
  justifyContent?: Responsive<
    'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'
  >
  className?: string
}

export function Grid({
  children,
  gap = 24,
  gridTemplateColumns = ['1fr'],
  gridTemplateRows,
  gridTemplateAreas,
  gridAutoFlow,
  alignItems,
  justifyItems,
  justifyContent,
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
    'justify-content': justifyContent,
  })

  return (
    <div className={cn(styles.gridContainer, className)}>
      <div className={styles.grid} style={properties}>
        {children}
      </div>
    </div>
  )
}
