import style from './Flex.module.scss'
import {
  setResponsiveCustomProperties,
  transformResponsiveSpacingValue,
  type Responsive,
  type ResponsiveSpacing,
} from '@/helpers/responsive'

export interface FlexProps {
  children: React.ReactNode
  flexDirection?: Responsive<'row' | 'column'>
  justifyContent?: Responsive<
    | 'space-between'
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-around'
    | 'space-evenly'
    | 'normal'
  >
  alignItems?: Responsive<'center' | 'flex-start' | 'flex-end' | 'stretch'>
  gap?: ResponsiveSpacing
}

export function Flex({
  children,
  flexDirection = 'row',
  justifyContent = 'normal',
  alignItems = 'flex-start',
  gap = 24,
}: FlexProps) {
  const properties = setResponsiveCustomProperties({
    'flex-direction': flexDirection,
    'justify-content': justifyContent,
    'align-items': alignItems,
    gap: transformResponsiveSpacingValue(gap),
  })

  return (
    <div className={style.flexContainer}>
      <div className={style.flex} style={properties}>
        {children}
      </div>
    </div>
  )
}

export interface FlexItemProps {
  flexGrow?: number | 'initial'
  children: React.ReactNode
}

export function FlexItem({ flexGrow = 'initial', children }: FlexItemProps) {
  return <div style={{ flexGrow: flexGrow }}>{children}</div>
}
