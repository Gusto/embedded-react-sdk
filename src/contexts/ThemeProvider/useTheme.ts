import { createContext, useContext } from 'react'

/** @internal */
export interface ThemeContextProps {
  /** Ref to the element used as the portal container for SDK overlays. */
  container: React.RefObject<HTMLElement | null>
}
/** @internal */
export const ThemeContext = createContext({} as ThemeContextProps)

/** @internal */
export const useTheme = () => useContext(ThemeContext)
