import type React from 'react'
import { defaultComponents } from '../ComponentAdapter/adapters/defaultComponentAdapter'
import {
  GustoProviderCustomUIAdapter,
  type GustoProviderProps,
} from './GustoProviderCustomUIAdapter'

export interface GustoApiProps extends GustoProviderProps {
  children?: React.ReactNode
}

const GustoApiProvider: React.FC<GustoApiProps> = props => {
  const { children, components, ...remainingProps } = props

  const mergedComponents = {
    ...defaultComponents,
    ...components,
  }

  return (
    <GustoProviderCustomUIAdapter {...remainingProps} components={mergedComponents}>
      {children}
    </GustoProviderCustomUIAdapter>
  )
}

export { GustoApiProvider }

export const GustoProvider = GustoApiProvider
