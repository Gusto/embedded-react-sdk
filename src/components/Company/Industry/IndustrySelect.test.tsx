import { describe, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IndustrySelect } from './IndustrySelect'
import { loadAll } from '@/models/NAICSCodes'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'

vi.mock('@/models/NAICSCodes')

describe('IndustrySelect', () => {
  it('renders a list of industries', async () => {
    vi.mocked(loadAll).mockResolvedValue([{ code: 'abcd', title: 'Do Things' }])

    render(
      <ComponentsProvider value={defaultComponents}>
        <ThemeProvider>
          <IndustrySelect />
        </ThemeProvider>
      </ComponentsProvider>,
    )

    await userEvent.type(await screen.findByRole('combobox'), 'Do')
    await screen.findByText('Do Things')
  })

  it('allows an item to be previously selected', async () => {
    vi.mocked(loadAll).mockResolvedValue([{ code: 'abcd', title: 'Do Things' }])

    render(
      <ComponentsProvider value={defaultComponents}>
        <ThemeProvider>
          <IndustrySelect naics_code="abcd" />
        </ThemeProvider>
      </ComponentsProvider>,
    )

    await screen.findByDisplayValue('Do Things')
  })
})
