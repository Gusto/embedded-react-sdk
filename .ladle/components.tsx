import type { GlobalProvider } from '@ladle/react'
import '../src/styles/sdk.scss'
import { useState } from 'react'
import { PlainComponentAdapter } from './adapters/PlainComponentAdapter'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'

const AdapterToggle = ({
  mode,
  setMode,
}: {
  mode: 'default' | 'plain'
  setMode: (mode: 'default' | 'plain') => void
}) => {
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
          setMode(mode === 'default' ? 'plain' : 'default')
        }}
        style={{
          background: mode === 'default' ? '#55aa55' : '#5555aa',
          color: 'white',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: 'pointer',
        }}
      >
        {mode === 'default' ? 'React Aria' : 'Plain HTML'}
      </button>
    </div>
  )
}

export const Provider: GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<'default' | 'plain'>('default')
  return (
    <ComponentsProvider value={mode === 'plain' ? PlainComponentAdapter : defaultComponents}>
      <ThemeProvider>
        {children}
        <AdapterToggle mode={mode} setMode={setMode} />
      </ThemeProvider>
    </ComponentsProvider>
  )
}
