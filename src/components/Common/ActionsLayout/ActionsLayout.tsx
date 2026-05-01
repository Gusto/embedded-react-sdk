import { Children } from 'react'
import { Grid, type GridProps } from '../Grid/Grid'

interface ActionsLayoutProps {
  children: React.ReactNode
  justifyContent?: GridProps['justifyContent']
}

export const ActionsLayout = ({ children, justifyContent = 'end' }: ActionsLayoutProps) => {
  const childrenArray = Children.toArray(children).filter(Boolean)
  return (
    <Grid
      gridTemplateColumns={{
        base: '1fr',
        small: `repeat(${childrenArray.length}, max-content)`,
      }}
      justifyContent={justifyContent}
      gap={12}
    >
      {children}
    </Grid>
  )
}
