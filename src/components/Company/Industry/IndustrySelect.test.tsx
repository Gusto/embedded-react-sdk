import { describe, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { loadAll } from '@/models/NAICSCodes'
import { IndustrySelect } from './IndustrySelect'
import { ThemeProvider } from '@/contexts'
import userEvent from '@testing-library/user-event'

vi.mock('@/models/NAICSCodes')

describe('IndustrySelect', () => {
  it('renders a list of industries', async () => {
    vi.mocked(loadAll).mockResolvedValue([{ code: 'abcd', title: 'Do Things' }])

    render(
      <ThemeProvider>
        <IndustrySelect />
      </ThemeProvider>,
    )

    await userEvent.type(await screen.findByRole('combobox'), 'Do')
    await screen.findByText('Do Things')
  })

  it('allows an item to be previously selected', async () => {
    vi.mocked(loadAll).mockResolvedValue([{ code: 'abcd', title: 'Do Things' }])

    render(
      <ThemeProvider>
        <IndustrySelect naics_code="abcd" />
      </ThemeProvider>,
    )

    await screen.findByDisplayValue('Do Things')
  })
})
