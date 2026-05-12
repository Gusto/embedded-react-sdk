import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { DatePickerField } from './DatePickerField'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { assertDefined, assertInstanceOf } from '@/test-utils/assertions'

vi.mock('@/assets/icons/caret-down.svg?react', () => ({
  default: () => <div data-testid="caret-down" />,
}))
vi.mock('@/assets/icons/caret-left.svg?react', () => ({
  default: () => <div data-testid="caret-left" />,
}))
vi.mock('@/assets/icons/caret-right.svg?react', () => ({
  default: () => <div data-testid="caret-right" />,
}))

const LABEL = 'Test Date'

interface DateTestFormValues {
  testDate: Date | null | string
}

const TestForm = ({
  defaultValues,
  onSubmit = vi.fn<SubmitHandler<DateTestFormValues>>(),
}: {
  defaultValues: DateTestFormValues
  onSubmit?: SubmitHandler<DateTestFormValues>
}) => {
  const methods = useForm<DateTestFormValues>({ defaultValues })
  return (
    <GustoTestProvider>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <DatePickerField name="testDate" label={LABEL} />
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    </GustoTestProvider>
  )
}

async function typeDate(
  user: ReturnType<typeof userEvent.setup>,
  { month, day, year }: { month: string; day: string; year: string },
) {
  const group = screen.getByRole('group', { name: new RegExp(LABEL, 'i') })
  await user.type(within(group).getByRole('spinbutton', { name: /^month/i }), month)
  await user.type(within(group).getByRole('spinbutton', { name: /^day/i }), day)
  await user.type(within(group).getByRole('spinbutton', { name: /^year/i }), year)
}

function getDateSegments() {
  const group = screen.getByRole('group', { name: new RegExp(LABEL, 'i') })
  return {
    month: within(group).getByRole('spinbutton', { name: /^month/i }),
    day: within(group).getByRole('spinbutton', { name: /^day/i }),
    year: within(group).getByRole('spinbutton', { name: /^year/i }),
  }
}

const JUNE_15_2026 = { month: '06', day: '15', year: '2026' }

describe('DatePickerField', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Date mode (defaultValue is Date | null)', () => {
    it('submits a Date object at local midnight when user enters a date', async () => {
      const onSubmit = vi.fn<SubmitHandler<DateTestFormValues>>()
      render(<TestForm defaultValues={{ testDate: null }} onSubmit={onSubmit} />)

      await typeDate(user, JUNE_15_2026)
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
      const submitted = onSubmit.mock.calls[0]?.[0].testDate
      assertInstanceOf(submitted, Date)
      expect(submitted.getFullYear()).toBe(2026)
      expect(submitted.getMonth()).toBe(5) // June = index 5
      expect(submitted.getDate()).toBe(15)
    })

    it('renders correct date segments when given a Date defaultValue', () => {
      render(<TestForm defaultValues={{ testDate: new Date(2026, 5, 15) }} onSubmit={vi.fn()} />)

      const { month, day, year } = getDateSegments()
      expect(month).toHaveAttribute('aria-valuenow', '6')
      expect(day).toHaveAttribute('aria-valuenow', '15')
      expect(year).toHaveAttribute('aria-valuenow', '2026')
    })

    it('submits null when the field is left empty', async () => {
      const onSubmit = vi.fn<SubmitHandler<DateTestFormValues>>()
      render(<TestForm defaultValues={{ testDate: null }} onSubmit={onSubmit} />)

      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ testDate: null }),
          expect.anything(),
        )
      })
    })
  })

  describe('String mode (defaultValue is string)', () => {
    it('submits a YYYY-MM-DD string when user enters a date', async () => {
      const onSubmit = vi.fn<SubmitHandler<DateTestFormValues>>()
      render(<TestForm defaultValues={{ testDate: '' }} onSubmit={onSubmit} />)

      await typeDate(user, JUNE_15_2026)
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ testDate: '2026-06-15' }),
          expect.anything(),
        )
      })
    })

    it('renders correct date segments when given a YYYY-MM-DD string defaultValue', () => {
      render(<TestForm defaultValues={{ testDate: '2026-06-15' }} onSubmit={vi.fn()} />)

      const { month, day, year } = getDateSegments()
      expect(month).toHaveAttribute('aria-valuenow', '6')
      expect(day).toHaveAttribute('aria-valuenow', '15')
      expect(year).toHaveAttribute('aria-valuenow', '2026')
    })

    it('submits an empty string when the field is left empty', async () => {
      const onSubmit = vi.fn<SubmitHandler<DateTestFormValues>>()
      render(<TestForm defaultValues={{ testDate: '' }} onSubmit={onSubmit} />)

      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ testDate: '' }),
          expect.anything(),
        )
      })
    })
  })

  describe('UTC+ timezone edge cases', () => {
    beforeEach(() => {
      vi.stubEnv('TZ', 'Europe/Paris') // UTC+2 in summer: local midnight June 15 = UTC June 14 22:00
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('Date mode: submits the correct date when local midnight falls in UTC previous day', async () => {
      const onSubmit = vi.fn<SubmitHandler<DateTestFormValues>>()
      // June 10 initial value keeps the calendar in June 2026 despite the UTC shift
      render(<TestForm defaultValues={{ testDate: new Date(2026, 5, 10) }} onSubmit={onSubmit} />)

      // Open the calendar via the toggle button inside the date picker group
      const group = screen.getByRole('group', { name: new RegExp(LABEL, 'i') })
      await user.click(within(group).getByRole('button'))
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

      const june15 = screen
        .getAllByRole('button')
        .find(btn => btn.getAttribute('aria-label')?.includes('June 15'))
      assertDefined(june15)
      await user.click(june15)

      await user.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })

      const submitted = onSubmit.mock.calls[0]?.[0].testDate
      assertInstanceOf(submitted, Date)
      expect(submitted.getFullYear()).toBe(2026)
      expect(submitted.getMonth()).toBe(5) // June = index 5
      expect(submitted.getDate()).toBe(15)
    })

    it('String mode: submits the correct YYYY-MM-DD when local midnight falls in UTC previous day', async () => {
      const onSubmit = vi.fn<SubmitHandler<DateTestFormValues>>()
      render(<TestForm defaultValues={{ testDate: '2026-06-10' }} onSubmit={onSubmit} />)

      const group = screen.getByRole('group', { name: new RegExp(LABEL, 'i') })
      await user.click(within(group).getByRole('button'))
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

      const june15 = screen
        .getAllByRole('button')
        .find(btn => btn.getAttribute('aria-label')?.includes('June 15'))
      assertDefined(june15)
      await user.click(june15)

      await user.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ testDate: '2026-06-15' }),
        expect.anything(),
      )
    })
  })
})
