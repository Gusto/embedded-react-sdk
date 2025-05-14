import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { ProgressBarProps } from './ProgressBarTypes'
import { ProgressBar } from './ProgressBar'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

const renderProgressBar = (props: ProgressBarProps) => {
  return render(
    <GustoTestProvider>
      <ProgressBar {...props} />
    </GustoTestProvider>,
  )
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
})
