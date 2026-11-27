import { createContext } from 'react'

export interface GapContextValue {
  on: boolean
  active: string | null
  setActive: (id: string) => void
}

export const GapContext = createContext<GapContextValue>({
  on: false,
  active: null,
  setActive: () => {},
})

export const ChangeContext = createContext<GapContextValue>({
  on: false,
  active: null,
  setActive: () => {},
})
