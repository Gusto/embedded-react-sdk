import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { BaseBoundaries, BaseLayout } from './Base'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const CustomLoader = () => <div data-testid="custom-loader">Loading…</div>

// A child that suspends indefinitely so the Suspense fallback stays rendered.
// Throwing a promise is the mechanism React uses to signal Suspense.
function Suspender(): never {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw new Promise<void>(() => {})
}

describe('BaseLayout LoaderComponent', () => {
  it('renders the provided LoaderComponent while loading', () => {
    renderWithProviders(<BaseLayout isLoading LoaderComponent={CustomLoader} />)

    expect(screen.getByTestId('custom-loader')).toBeInTheDocument()
  })

  it('falls back to the context loading indicator when LoaderComponent is omitted', () => {
    const { container } = renderWithProviders(<BaseLayout isLoading />)

    expect(screen.queryByTestId('custom-loader')).toBeNull()
    // The SDK default `Loading` marks its region with aria-busy.
    expect(container.querySelector('[aria-busy]')).toBeInTheDocument()
  })

  it('does not render the loader once loading resolves', () => {
    renderWithProviders(
      <BaseLayout LoaderComponent={CustomLoader}>
        <div data-testid="content">Ready</div>
      </BaseLayout>,
    )

    expect(screen.queryByTestId('custom-loader')).toBeNull()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })
})

describe('BaseBoundaries LoaderComponent', () => {
  it('renders the provided LoaderComponent as the Suspense fallback', async () => {
    renderWithProviders(
      <BaseBoundaries componentName="Test.Boundaries" LoaderComponent={CustomLoader}>
        <Suspender />
      </BaseBoundaries>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('custom-loader')).toBeInTheDocument()
    })
  })

  it('falls back to the context loading indicator when LoaderComponent is omitted', async () => {
    const { container } = renderWithProviders(
      <BaseBoundaries componentName="Test.Boundaries">
        <Suspender />
      </BaseBoundaries>,
    )

    await waitFor(() => {
      expect(container.querySelector('[aria-busy]')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('custom-loader')).toBeNull()
  })
})
