import type { GlobalProvider } from '@ladle/react'
import '../src/styles/sdk.scss'
import { ThemeProvider } from '@/contexts/ThemeProvider'

export const Provider: GlobalProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)
