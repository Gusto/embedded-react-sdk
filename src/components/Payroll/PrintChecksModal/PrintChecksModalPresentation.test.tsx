import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { PrintingFormat } from '@gusto/embedded-api/models/components/printablepayrollchecksbody'
import { PrintChecksModalPresentation } from './PrintChecksModalPresentation'
import type { PrintChecksFormValues, PrintChecksModalPhase } from './usePrintChecksModal'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const renderPresentation = ({
  defaultValues,
  phase = 'form',
  documentUrl = null,
  errorMessage = null,
  onSubmit = vi.fn(),
  onRetry = vi.fn(),
  onClose = vi.fn(),
  withManualErrorTrigger = false,
}: {
  defaultValues?: Partial<PrintChecksFormValues>
  phase?: PrintChecksModalPhase
  documentUrl?: string | null
  errorMessage?: string | null
  onSubmit?: (data: PrintChecksFormValues) => void
  onRetry?: () => void
  onClose?: () => void
  withManualErrorTrigger?: boolean
} = {}) => {
  const Harness = () => {
    const formMethods = useForm<PrintChecksFormValues>({
      defaultValues: {
        printingFormat: PrintingFormat.Top,
        startingCheckNumber: 0,
        ...defaultValues,
      },
    })

    return (
      <>
        {withManualErrorTrigger && (
          <button
            type="button"
            onClick={() => {
              formMethods.setError('startingCheckNumber', {
                type: 'manual',
                message: 'invalidStartingCheckNumber',
              })
            }}
          >
            Trigger validation error
          </button>
        )}
        <PrintChecksModalPresentation
          isOpen
          onClose={onClose}
          formMethods={formMethods}
          phase={phase}
          documentUrl={documentUrl}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          onRetry={onRetry}
        />
      </>
    )
  }

  return renderWithProviders(<Harness />)
}

describe('PrintChecksModalPresentation radio selection', () => {
  it('hides the starting check number field for custom check stock', async () => {
    renderPresentation({ defaultValues: { printingFormat: PrintingFormat.Top } })

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Custom check stock' })).toBeChecked()
    })
    expect(screen.queryByLabelText(/Check number starts with/)).toBeNull()
  })

  it('shows the starting check number field for blank check stock', async () => {
    renderPresentation({ defaultValues: { printingFormat: PrintingFormat.Bottom } })

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Blank check stock' })).toBeChecked()
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/Check number starts with/)).toBeInTheDocument()
    })
  })

  it('toggles the starting check number field when the selection changes', async () => {
    const user = userEvent.setup()
    renderPresentation({ defaultValues: { printingFormat: PrintingFormat.Top } })

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Custom check stock' })).toBeChecked()
    })
    expect(screen.queryByLabelText(/Check number starts with/)).toBeNull()

    await user.click(screen.getByRole('radio', { name: 'Blank check stock' }))

    await waitFor(() => {
      expect(screen.getByLabelText(/Check number starts with/)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: 'Custom check stock' }))

    await waitFor(() => {
      expect(screen.queryByLabelText(/Check number starts with/)).toBeNull()
    })
  })
})

describe('PrintChecksModalPresentation validation errors', () => {
  it('shows the translated message when the starting check number is invalid', async () => {
    const user = userEvent.setup()
    renderPresentation({
      defaultValues: { printingFormat: PrintingFormat.Bottom },
      withManualErrorTrigger: true,
    })

    await user.click(await screen.findByRole('button', { name: 'Trigger validation error' }))

    await waitFor(() => {
      expect(screen.getByText('Enter a valid check number')).toBeInTheDocument()
    })
  })
})

describe('PrintChecksModalPresentation phases', () => {
  it('disables the form and shows loading copy while generating', async () => {
    renderPresentation({ phase: 'generating' })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Generating...' })).toBeDisabled()
    })
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Custom check stock' })).toBeDisabled()
  })

  it('shows a link to the generated checks and a single Close action on success', async () => {
    renderPresentation({ phase: 'succeeded', documentUrl: 'https://example.com/checks.pdf' })

    await waitFor(() => {
      expect(screen.getByText('Your checks are ready')).toBeInTheDocument()
    })
    const link = screen.getByRole('link', { name: 'View checks' })
    expect(link).toHaveAttribute('href', 'https://example.com/checks.pdf')
    expect(link).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
  })

  it('shows the server error message and calls onRetry when failed', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderPresentation({
      phase: 'failed',
      errorMessage: 'Cannot generate checks on an unprocessed payroll',
      onRetry,
    })

    await waitFor(() => {
      expect(screen.getByText("We couldn't generate your checks")).toBeInTheDocument()
    })
    expect(screen.getByText('Cannot generate checks on an unprocessed payroll')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
