import { render, screen } from '@testing-library/react'
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
