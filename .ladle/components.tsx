import type { GlobalProvider } from '@ladle/react'
import '../src/styles/sdk.scss'
import { useState, useMemo } from 'react'
import { PlainComponentAdapter } from './adapters/PlainComponentAdapter'
import { MUIComponentAdapter } from './adapters/MUIComponentAdapter'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import type { ComponentsContextType } from '@/contexts/ComponentAdapter/useComponentContext'

type AdapterMode = 'default' | 'plain' | 'mui'

const AdapterToggle = ({
  mode,
  setMode,
}: {
  mode: AdapterMode
  setMode: (mode: AdapterMode) => void
}) => {
  const getNextMode = () => {
    if (mode === 'default') return 'plain'
    if (mode === 'plain') return 'mui'
    return 'default'
  }

  const getButtonColor = () => {
    if (mode === 'default') return '#55aa55'
    if (mode === 'plain') return '#5555aa'
    return '#aa5555'
  }

  const getButtonText = () => {
    if (mode === 'default') return 'React Aria'
    if (mode === 'plain') return 'Plain HTML'
    return 'Material UI'
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
      }}
    >
      <button
        onClick={() => {
          setMode(getNextMode())
        }}
        style={{
          background: getButtonColor(),
          color: 'white',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: 'pointer',
        }}
      >
        {getButtonText()}
      </button>
    </div>
  )
}

export const Provider: GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<AdapterMode>('default')

  // Use useMemo to recalculate adapter when mode changes
  const adapter = useMemo(() => {
    if (mode === 'plain') return PlainComponentAdapter as unknown as ComponentsContextType
    if (mode === 'mui') return MUIComponentAdapter as unknown as ComponentsContextType
    return defaultComponents
  }, [mode]) // Dependency on mode ensures recalculation when mode changes

  return (
    <ComponentsProvider value={adapter}>
      <ThemeProvider>
        {children}
        <AdapterToggle mode={mode} setMode={setMode} />
      </ThemeProvider>
    </ComponentsProvider>
  )
}
