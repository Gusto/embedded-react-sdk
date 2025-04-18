import type { GlobalProvider } from '@ladle/react'
import '../src/styles/sdk.scss'
import { useState } from 'react'
import { PlainComponentAdapter } from './adapters/PlainComponentAdapter'
import { MUIComponentAdapter } from './adapters/MUIComponentAdapter'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'

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

  const getAdapter = () => {
    if (mode === 'plain') return PlainComponentAdapter
    if (mode === 'mui') return MUIComponentAdapter
    return {}
  }

  return (
    <ComponentsProvider value={getAdapter()}>
      <ThemeProvider>
        {children}
        <AdapterToggle mode={mode} setMode={setMode} />
      </ThemeProvider>
    </ComponentsProvider>
  )
}
