import type { GlobalProvider } from '@ladle/react'
import '../src/styles/sdk.scss'
import { useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { PlainComponentAdapter } from './adapters/PlainComponentAdapter'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { GustoProviderCustomUIAdapter } from '@/contexts'
import { SDKI18next } from '@/contexts/GustoProvider/SDKI18next'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'

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
    <I18nextProvider i18n={SDKI18next}>
      <LocaleProvider locale="en-US" currency="USD">
        <ThemeProvider>
          <GustoProviderCustomUIAdapter
            config={{ baseUrl: '' }}
            components={mode === 'plain' ? PlainComponentAdapter : defaultComponents}
          >
            {children}
            <AdapterToggle mode={mode} setMode={setMode} />
          </GustoProviderCustomUIAdapter>
        </ThemeProvider>
      </LocaleProvider>
    </I18nextProvider>
  )
}
