import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { PayrollBlockerAlerts } from './PayrollBlockerAlerts'
import type { ApiPayrollBlocker } from './payrollHelpers'
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
    it('displays the blocker key as transformed title', async () => {
      const blocker = createMockBlocker({ key: 'blocker_1', message: 'Single blocker message' })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)
      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toHaveAccessibleName('Blocker 1')
    })

    it('displays component correctly with help text', async () => {
      const blocker = createMockBlocker({
        key: 'unknown_key',
        message: 'Main message',
      })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)
      expect(await screen.findByRole('alert')).toHaveAccessibleName('Unknown Key')
      expect(await screen.findByText('Main message')).toBeInTheDocument()
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

    it('shows view all button when onMultipleViewClick is provided', async () => {
      const blockers = [
        createMockBlocker({ key: 'blocker-1' }),
        createMockBlocker({ key: 'blocker-2' }),
      ]
      const mockViewClick = vi.fn()
      renderWithProviders(
        <PayrollBlockerAlerts blockers={blockers} onMultipleViewClick={mockViewClick} />,
      )
      expect(await screen.findByRole('button', { name: 'View All Blockers' })).toBeInTheDocument()
    })
  })
})
