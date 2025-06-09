import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Alert } from './Alert'
import InfoIcon from '@/assets/icons/info.svg?react'
import { ComponentsContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Alert', () => {
  it('renders alert with message', () => {
    renderWithProviders(<Alert label="Alert Title">This is an alert message</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('This is an alert message')).toBeInTheDocument()
  })

  it('renders with different statuses', () => {
    const { rerender } = renderWithProviders(
      <Alert label="Success" status="success">
        Success message
      </Alert>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()

    rerender(
      <Alert label="Error" status="error">
        Error message
      </Alert>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()

    rerender(
      <Alert label="Warning" status="warning">
        Warning message
      </Alert>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <Alert label="Custom" className="custom-alert">
        Custom alert
      </Alert>,
    )
    expect(container.querySelector('.custom-alert')).toBeInTheDocument()
  })

  it('renders with custom icon', () => {
    renderWithProviders(
      <Alert label="Custom Icon" icon={<span data-testid="custom-icon">🔔</span>}>
        Alert with custom icon
      </Alert>,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic alert',
        props: { label: 'Information', children: 'Basic alert message' },
      },
      {
        name: 'success alert',
        props: {
          label: 'Success',
          status: 'success' as const,
          children: 'Operation completed successfully',
        },
      },
      {
        name: 'error alert',
        props: { label: 'Error', status: 'error' as const, children: 'An error occurred' },
      },
      {
        name: 'warning alert',
        props: {
          label: 'Warning',
          status: 'warning' as const,
          children: 'Please review your input',
        },
      },
      {
        name: 'info alert',
        props: {
          label: 'Info',
          status: 'info' as const,
          children: 'Additional information available',
        },
      },
      {
        name: 'alert with custom className',
        props: { label: 'Styled', className: 'custom-style', children: 'Styled alert' },
      },
      {
        name: 'alert with complex content',
        props: {
          label: 'Important',
          children: (
            <div>
              <strong>Important:</strong> Please save your work before continuing.
            </div>
          ),
        },
      },
      {
        name: 'alert with custom icon',
        props: {
          label: 'Custom',
          icon: <span>🔔</span>,
          children: 'Alert with custom icon',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Alert {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic alert',
        props: { label: 'Information', children: 'Basic alert message' },
      },
      {
        name: 'alert with complex content',
        props: {
          label: 'Important',
          children: (
            <div>
              <strong>Important:</strong> Please save your work before continuing.
            </div>
          ),
        },
      },
      {
        name: 'alert with custom icon',
        props: {
          label: 'Custom',
          icon: <span>🔔</span>,
          children: 'Alert with custom icon',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Alert {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
