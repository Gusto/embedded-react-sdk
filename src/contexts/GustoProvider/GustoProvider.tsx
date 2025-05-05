import type React from 'react'
import { defaultComponents } from '../ComponentAdapter/adapters/defaultComponentAdapter'
import type { ComponentsContextType } from '../ComponentAdapter/useComponentContext'
import {
  GustoProviderCustomUIAdapter,
  type GustoProviderProps,
} from './GustoProviderCustomUIAdapter'

export interface GustoApiProps extends Omit<GustoProviderProps, 'components'> {
  components?: Partial<ComponentsContextType>
  children?: React.ReactNode
}

const GustoProvider: React.FC<GustoApiProps> = props => {
  const { children, components = {}, ...remainingProps } = props

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

export { GustoProvider }

/** @deprecated Import from `GustoProvider` instead */
export const GustoApiProvider = GustoProvider
