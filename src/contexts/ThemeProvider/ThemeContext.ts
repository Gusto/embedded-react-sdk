import { createContext } from 'react'

export interface ThemeContextProps {
  container: React.RefObject<HTMLElement>
}

export const ThemeContext = createContext<ThemeContextProps>({} as ThemeContextProps)
