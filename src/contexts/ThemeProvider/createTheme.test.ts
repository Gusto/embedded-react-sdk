import { describe, test, expect } from 'vitest'
import { createTheme } from './createTheme'

describe('createTheme', () => {
  test('should allow for overriding colors', () => {
    const defaultTheme = createTheme()
    const themeWithOverrides = createTheme({
      colors: {
        primary: {
          100: '#DCFCE7',
        },
      },
    })

    expect(themeWithOverrides.colors.primary[100]).toBe('#DCFCE7')
    expect(themeWithOverrides.colors.primary[200]).toBe(defaultTheme.colors.primary[200])
  })

  test('should allow for overriding spacing', () => {
    const defaultTheme = createTheme()
    const themeWithOverrides = createTheme({
      spacing: {
        radius: '2px',
      },
    })

    expect(themeWithOverrides.spacing.radius).toBe('2px')
    expect(themeWithOverrides.spacing[4]).toBe(defaultTheme.spacing[4])
  })

  test('should allow for overriding typography', () => {
    const defaultTheme = createTheme()
    const themeWithOverrides = createTheme({
      typography: {
        fontWeight: {
          medium: 600,
        },
      },
    })

    expect(themeWithOverrides.typography.fontWeight.medium).toBe(600)
    expect(themeWithOverrides.typography.font).toBe(defaultTheme.typography.font)
  })

  test('typography colors should inherit color overrides', () => {
    const theme = createTheme({
      colors: {
        primary: {
          1000: '#0A8080',
        },
      },
    })

    expect(theme.typography.textColor).toBe('#0A8080')
  })

  test('typography specific overrides should take precedence over color overrides', () => {
    const theme = createTheme({
      colors: {
        primary: {
          1000: '#0A8080',
        },
      },
      typography: {
        textColor: '#171717',
      },
    })

    expect(theme.typography.textColor).toBe('#171717')
  })

  test('should allow for overriding components', () => {
    const theme = createTheme({
      button: {
        secondary: {
          color: '#92400E',
        },
      },
    })

    expect(theme.button.secondary.color).toBe('#92400E')
  })

  test('component themes should inherit color, typography, and spacing overrides', () => {
    const theme = createTheme({
      colors: {
        primary: {
          1000: '#92400E',
        },
      },
    })

    expect(theme.button.secondary.color).toBe('#92400E')
  })

  test('component themes should take precedence over color, typography and spacing overrides', () => {
    const theme = createTheme({
      colors: {
        primary: {
          1000: '#92400E',
        },
      },
      button: {
        secondary: {
          color: '#DCFCE7',
        },
      },
    })

    expect(theme.button.secondary.color).toBe('#DCFCE7')
  })
})
