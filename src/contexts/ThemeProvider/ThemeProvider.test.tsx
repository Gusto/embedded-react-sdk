import { render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, test, expect, afterEach } from 'vitest'
import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './useTheme'

describe('<ThemeProvider />', () => {
  afterEach(() => {
    document.head.querySelectorAll('style[data-testid="GSDK"]').forEach(style => {
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

    const styleTagsAfterMount = document.head.querySelectorAll('style[data-testid="GSDK"]')
    expect(styleTagsAfterMount.length).toBe(1)

    rerender(
      <ThemeProvider theme={{ colorPrimary: '#fff' }}>
        <p>Child</p>
      </ThemeProvider>,
    )

    const styleTagsAfterUpdate = document.head.querySelectorAll('style[data-testid="GSDK"]')
    expect(styleTagsAfterUpdate.length).toBe(1)
    expect(styleTagsAfterUpdate[0]).toBe(styleTagsAfterMount[0])
  })

  describe('portalContainer prop', () => {
    afterEach(() => {
      document.body.querySelectorAll('div').forEach(el => {
        el.remove()
      })
    })

    const ContainerInspector = ({
      onContainer,
    }: {
      onContainer: (el: HTMLElement | null) => void
    }) => {
      const { container } = useTheme()
      useEffect(() => {
        onContainer(container.current)
      })
      return null
    }

    test('defaults container to the article.GSDK element when portalContainer is not provided', () => {
      let capturedContainer: HTMLElement | null = null

      render(
        <ThemeProvider>
          <ContainerInspector onContainer={el => (capturedContainer = el)} />
        </ThemeProvider>,
      )

      const article = screen.getByTestId('GSDK')
      expect(capturedContainer).toBe(article)
    })

    test('uses the supplied portalContainer element instead of article.GSDK', () => {
      const portalTarget = document.createElement('div')
      document.body.appendChild(portalTarget)
      let capturedContainer: HTMLElement | null = null

      render(
        <ThemeProvider portalContainer={portalTarget}>
          <ContainerInspector onContainer={el => (capturedContainer = el)} />
        </ThemeProvider>,
      )

      expect(capturedContainer).toBe(portalTarget)
      expect(capturedContainer).not.toBe(screen.getByTestId('GSDK'))
    })

    test('updates container when portalContainer prop changes', () => {
      const firstTarget = document.createElement('div')
      const secondTarget = document.createElement('div')
      document.body.appendChild(firstTarget)
      document.body.appendChild(secondTarget)
      let capturedContainer: HTMLElement | null = null

      const { rerender } = render(
        <ThemeProvider portalContainer={firstTarget}>
          <ContainerInspector onContainer={el => (capturedContainer = el)} />
        </ThemeProvider>,
      )
      expect(capturedContainer).toBe(firstTarget)

      rerender(
        <ThemeProvider portalContainer={secondTarget}>
          <ContainerInspector onContainer={el => (capturedContainer = el)} />
        </ThemeProvider>,
      )
      expect(capturedContainer).toBe(secondTarget)
    })
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
