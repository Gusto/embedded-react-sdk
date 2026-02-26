import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ApiPayrollBlocker } from '../payrollHelpers'
import { PayrollBlockerAlerts } from './PayrollBlockerAlerts'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const createMockBlocker = (overrides: Partial<ApiPayrollBlocker> = {}): ApiPayrollBlocker => ({
  key: 'blocker-1',
  message: 'Test Blocker',
  ...overrides,
})

describe('PayrollBlockerAlerts', () => {
  describe('rendering behavior', () => {
    it('applies custom className when provided', async () => {
      const blockers = [createMockBlocker()]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} className="custom-class" />)
      const alertElement = await screen.findByRole('alert')
      const wrapper = alertElement.closest('div.custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('renders nothing when blockers array is empty', () => {
      renderWithProviders(<PayrollBlockerAlerts blockers={[]} />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('single blocker', () => {
    it('displays default title when translation key not found', async () => {
      const blocker = createMockBlocker({ key: 'blocker_1', message: 'Single blocker message' })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)
      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toHaveAccessibleName('Unknown blocker')
    })

    it('displays blocker message as description', async () => {
      const blocker = createMockBlocker({
        key: 'unknown_key',
        message: 'Main message',
      })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)
      expect(await screen.findByRole('alert')).toBeInTheDocument()
      expect(await screen.findByText('Main message')).toBeInTheDocument()
    })

    it('does not show view blocker button for non-actionable blocker', async () => {
      const blocker = createMockBlocker({ key: 'missing_bank_info' })
      renderWithProviders(
        <PayrollBlockerAlerts blockers={[blocker]} onViewBlockersClick={vi.fn()} />,
      )
      await screen.findByRole('alert')
      expect(screen.queryByRole('button', { name: 'View Blocker' })).not.toBeInTheDocument()
    })

    it('shows view blocker button for pending_information_request', async () => {
      const blocker = createMockBlocker({ key: 'pending_information_request' })
      const mockClick = vi.fn()
      renderWithProviders(
        <PayrollBlockerAlerts blockers={[blocker]} onViewBlockersClick={mockClick} />,
      )
      const button = await screen.findByRole('button', { name: 'View Blocker' })
      await userEvent.click(button)
      expect(mockClick).toHaveBeenCalledOnce()
    })

    it('shows view blocker button for pending_recovery_case', async () => {
      const blocker = createMockBlocker({ key: 'pending_recovery_case' })
      const mockClick = vi.fn()
      renderWithProviders(
        <PayrollBlockerAlerts blockers={[blocker]} onViewBlockersClick={mockClick} />,
      )
      const button = await screen.findByRole('button', { name: 'View Blocker' })
      await userEvent.click(button)
      expect(mockClick).toHaveBeenCalledOnce()
    })

    it('does not show view blocker button when onViewBlockersClick is not provided', async () => {
      const blocker = createMockBlocker({ key: 'pending_information_request' })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)
      await screen.findByRole('alert')
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('multiple blockers', () => {
    it('displays count in title', async () => {
      const blockers = [
        createMockBlocker({ key: 'blocker-1' }),
        createMockBlocker({ key: 'blocker-2' }),
      ]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} />)
      expect(
        await screen.findByText('2 issues are preventing you from running payroll'),
      ).toBeInTheDocument()
    })

    it('shows view all blockers button when onViewBlockersClick is provided', async () => {
      const blockers = [
        createMockBlocker({ key: 'blocker-1' }),
        createMockBlocker({ key: 'blocker-2' }),
      ]
      const mockViewClick = vi.fn()
      renderWithProviders(
        <PayrollBlockerAlerts blockers={blockers} onViewBlockersClick={mockViewClick} />,
      )
      expect(await screen.findByRole('button', { name: 'View All Blockers' })).toBeInTheDocument()
    })
  })
})
