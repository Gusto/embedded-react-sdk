import { render, screen } from '@testing-library/react'
import { describe, test, expect, afterEach } from 'vitest'
import { ThemeProvider } from './ThemeProvider'

describe('<ThemeProvider />', () => {
  afterEach(() => {
    document.head.querySelectorAll('style[data-testid="GSDK"]').forEach((style) => {
      style.remove()
    })
  })

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

  test('Reuses style tag after initial insertion', () => {
    const { rerender } = render(
      <ThemeProvider theme={{ colorPrimary: '#000' }}>
        <p>Child</p>
      </ThemeProvider>,
    )

    const styleTagsAfterMount = document.head.querySelectorAll(
      'style[data-testid="GSDK"]',
    )
    expect(styleTagsAfterMount.length).toBe(1)

    rerender(
      <ThemeProvider theme={{ colorPrimary: '#fff' }}>
        <p>Child</p>
      </ThemeProvider>,
    )

    const styleTagsAfterUpdate = document.head.querySelectorAll(
      'style[data-testid="GSDK"]',
    )
    expect(styleTagsAfterUpdate.length).toBe(1)
    expect(styleTagsAfterUpdate[0]).toBe(styleTagsAfterMount[0])
  })

  test('Updates style tag textContent when theme changes', () => {
    const { rerender } = render(
      <ThemeProvider theme={{ colorPrimary: '#000' }}>
        <p>Child</p>
      </ThemeProvider>,
    )

    const styleTag = document.head.querySelector('style[data-testid="GSDK"]')
    expect(styleTag?.textContent).toContain('--g-colorPrimary: #000')

    rerender(
      <ThemeProvider theme={{ colorPrimary: '#fff' }}>
        <p>Child</p>
      </ThemeProvider>,
    )

    expect(styleTag?.textContent).toContain('--g-colorPrimary: #fff')
    expect(styleTag?.textContent).not.toContain('--g-colorPrimary: #000')
  })
})
