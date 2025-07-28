// eslint-disable-next-line no-restricted-imports
import type { VirtualizerProps } from 'react-aria-components'
import { vi } from 'vitest'

vi.mock(import('react-aria-components'), async originalImport => {
  const original = await originalImport()
  return {
    ...original,
    Virtualizer: <T,>({ children }: VirtualizerProps<T>) => <div>{children}</div>,
  }
})
