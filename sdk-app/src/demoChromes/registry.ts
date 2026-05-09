import { AcmeHrChrome } from './AcmeHrChrome'
import type { DemoChromeEntry } from './types'

export const SDK_NATIVE_CHROME_ID = 'sdk-native'

export const demoChromes: DemoChromeEntry[] = [
  {
    id: SDK_NATIVE_CHROME_ID,
    label: 'SDK Dev App (default)',
    description: 'The standard SDK dev app chrome — TopBar, Sidebar, Events Log.',
    Chrome: () => null,
  },
  {
    id: 'acme-hr',
    label: 'Acme HR (partner demo)',
    description: 'Generic partner-styled chrome with branded header, left nav, and footer.',
    Chrome: AcmeHrChrome,
  },
]

export function findDemoChrome(id: string | undefined): DemoChromeEntry | undefined {
  return demoChromes.find(c => c.id === id)
}
