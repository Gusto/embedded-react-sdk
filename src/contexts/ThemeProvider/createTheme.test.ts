import { describe, test, expect } from 'vitest'
import { createTheme } from './createTheme'

describe('createTheme', () => {
  test('should allow for overriding colors', () => {
    const defaultTheme = createTheme()
    const themeWithOverrides = createTheme({
      colors: {
        gray: {
          100: '#DCFCE7',
        },
      },
    })

    expect(themeWithOverrides.colors.gray[100]).toBe('#DCFCE7')
    expect(themeWithOverrides.colors.gray[200]).toBe(defaultTheme.colors.gray[200])
  })

  test('should allow for overriding spacing', () => {
    const defaultTheme = createTheme()
    const themeWithOverrides = createTheme({
      spacing: {
        8: '2px',
      },
    })

    expect(themeWithOverrides.spacing[8]).toBe('2px')
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

  test('should verify correct font weights', () => {
    const theme = createTheme()

    expect(theme.typography.fontWeight.regular).toBe(400)
    expect(theme.typography.fontWeight.medium).toBe(500)
    expect(theme.typography.fontWeight.semibold).toBe(600)
    expect(theme.typography.fontWeight.bold).toBe(700)
  })

  test('typography colors should inherit color overrides', () => {
    const theme = createTheme({
      colors: {
        gray: {
          1000: '#0A8080',
        },
      },
    })

    expect(theme.typography.textColor).toBe('#0A8080')
  })

  test('typography specific overrides should take precedence over color overrides', () => {
    const theme = createTheme({
      colors: {
        gray: {
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
        gray: {
          1000: '#92400E',
        },
      },
    })

    expect(theme.button.secondary.color).toBe('#92400E')
  })

  test('component themes should take precedence over color, typography and spacing overrides', () => {
    const theme = createTheme({
      colors: {
        gray: {
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
