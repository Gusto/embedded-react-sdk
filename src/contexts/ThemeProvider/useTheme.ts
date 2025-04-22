import { createContext, useContext } from 'react'

export interface ThemeContextProps {
  container: React.RefObject<HTMLElement>
}
export const ThemeContext = createContext<ThemeContextProps>({} as ThemeContextProps)

export const useTheme = () => useContext(ThemeContext)
