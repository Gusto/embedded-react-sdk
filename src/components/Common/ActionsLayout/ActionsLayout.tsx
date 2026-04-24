import { Children, Fragment, isValidElement, type ReactNode } from 'react'
import { Grid, type GridProps } from '../Grid/Grid'

interface ActionsLayoutProps {
  children: React.ReactNode
  justifyContent?: GridProps['justifyContent']
}

function countGridChildren(children: ReactNode): number {
  let count = 0
  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === Fragment) {
      const fragmentProps = child.props as { children?: ReactNode }
      count += countGridChildren(fragmentProps.children)
    } else if (child != null && typeof child !== 'boolean') {
      count++
    }
  })
  return count
}

export const ActionsLayout = ({ children, justifyContent = 'end' }: ActionsLayoutProps) => {
  const childCount = countGridChildren(children)
  return (
    <Grid
      gridTemplateColumns={{
        base: '1fr',
        small: `repeat(${childCount}, max-content)`,
      }}
      justifyContent={justifyContent}
      gap={12}
    >
      {children}
    </Grid>
  )
}
