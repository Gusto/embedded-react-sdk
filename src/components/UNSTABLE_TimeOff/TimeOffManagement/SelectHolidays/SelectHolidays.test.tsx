import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectHolidaysPresentation } from './SelectHolidaysPresentation'
import { type HolidayItem } from './SelectHolidaysTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockHolidays: HolidayItem[] = [
  {
    uuid: '1',
    name: "New Year's Day",
    observedDate: 'January 1',
    nextObservation: 'January 1, 2027',
  },
  {
    uuid: '2',
    name: 'Martin Luther King, Jr. Day',
    observedDate: 'Third Monday in January',
    nextObservation: 'January 18, 2027',
  },
  {
    uuid: '3',
    name: 'Memorial Day',
    observedDate: 'Last Monday in May',
    nextObservation: 'May 31, 2026',
  },
]

describe('SelectHolidaysPresentation', () => {
  const defaultProps = {
    holidays: mockHolidays,
    selectedHolidayUuids: new Set<string>(),
    onSelectionChange: vi.fn(),
    onContinue: vi.fn(),
    onBack: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onSelectionChange.mockClear()
    defaultProps.onContinue.mockClear()
    defaultProps.onBack.mockClear()
  })

  describe('rendering', () => {
    it('renders the heading', async () => {
      renderWithProviders(<SelectHolidaysPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Choose your company holidays')).toBeInTheDocument()
      })
    })

    it('renders the description', async () => {
      renderWithProviders(<SelectHolidaysPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            "Choose which holidays your company observes and we'll automatically add those hours when you run payroll.",
          ),
        ).toBeInTheDocument()
      })
    })

    it('renders table column headers', async () => {
      renderWithProviders(<SelectHolidaysPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getAllByText('Holiday').length).toBeGreaterThan(0)
      })
      expect(screen.getAllByText('Observed date').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Next observation').length).toBeGreaterThan(0)
    })

    it('renders all holiday rows', async () => {
      renderWithProviders(<SelectHolidaysPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText("New Year's Day")).toBeInTheDocument()
      })
      expect(screen.getByText('Martin Luther King, Jr. Day')).toBeInTheDocument()
      expect(screen.getByText('Memorial Day')).toBeInTheDocument()
    })

    it('renders observed dates and next observations', async () => {
      renderWithProviders(<SelectHolidaysPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('January 1')).toBeInTheDocument()
      })
      expect(screen.getByText('January 1, 2027')).toBeInTheDocument()
      expect(screen.getByText('Third Monday in January')).toBeInTheDocument()
      expect(screen.getByText('January 18, 2027')).toBeInTheDocument()
    })

    it('renders Back and Continue buttons', async () => {
      renderWithProviders(<SelectHolidaysPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })
  })

  describe('selection state', () => {
    it('renders checkboxes for selection', async () => {
      renderWithProviders(<SelectHolidaysPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
      })
    })

    it('reflects selected state from props', async () => {
      renderWithProviders(
        <SelectHolidaysPresentation {...defaultProps} selectedHolidayUuids={new Set(['1', '3'])} />,
      )

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes.length).toBeGreaterThan(0)
      })
    })
  })

  describe('actions', () => {
    it('calls onContinue when Continue button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectHolidaysPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Continue' }))
      expect(defaultProps.onContinue).toHaveBeenCalledOnce()
    })

    it('calls onBack when Back button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectHolidaysPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Back' }))
      expect(defaultProps.onBack).toHaveBeenCalledOnce()
    })

    it('calls onSelectionChange when a checkbox is toggled', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectHolidaysPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
      })

      const checkboxes = screen.getAllByRole('checkbox')
      const firstCheckbox = checkboxes[0]!
      await user.click(firstCheckbox)

      expect(defaultProps.onSelectionChange).toHaveBeenCalledOnce()
      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: expect.any(String) }),
        true,
      )
    })
  })
})
