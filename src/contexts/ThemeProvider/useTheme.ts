import { createContext, useContext } from 'react'

export interface ThemeContextProps {
  container: React.RefObject<HTMLElement>
}
export const ThemeContext = createContext({} as ThemeContextProps)

export const useTheme = () => useContext(ThemeContext)
