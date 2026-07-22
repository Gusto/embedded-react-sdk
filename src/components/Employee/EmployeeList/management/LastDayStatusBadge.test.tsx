import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import type { Termination } from '@gusto/embedded-api/models/components/termination'
import { LastDayStatusBadge } from './LastDayStatusBadge'
import { formatBadgeDate } from './badgeDate'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { formatDateToStringDate, addDays } from '@/helpers/dateFormatting'

const termination = (effectiveDate: string): Termination => ({ effectiveDate }) as Termination

describe('LastDayStatusBadge', () => {
  it('renders a last-day badge when the employee has an upcoming termination', () => {
    const futureDate = formatDateToStringDate(addDays(new Date(), 3))!

    renderWithProviders(
      <LastDayStatusBadge terminations={[termination(futureDate)]}>
        {lastDay => `Last day ${lastDay}`}
      </LastDayStatusBadge>,
    )

    expect(screen.getByText(/^Last day /)).toBeInTheDocument()
  })

  it('uses the latest termination date when multiple are scheduled', () => {
    const soonDate = addDays(new Date(), 3)
    const laterDate = addDays(new Date(), 10)
    const expected = formatBadgeDate(laterDate)

    renderWithProviders(
      <LastDayStatusBadge
        terminations={[
          termination(formatDateToStringDate(soonDate)!),
          termination(formatDateToStringDate(laterDate)!),
        ]}
      >
        {lastDay => lastDay}
      </LastDayStatusBadge>,
    )

    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('renders nothing when the employee has no terminations', () => {
    renderWithProviders(
      <LastDayStatusBadge terminations={[]}>{lastDay => `Last day ${lastDay}`}</LastDayStatusBadge>,
    )

    expect(screen.queryByText(/^Last day /)).toBeNull()
  })

  it('renders nothing when the termination has already gone into effect', () => {
    const pastDate = formatDateToStringDate(addDays(new Date(), -3))!

    renderWithProviders(
      <LastDayStatusBadge terminations={[termination(pastDate)]}>
        {lastDay => `Last day ${lastDay}`}
      </LastDayStatusBadge>,
    )

    expect(screen.queryByText(/^Last day /)).toBeNull()
  })
})
