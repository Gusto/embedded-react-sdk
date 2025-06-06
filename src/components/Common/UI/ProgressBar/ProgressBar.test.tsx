import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('ProgressBar', () => {
  it('renders progress bar', () => {
    renderWithProviders(<ProgressBar totalSteps={10} currentStep={1} label="Progress Bar" />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders progress bar on correct step', () => {
    renderWithProviders(<ProgressBar totalSteps={10} currentStep={5} label="Progress Bar" />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveValue(5)
  })

  it('renders with correct accessibility attributes', () => {
    renderWithProviders(<ProgressBar label="Loading progress" totalSteps={10} currentStep={5} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-label', 'Loading progress')
    expect(progressbar).toHaveValue(5)
    expect(progressbar).toHaveAttribute('max', '10')
  })

  it('renders with label', () => {
    renderWithProviders(<ProgressBar label="Download progress" totalSteps={8} currentStep={6} />)

    // Label is visually hidden but still accessible
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-label', 'Download progress')
  })

  it('clamps values to valid range', () => {
    renderWithProviders(<ProgressBar label="Test" totalSteps={5} currentStep={10} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveValue(5) // Should be clamped to max
  })

  it('handles zero and negative current step', () => {
    renderWithProviders(<ProgressBar label="Test" totalSteps={5} currentStep={0} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveValue(1) // Should be clamped to min of 1
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <ProgressBar label="Test" totalSteps={5} currentStep={3} className="custom-progress" />,
    )

    expect(container.querySelector('.custom-progress')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic progress bar',
        props: { label: 'Loading', totalSteps: 10, currentStep: 3 },
      },
      {
        name: 'progress bar at start',
        props: { label: 'Upload progress', totalSteps: 5, currentStep: 1 },
      },
      {
        name: 'progress bar in middle',
        props: { label: 'Download progress', totalSteps: 8, currentStep: 4 },
      },
      {
        name: 'progress bar near completion',
        props: { label: 'Installation progress', totalSteps: 6, currentStep: 5 },
      },
      {
        name: 'completed progress bar',
        props: { label: 'Complete', totalSteps: 4, currentStep: 4 },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<ProgressBar {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
