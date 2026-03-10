import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { WithholdingPayPeriod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import { OffCycleTaxWithholdingTable } from './OffCycleTaxWithholdingTable'
import type {
  OffCycleTaxWithholdingConfig,
  WageTypeGroup,
} from './OffCycleTaxWithholdingTableTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const wageTypeGroups: WageTypeGroup[] = [
  {
    category: 'regular',
    label: 'Regular hours, regular wages, tips',
    description:
      "These earnings should be taxed at a rate that matches your employees' regular pay schedule.",
  },
  {
    category: 'supplemental',
    label: 'Supplemental wages, bonus wages, commission',
    description:
      'These are typically taxed at the rate required by the IRS for federal income taxes and by the state for state income taxes.',
  },
  {
    category: 'reimbursement',
    label: 'Reimbursements',
  },
]

function renderTable(config: OffCycleTaxWithholdingConfig) {
  return renderWithProviders(
    <OffCycleTaxWithholdingTable
      wageTypeGroups={wageTypeGroups}
      config={config}
      onEditClick={vi.fn()}
    />,
  )
}

describe('OffCycleTaxWithholdingTable', () => {
  describe('pay period frequency display', () => {
    it('displays "every other week" for EveryOtherWeek pay period', async () => {
      renderTable({
        withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
        withholdingRate: 'supplemental',
      })

      await waitFor(() => {
        expect(screen.getByText(/regular wages, paid every other week/i)).toBeInTheDocument()
      })
    })

    it('displays "monthly" for Monthly pay period', async () => {
      renderTable({
        withholdingPayPeriod: WithholdingPayPeriod.Monthly,
        withholdingRate: 'supplemental',
      })

      await waitFor(() => {
        expect(screen.getByText(/regular wages, paid monthly/i)).toBeInTheDocument()
      })

      expect(screen.queryByText(/every other week/i)).not.toBeInTheDocument()
    })

    it('displays "every week" for EveryWeek pay period', async () => {
      renderTable({
        withholdingPayPeriod: WithholdingPayPeriod.EveryWeek,
        withholdingRate: 'supplemental',
      })

      await waitFor(() => {
        expect(screen.getByText(/regular wages, paid every week/i)).toBeInTheDocument()
      })
    })

    it('displays "twice per month" for TwicePerMonth pay period', async () => {
      renderTable({
        withholdingPayPeriod: WithholdingPayPeriod.TwicePerMonth,
        withholdingRate: 'supplemental',
      })

      await waitFor(() => {
        expect(screen.getByText(/regular wages, paid twice per month/i)).toBeInTheDocument()
      })
    })
  })

  describe('withholding rate display', () => {
    it('shows supplemental 22% text when rate is supplemental', async () => {
      renderTable({
        withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
        withholdingRate: 'supplemental',
      })

      await waitFor(() => {
        expect(screen.getByText(/supplemental 22%/i)).toBeInTheDocument()
      })
    })

    it('shows regular wages text for both rows when rate is regular', async () => {
      renderTable({
        withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
        withholdingRate: 'regular',
      })

      await waitFor(() => {
        expect(screen.queryByText(/supplemental 22%/i)).not.toBeInTheDocument()
      })

      const regularWagesTexts = screen.getAllByText(/regular wages, paid every other week/i)
      expect(regularWagesTexts).toHaveLength(2)
    })

    it('uses correct frequency in both rows when rate is regular', async () => {
      renderTable({
        withholdingPayPeriod: WithholdingPayPeriod.Monthly,
        withholdingRate: 'regular',
      })

      await waitFor(() => {
        expect(screen.getAllByText(/regular wages, paid monthly/i)).toHaveLength(2)
      })
    })
  })

  it('always shows "Not taxed" for reimbursements', async () => {
    renderTable({
      withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
      withholdingRate: 'supplemental',
    })

    await waitFor(() => {
      expect(screen.getByText(/not taxed/i)).toBeInTheDocument()
    })
  })
})
