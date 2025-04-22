import { describe, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IndustrySelect } from './IndustrySelect'
import { loadAll } from '@/models/NAICSCodes'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'

vi.mock('@/models/NAICSCodes')

describe('IndustrySelect', () => {
  it('renders a list of industries', async () => {
    vi.mocked(loadAll).mockResolvedValue([{ code: 'abcd', title: 'Do Things' }])

    render(
      <GustoTestApiProvider>
        <IndustrySelect />
      </GustoTestApiProvider>,
    )

    await userEvent.type(await screen.findByRole('combobox'), 'Do')
    await screen.findByText('Do Things')
  })

  it('allows an item to be previously selected', async () => {
    vi.mocked(loadAll).mockResolvedValue([{ code: 'abcd', title: 'Do Things' }])

    render(
      <GustoTestApiProvider>
        <IndustrySelect naics_code="abcd" />
      </GustoTestApiProvider>,
    )

    await screen.findByDisplayValue('Do Things')
  })
})
