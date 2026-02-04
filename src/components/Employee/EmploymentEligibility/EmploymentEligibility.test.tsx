import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmploymentEligibility } from './EmploymentEligibility'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('EmploymentEligibility', () => {
  const defaultProps = {
    onEvent: vi.fn(),
  }

  describe('rendering', () => {
    it('renders the heading and subtitle', async () => {
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      expect(
        screen.getByText(/The federal government requires verification of your eligibility/i),
      ).toBeInTheDocument()
    })

    it('renders the select input with label and description', async () => {
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      expect(screen.getByText('I am...')).toBeInTheDocument()
      expect(
        screen.getByText(/This information will be used to fill out Form I-9/i),
      ).toBeInTheDocument()
    })

    it('does not render the alert when no status is selected', async () => {
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('status selection', () => {
    it('renders the alert with citizen description when citizen is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      const selectButton = screen.getByRole('button', { name: /I am/i })
      await user.click(selectButton)

      const citizenOption = await screen.findByRole('option', {
        name: /citizen of the United States/i,
      })
      await user.click(citizenOption)

      const alert = await screen.findByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent(/citizen is someone who was born or naturalized/i)
    })

    it('renders the alert with lawful permanent resident description when selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      const selectButton = screen.getByRole('button', { name: /I am/i })
      await user.click(selectButton)

      const lprOption = await screen.findByRole('option', {
        name: /lawful permanent resident/i,
      })
      await user.click(lprOption)

      const alert = await screen.findByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent(
        /lawful permanent resident is someone who is not a US citizen/i,
      )
    })

    it('renders the alert with noncitizen national description when selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      const selectButton = screen.getByRole('button', { name: /I am/i })
      await user.click(selectButton)

      const noncitizenzOption = await screen.findByRole('option', {
        name: /noncitizen national/i,
      })
      await user.click(noncitizenzOption)

      const alert = await screen.findByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent(/noncitizen national is someone born in American Samoa/i)
    })

    it('renders the alert with noncitizen authorized description when selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      const selectButton = screen.getByRole('button', { name: /I am/i })
      await user.click(selectButton)

      const authorizedOption = await screen.findByRole('option', {
        name: /noncitizen authorized to work/i,
      })
      await user.click(authorizedOption)

      const alert = await screen.findByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent(/noncitizen authorized to work/i)
    })
  })

  describe('noncitizen authorized to work fields', () => {
    it('shows date picker and authorization document radio group when noncitizen authorized is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      const selectButton = screen.getByRole('button', { name: /I am/i })
      await user.click(selectButton)

      const authorizedOption = await screen.findByRole('option', {
        name: /noncitizen authorized to work/i,
      })
      await user.click(authorizedOption)

      expect(screen.getByText('Authorized to work until')).toBeInTheDocument()
      expect(screen.getByText('Authorization document')).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'USCIS or A-Number' })).toBeInTheDocument()
    })

    it('shows USCIS input when USCIS or A-Number option is selected (default)', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      const selectButton = screen.getByRole('button', { name: /I am/i })
      await user.click(selectButton)

      const authorizedOption = await screen.findByRole('option', {
        name: /noncitizen authorized to work/i,
      })
      await user.click(authorizedOption)

      expect(
        screen.getByText('Fill in a 7-9 digit USCIS Number or A-Number (include the "A")'),
      ).toBeInTheDocument()
    })

    it('shows I-94 input when Form I-94 option is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      const selectButton = screen.getByRole('button', { name: /I am/i })
      await user.click(selectButton)

      const authorizedOption = await screen.findByRole('option', {
        name: /noncitizen authorized to work/i,
      })
      await user.click(authorizedOption)

      const i94Radio = screen.getByRole('radio', { name: 'Form I-94' })
      await user.click(i94Radio)

      expect(screen.getByText('Form I-94 admission number')).toBeInTheDocument()
      expect(screen.getByText('Fill in your 11 digit I-94 admission number')).toBeInTheDocument()
    })

    it('shows foreign passport inputs when Foreign passport option is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      const selectButton = screen.getByRole('button', { name: /I am/i })
      await user.click(selectButton)

      const authorizedOption = await screen.findByRole('option', {
        name: /noncitizen authorized to work/i,
      })
      await user.click(authorizedOption)

      const passportRadio = screen.getByRole('radio', { name: 'Foreign passport' })
      await user.click(passportRadio)

      expect(screen.getByText('Foreign passport number')).toBeInTheDocument()
      expect(screen.getByText('Country of Issuance')).toBeInTheDocument()
      expect(screen.getByText('The country that issues your passport')).toBeInTheDocument()
    })
  })

  describe('lawful permanent resident fields', () => {
    it('shows only USCIS input when lawful permanent resident is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EmploymentEligibility {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Employment Eligibility' })
      const selectButton = screen.getByRole('button', { name: /I am/i })
      await user.click(selectButton)

      const lprOption = await screen.findByRole('option', {
        name: /lawful permanent resident/i,
      })
      await user.click(lprOption)

      expect(
        screen.getByText('Fill in a 7-9 digit USCIS Number or A-Number (include the "A")'),
      ).toBeInTheDocument()
      expect(screen.queryByText('Authorized to work until')).not.toBeInTheDocument()
      expect(screen.queryByText('Authorization document')).not.toBeInTheDocument()
    })
  })
})
