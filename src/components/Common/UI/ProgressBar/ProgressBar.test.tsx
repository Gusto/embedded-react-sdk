import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import type { ProgressBarProps } from './ProgressBarTypes'
import { ProgressBar } from './ProgressBar'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const renderProgressBar = (props: ProgressBarProps) => {
  return render(
    <GustoTestProvider>
      <ProgressBar {...props} />
    </GustoTestProvider>,
  )
}

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

describe('ProgressBar', () => {
  it('renders progress bar', () => {
    renderProgressBar({ totalSteps: 10, currentStep: 1, label: 'Progress Bar' })

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
  it('renders progress bar on correct step', () => {
    renderProgressBar({ totalSteps: 10, currentStep: 5, label: 'Progress Bar' })
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveValue(5)
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic progress bar',
        props: { totalSteps: 10, currentStep: 5, label: 'Progress indicator' },
      },
      {
        name: 'progress bar at start',
        props: { totalSteps: 5, currentStep: 1, label: 'Upload progress' },
      },
      {
        name: 'progress bar at completion',
        props: { totalSteps: 8, currentStep: 8, label: 'Installation complete' },
      },
      {
        name: 'progress bar with custom className',
        props: {
          totalSteps: 4,
          currentStep: 2,
          label: 'Form completion',
          className: 'custom-progress',
        },
      },
      {
        name: 'progress bar with many steps',
        props: { totalSteps: 100, currentStep: 75, label: 'Download progress' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<ProgressBar {...props} />)
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      },
    )
  })
})
