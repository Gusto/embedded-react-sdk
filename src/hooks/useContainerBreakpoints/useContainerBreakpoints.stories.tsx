import React from 'react'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

// Adding a meta object for title
export default {
  title: 'Utils/Hooks/ContainerBreakpoints', // Creates nesting structure
}

export const ContainerBreakpoints = () => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({
    ref: containerRef,
  })
  const Components = useComponentContext()

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      Currently emitting the following breakpoints
      <Components.List items={breakpoints} />
    </div>
  )
}
