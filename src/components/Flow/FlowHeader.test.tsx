import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlowHeader } from './FlowHeader'
import { FlowContext, type FlowContextInterface } from './useFlow'
import type { BreadcrumbTrail } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const PlaceholderComponent = () => <div data-testid="placeholder">component</div>

const renderWithFlow = (overrides: Partial<FlowContextInterface>) => {
  const value: FlowContextInterface = {
    component: PlaceholderComponent,
    onEvent: vi.fn(),
    ...overrides,
  }
  return {
    ...renderWithProviders(
      <FlowContext.Provider value={value}>
        <FlowHeader />
      </FlowContext.Provider>,
    ),
    onEvent: value.onEvent,
  }
}

describe('FlowHeader', () => {
  describe('absent chrome', () => {
    const expectNoHeaderChrome = () => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    }

    it('renders nothing when header is undefined', () => {
      renderWithFlow({ header: undefined })
      expectNoHeaderChrome()
    })

    it('renders nothing when header is null', () => {
      renderWithFlow({ header: null })
      expectNoHeaderChrome()
    })

    it('renders nothing when there is no active component, even if header is set', () => {
      renderWithFlow({
        component: null,
        header: { type: 'minimal' },
      })
      expectNoHeaderChrome()
    })
  })

  describe('minimal header', () => {
    it('renders a Back button', () => {
      renderWithFlow({ header: { type: 'minimal' } })
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    })

    it('emits a CANCEL event when the Back button is clicked', async () => {
      const user = userEvent.setup()
      const { onEvent } = renderWithFlow({ header: { type: 'minimal' } })

      await user.click(screen.getByRole('button', { name: 'Back' }))

      expect(onEvent).toHaveBeenCalledTimes(1)
      expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL, undefined)
    })

    it('renders the optional cta alongside the Back button', () => {
      const Cta = () => <button type="button">Save and exit</button>
      renderWithFlow({ header: { type: 'minimal', cta: Cta } })

      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save and exit' })).toBeInTheDocument()
    })

    it('does not render a cta when none is provided', () => {
      renderWithFlow({ header: { type: 'minimal' } })
      expect(screen.getAllByRole('button')).toHaveLength(1)
    })
  })

  describe('progress header', () => {
    it('renders a progress bar with the correct step values', () => {
      renderWithFlow({
        header: { type: 'progress', currentStep: 2, totalSteps: 5 },
      })

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveValue(2)
      expect(progressBar).toHaveAttribute('max', '5')
    })

    it('does not render a Back button', () => {
      renderWithFlow({
        header: { type: 'progress', currentStep: 1, totalSteps: 3 },
      })
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    })

    it('renders the optional cta', () => {
      const Cta = () => <button type="button">Save and exit</button>
      renderWithFlow({
        header: { type: 'progress', currentStep: 1, totalSteps: 3, cta: Cta },
      })

      expect(screen.getByRole('button', { name: 'Save and exit' })).toBeInTheDocument()
    })
  })

  describe('breadcrumbs header', () => {
    const breadcrumbs: BreadcrumbTrail = {
      'step-one': [
        { id: 'step-one', label: 'Step One' },
        { id: 'step-two', label: 'Step Two' },
      ],
    }

    it('renders the breadcrumbs trail when currentBreadcrumbId is set', () => {
      renderWithFlow({
        header: {
          type: 'breadcrumbs',
          currentBreadcrumbId: 'step-one',
          breadcrumbs,
        },
      })

      expect(screen.getByText('Step One')).toBeInTheDocument()
      expect(screen.getByText('Step Two')).toBeInTheDocument()
    })

    it('renders nothing when currentBreadcrumbId is not set', () => {
      renderWithFlow({
        header: {
          type: 'breadcrumbs',
          breadcrumbs,
        },
      })

      expect(screen.queryByText('Step One')).not.toBeInTheDocument()
      expect(screen.queryByText('Step Two')).not.toBeInTheDocument()
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('renders an empty trail when the currentBreadcrumbId has no entry', () => {
      renderWithFlow({
        header: {
          type: 'breadcrumbs',
          currentBreadcrumbId: 'unknown-id',
          breadcrumbs,
        },
      })

      expect(screen.queryByText('Step One')).not.toBeInTheDocument()
      expect(screen.queryByText('Step Two')).not.toBeInTheDocument()
    })

    it('renders the optional cta alongside the breadcrumbs', () => {
      const Cta = () => <button type="button">Save and exit</button>
      renderWithFlow({
        header: {
          type: 'breadcrumbs',
          currentBreadcrumbId: 'step-one',
          breadcrumbs,
          cta: Cta,
        },
      })

      expect(screen.getByText('Step One')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save and exit' })).toBeInTheDocument()
    })
  })
})
