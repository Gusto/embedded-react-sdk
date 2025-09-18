import type { ReactElement } from 'react'
import type React from 'react'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import { SDKI18next } from '@/contexts/GustoProvider'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

// Type for dynamic imports of JSON modules
interface TranslationModule {
  default: Record<string, unknown>
}

// Extend ImportMeta to include Vite's glob function
interface ViteImportMeta extends ImportMeta {
  glob: (pattern: string, options: { eager: boolean }) => Record<string, TranslationModule>
}

// Dynamically load all i18n namespace files
// Note: 'common' is already loaded in SDKI18next.ts, so we only need non-common namespaces
const translationFiles = (import.meta as ViteImportMeta).glob('@/i18n/en/*.json', { eager: true })

// Extract and load all namespaces except 'common'
Object.entries(translationFiles).forEach(([filePath, module]) => {
  // Extract namespace from file path: '/src/i18n/en/Company.AddBank.json' -> 'Company.AddBank'
  const fileName = filePath.split('/').pop() // Get 'Company.AddBank.json'
  const namespace = fileName?.replace('.json', '') // Get 'Company.AddBank'

  // Skip 'common' as it's already loaded in SDKI18next.ts
  if (namespace && namespace !== 'common') {
    SDKI18next.addResourceBundle('en', namespace, module.default, true, true)
  }
})

/**
 * Custom render function that wraps the component with necessary providers
 * - ComponentsProvider: Provides UI components
 * - LocaleProvider: Provides locale settings
 * - I18nextProvider: Provides translation functions
 */
export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const TestProvider = ({ children }: { children: React.ReactNode }) => (
    <GustoTestProvider>{children}</GustoTestProvider>
  )

  return render(ui, { wrapper: TestProvider, ...options })
}
