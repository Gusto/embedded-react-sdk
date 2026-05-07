import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import type { CompensationInputs } from '../compensationSchema'
import { EditCompensationPresentation } from './EditCompensationPresentation'
import { FlsaStatus } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const minimumWageFixture = [
  {
    uuid: 'mw-1',
    wage: '15.00',
    wageType: 'Regular',
    authority: 'State',
    notes: 'Standard',
  },
] as unknown as MinimumWage[]

const baseDefaults: CompensationInputs = {
  jobTitle: '',
  flsaStatus: undefined as unknown as CompensationInputs['flsaStatus'],
  rate: 0,
  adjustForMinimumWage: false,
  minimumWageId: '',
  paymentUnit: 'Hour',
  stateWcCovered: false,
  stateWcClassCode: '',
  twoPercentShareholder: false,
}

const defaultProps = {
  defaultValues: baseDefaults,
  title: 'Compensation',
  submitCtaLabel: 'Continue',
  canChangeFlsaClassification: true,
  currentCompensationFlsaStatus: undefined as string | undefined,
  otherJobsCount: 0,
  state: undefined as string | undefined,
  minimumWages: [],
  showTwoPercentStakeholder: false,
  isPending: false,
  onSave: vi.fn(),
  onCancel: undefined as (() => void) | undefined,
}

