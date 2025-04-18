/// <reference types="vite-plugin-svgr/client" />

declare module '*.svg?react' {
  import * as React from 'react'

  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>

  export default ReactComponent
}

declare module '*.png' {
  const content: string
  export default content
}
