import React from 'react'
import { type ButtonProps as _ButtonProps, Button as _Button } from 'react-aria-components'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

// Adding a meta object for title
export default {
  title: 'Utils/Hooks/ContainerBreakpoints', // Creates nesting structure
}

export const ContainerBreakpoints = () => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({
    ref: containerRef,
  })

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      Currently emitting the following breakpoints
      <ul>
        {breakpoints.map(bp => (
          <li key={bp}>{bp}</li>
        ))}
      </ul>
    </div>
  )
}