describe('EditCompensationPresentation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('labels', () => {
    it('renders the provided title and submit CTA label', async () => {
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          title="My custom title"
          submitCtaLabel="Save it"
        />,
      )

      expect(await screen.findByRole('heading', { name: 'My custom title' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save it' })).toBeInTheDocument()
    })
  })

  describe('cancel button visibility', () => {
    it('does not render a Cancel button when onCancel is not provided', () => {
      renderWithProviders(<EditCompensationPresentation {...defaultProps} />)

      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    })

    it('renders a Cancel button and invokes onCancel when provided', async () => {
      const onCancel = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<EditCompensationPresentation {...defaultProps} onCancel={onCancel} />)

      await user.click(await screen.findByRole('button', { name: 'Cancel' }))

      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('save submission', () => {
    it('calls onSave with form values when submitted with valid inputs', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<EditCompensationPresentation {...defaultProps} onSave={onSave} />)

      await user.type(screen.getByLabelText('Job Title'), 'My Job')

      await user.click(screen.getByRole('button', { name: /Select an item/i }))
      await user.click(screen.getByRole('option', { name: 'Paid by the hour' }))

      const amount = screen.getByLabelText('Compensation amount')
      await user.clear(amount)
      await user.type(amount, '50')
      await user.tab()

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(onSave).toHaveBeenCalledTimes(1)
      expect(onSave.mock.calls[0]?.[0]).toMatchObject({
        jobTitle: 'My Job',
        flsaStatus: FlsaStatus.NONEXEMPT,
        rate: 50,
        paymentUnit: 'Hour',
      })
    })
  })

  describe('FLSA selection visibility', () => {
    it('hides Employee type select when classification cannot be changed and FLSA is Nonexempt', () => {
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          canChangeFlsaClassification={false}
          currentCompensationFlsaStatus={FlsaStatus.NONEXEMPT}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Side Gig',
            flsaStatus: FlsaStatus.NONEXEMPT,
            rate: 25,
          }}
        />,
      )

      expect(screen.queryByText('Employee type')).not.toBeInTheDocument()
    })

    it('shows Employee type select when classification can be changed', async () => {
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          canChangeFlsaClassification
          currentCompensationFlsaStatus={FlsaStatus.NONEXEMPT}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Main Gig',
            flsaStatus: FlsaStatus.NONEXEMPT,
            rate: 25,
          }}
        />,
      )

      expect(await screen.findByText('Employee type')).toBeInTheDocument()
    })

    it('still submits flsaStatus from defaultValues when the FLSA select is hidden', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          onSave={onSave}
          canChangeFlsaClassification={false}
          currentCompensationFlsaStatus={FlsaStatus.NONEXEMPT}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Side Gig',
            flsaStatus: FlsaStatus.NONEXEMPT,
            rate: 25,
          }}
        />,
      )

      expect(screen.queryByText('Employee type')).not.toBeInTheDocument()

      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      expect(onSave).toHaveBeenCalledTimes(1)
      expect(onSave.mock.calls[0]?.[0]).toMatchObject({
        flsaStatus: FlsaStatus.NONEXEMPT,
        rate: 25,
      })
    })

    it('shows Employee type select when classification cannot be changed but FLSA is non-Nonexempt', async () => {
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          canChangeFlsaClassification={false}
          currentCompensationFlsaStatus={FlsaStatus.EXEMPT}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Side Gig',
            flsaStatus: FlsaStatus.EXEMPT,
            rate: 100000,
            paymentUnit: 'Year',
          }}
        />,
      )

      expect(await screen.findByText('Employee type')).toBeInTheDocument()
    })
  })

  describe('FLSA change warning', () => {
    it('does not show warning when there are no other jobs', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          canChangeFlsaClassification
          currentCompensationFlsaStatus={FlsaStatus.NONEXEMPT}
          otherJobsCount={0}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Main Gig',
            flsaStatus: FlsaStatus.NONEXEMPT,
            rate: 25,
          }}
          onCancel={vi.fn()}
        />,
      )

      await user.click(await screen.findByRole('button', { name: /Paid by the hour/i }))
      await user.click(screen.getByRole('option', { name: /Salary\/No overtime/i }))

      expect(screen.queryByText(/Changing this employee's classification/)).not.toBeInTheDocument()
    })

    it('shows warning when changing FLSA from Nonexempt and there are other jobs', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          canChangeFlsaClassification
          currentCompensationFlsaStatus={FlsaStatus.NONEXEMPT}
          otherJobsCount={1}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Main Gig',
            flsaStatus: FlsaStatus.NONEXEMPT,
            rate: 25,
          }}
          onCancel={vi.fn()}
        />,
      )

      await user.click(await screen.findByRole('button', { name: /Paid by the hour/i }))
      await user.click(screen.getByRole('option', { name: /Salary\/No overtime/i }))

      expect(await screen.findByText(/Changing this employee's classification/)).toBeInTheDocument()
    })
  })

  describe('two percent shareholder', () => {
    it('shows the checkbox when showTwoPercentStakeholder is true', async () => {
      renderWithProviders(
        <EditCompensationPresentation {...defaultProps} showTwoPercentStakeholder />,
      )

      expect(
        await screen.findByLabelText('Select if employee is a 2% shareholder'),
      ).toBeInTheDocument()
    })

    it('hides the checkbox by default', () => {
      renderWithProviders(<EditCompensationPresentation {...defaultProps} />)

      expect(
        screen.queryByLabelText('Select if employee is a 2% shareholder'),
      ).not.toBeInTheDocument()
    })
  })

  describe('Washington state workers comp', () => {
    it('shows workers compensation fields when state is WA', async () => {
      renderWithProviders(<EditCompensationPresentation {...defaultProps} state="WA" />)

      expect(await screen.findByText("Workers' compensation coverage")).toBeInTheDocument()
    })

    it('does not show workers compensation fields for other states', () => {
      renderWithProviders(<EditCompensationPresentation {...defaultProps} state="CA" />)

      expect(screen.queryByText("Workers' compensation coverage")).not.toBeInTheDocument()
    })

    it('reveals the risk class code combo only when employee is marked as covered', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EditCompensationPresentation {...defaultProps} state="WA" />)

      expect(screen.queryByText('Risk class code')).not.toBeInTheDocument()

      await user.click(await screen.findByRole('radio', { name: 'Yes, this employee is covered' }))

      expect(await screen.findByText('Risk class code')).toBeInTheDocument()
    })
  })

  describe('FLSA-driven side effects', () => {
    it('selecting Owner forces paymentUnit to Paycheck on submit', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<EditCompensationPresentation {...defaultProps} onSave={onSave} />)

      await user.type(await screen.findByLabelText('Job Title'), 'Founder')

      await user.click(screen.getByRole('button', { name: /Select an item/i }))
      await user.click(screen.getByRole('option', { name: "Owner's draw" }))

      const amount = screen.getByLabelText('Compensation amount')
      await user.clear(amount)
      await user.type(amount, '5000')
      await user.tab()

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(onSave).toHaveBeenCalledTimes(1)
      expect(onSave.mock.calls[0]?.[0]).toMatchObject({
        flsaStatus: FlsaStatus.OWNER,
        paymentUnit: 'Paycheck',
        rate: 5000,
      })
    })

    it('selecting Commission Only Eligible for overtime forces paymentUnit to Year and rate to 0', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<EditCompensationPresentation {...defaultProps} onSave={onSave} />)

      await user.type(await screen.findByLabelText('Job Title'), 'Sales')

      await user.click(screen.getByRole('button', { name: /Select an item/i }))
      await user.click(
        screen.getByRole('option', { name: 'Commission Only/Eligible for overtime' }),
      )

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(onSave).toHaveBeenCalledTimes(1)
      expect(onSave.mock.calls[0]?.[0]).toMatchObject({
        flsaStatus: FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
        paymentUnit: 'Year',
        rate: 0,
      })
    })

    it('selecting Commission Only/No Overtime forces paymentUnit to Year and rate to 0', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<EditCompensationPresentation {...defaultProps} onSave={onSave} />)

      await user.type(await screen.findByLabelText('Job Title'), 'Sales')

      await user.click(screen.getByRole('button', { name: /Select an item/i }))
      await user.click(screen.getByRole('option', { name: 'Commission Only/No Overtime' }))

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(onSave).toHaveBeenCalledTimes(1)
      expect(onSave.mock.calls[0]?.[0]).toMatchObject({
        flsaStatus: FlsaStatus.COMMISSION_ONLY_EXEMPT,
        paymentUnit: 'Year',
        rate: 0,
      })
    })

    it('reverts paymentUnit to defaultValues.paymentUnit when changing back from Owner to a regular FLSA', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          onSave={onSave}
          defaultValues={{ ...baseDefaults, paymentUnit: 'Week' }}
        />,
      )

      await user.type(await screen.findByLabelText('Job Title'), 'Mixed')

      await user.click(screen.getByRole('button', { name: /Select an item/i }))
      await user.click(screen.getByRole('option', { name: "Owner's draw" }))

      await user.click(screen.getByRole('button', { name: /Owner's draw/i }))
      await user.click(screen.getByRole('option', { name: 'Paid by the hour' }))

      const amount = screen.getByLabelText('Compensation amount')
      await user.clear(amount)
      await user.type(amount, '50')
      await user.tab()

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(onSave).toHaveBeenCalledTimes(1)
      expect(onSave.mock.calls[0]?.[0]).toMatchObject({
        flsaStatus: FlsaStatus.NONEXEMPT,
        paymentUnit: 'Week',
        rate: 50,
      })
    })
  })

  describe('adjust for minimum wage', () => {
    it('shows the switch when FLSA is Nonexempt, minimum wages are provided, and the state supports tip credits', async () => {
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          state="CO"
          minimumWages={minimumWageFixture}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Server',
            flsaStatus: FlsaStatus.NONEXEMPT,
            rate: 25,
          }}
        />,
      )

      expect(
        await screen.findByRole('switch', { name: 'Adjust for minimum wage' }),
      ).toBeInTheDocument()
    })

    it('hides the switch when FLSA is not Nonexempt', () => {
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          state="CO"
          minimumWages={minimumWageFixture}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Manager',
            flsaStatus: FlsaStatus.EXEMPT,
            rate: 100000,
            paymentUnit: 'Year',
          }}
        />,
      )

      expect(
        screen.queryByRole('switch', { name: 'Adjust for minimum wage' }),
      ).not.toBeInTheDocument()
    })

    it('hides the switch when no minimum wages are provided', () => {
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          state="CO"
          minimumWages={[]}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Server',
            flsaStatus: FlsaStatus.NONEXEMPT,
            rate: 25,
          }}
        />,
      )

      expect(
        screen.queryByRole('switch', { name: 'Adjust for minimum wage' }),
      ).not.toBeInTheDocument()
    })

    it('hides the switch when state does not support tip credits', () => {
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          state="CA"
          minimumWages={minimumWageFixture}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Server',
            flsaStatus: FlsaStatus.NONEXEMPT,
            rate: 25,
          }}
        />,
      )

      expect(
        screen.queryByRole('switch', { name: 'Adjust for minimum wage' }),
      ).not.toBeInTheDocument()
    })

    it('reveals the minimum wage select only when the switch is toggled on', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <EditCompensationPresentation
          {...defaultProps}
          state="CO"
          minimumWages={minimumWageFixture}
          defaultValues={{
            ...baseDefaults,
            jobTitle: 'Server',
            flsaStatus: FlsaStatus.NONEXEMPT,
            rate: 25,
          }}
        />,
      )

      expect(screen.queryByText('Minimum wage')).not.toBeInTheDocument()

      await user.click(await screen.findByRole('switch', { name: 'Adjust for minimum wage' }))

      expect(await screen.findByText('Minimum wage')).toBeInTheDocument()
    })
  })
})
