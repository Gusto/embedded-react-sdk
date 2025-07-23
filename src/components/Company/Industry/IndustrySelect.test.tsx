import { beforeAll, describe, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockResizeObserver } from 'jsdom-testing-mocks'
// eslint-disable-next-line no-restricted-imports
import type { VirtualizerProps } from 'react-aria-components'
import { IndustrySelect } from './IndustrySelect'
import { loadAll } from '@/models/NAICSCodes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

vi.mock('@/models/NAICSCodes')
vi.mock(import('react-aria-components'), async originalImport => {
  const original = await originalImport()
  return {
    ...original,
    Virtualizer: <T,>({ children }: VirtualizerProps<T>) => <div>{children}</div>,
  }
})

beforeAll(mockResizeObserver)

describe('IndustrySelect', () => {
  it('renders a list of industries', async () => {
    vi.mocked(loadAll).mockResolvedValue([{ code: 'abcd', title: 'Do Things' }])

    renderWithProviders(<IndustrySelect />)

    await userEvent.type(await screen.findByRole('combobox'), 'Do')
    await screen.findByText('Do Things')
  })

  it('allows an item to be previously selected', async () => {
    vi.mocked(loadAll).mockResolvedValue([{ code: 'abcd', title: 'Do Things' }])

    renderWithProviders(<IndustrySelect naics_code="abcd" />)

    await screen.findByDisplayValue('Do Things')
  })
})
