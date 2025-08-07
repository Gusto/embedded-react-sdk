import { screen, waitFor } from '@testing-library/react'

export const waitForPageLoad = async (
  options: {
    timeout?: number
    waitForElement?: () => Promise<HTMLElement>
    loadingIndicator?: string
  } = {},
) => {
  const { timeout = 15000, waitForElement, loadingIndicator = 'Loading component...' } = options

  await waitFor(
    async () => {
      const loadingElement = screen.queryByLabelText(loadingIndicator)
      if (loadingElement) {
        throw new Error('Still loading...')
      }

      await screen.findByRole('button', { name: 'Continue' })

      if (waitForElement) {
        await waitForElement()
      }
    },
    { timeout },
  )
}

export const waitForFormLoad = async (
  elementSelectors: (() => Promise<HTMLElement>)[],
  timeout: number = 15000,
) => {
  await waitFor(
    async () => {
      const loadingElement = screen.queryByLabelText('Loading component...')
      if (loadingElement) {
        throw new Error('Still loading...')
      }

      await Promise.all(elementSelectors.map(selector => selector()))
    },
    { timeout },
  )
}

export const waitForNoLoading = async (timeout: number = 15000) => {
  await waitFor(
    () => {
      const indicators = [
        screen.queryByLabelText('Loading component...'),
        screen.queryByLabelText('Loading...'),
        screen.queryByText('Loading...'),
        screen.queryByTestId('loading'),
        screen.queryByRole('progressbar'),
        document.querySelector('[aria-busy="true"]'),
        document.querySelector('.skeleton'),
        document.querySelector('[class*="skeleton"]'),
      ].filter(Boolean)

      if (indicators.length > 0) {
        throw new Error('Still loading...')
      }
    },
    { timeout },
  )
}
