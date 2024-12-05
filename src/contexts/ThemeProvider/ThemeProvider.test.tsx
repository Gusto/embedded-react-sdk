import { render } from '@testing-library/react'
import { screen } from './test-utils'
import { ThemeProvider } from './ThemeProvider'
import { describe, test, expect } from 'vitest'

describe('<ThemeProvider />', () => {
  test('Wraps child element in .GSDK section', () => {
    render(
      <ThemeProvider>
        <p>Child</p>
      </ThemeProvider>,
    )
    const GSDK = screen.getByTestId('GSDK')

    expect(GSDK).toBeInTheDocument()
    expect(GSDK).toHaveClass('GSDK')
  })
})
