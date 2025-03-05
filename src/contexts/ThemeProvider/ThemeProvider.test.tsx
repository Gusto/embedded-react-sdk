import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { ThemeProvider } from './ThemeProvider'

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
