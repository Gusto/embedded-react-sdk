import style from './Flex.module.scss'
import { defaultTheme } from '@/contexts/ThemeProvider/DefaultTheme'
const { spacing } = defaultTheme

export interface FlexProps {
  children: React.ReactNode
  flexDirection?: 'row' | 'column'
  justifyContent?:
    | 'space-between'
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-around'
    | 'space-evenly'
    | 'normal'
  alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch'
  gap?: keyof typeof spacing
}

export function Flex({
  children,
  flexDirection = 'row',
  justifyContent = 'normal',
  alignItems = 'flex-start',
  gap = 20,
}: FlexProps) {
  return (
    <div
      className={[
        style.flex,
        style[`flex-jc-${justifyContent}`],
        style[`flex-fd-${flexDirection}`],
        style[`flex-ai-${alignItems}`],
      ].join(' ')}
      style={{ gap: spacing[gap] }}
    >
      {children}
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
