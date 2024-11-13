import { createContext } from 'react'
import { GustoClient } from './client'

type GustoApiContextType = {
  GustoClient: GustoClient
}

export const GustoApiContext = createContext<GustoApiContextType | null>(null)
