import { mergePartnerTheme } from './theme'

describe('theme', () => {
  describe('mergePartnerTheme', () => {
    it('should apply the default colors when no partner theme is provided', () => {
      const mergedTheme = mergePartnerTheme({})

      expect(mergedTheme.colorBody).toBe('#FFFFFF')
      expect(mergedTheme.inputBackgroundColor).toBe('#FFFFFF')
    })

    it('should apply custom colorBody to inputBackgroundColor when inputBackgroundColor is not specified', () => {
      const customColorBody = '#F0F0F0'
      const mergedTheme = mergePartnerTheme({ colorBody: customColorBody })

      expect(mergedTheme.colorBody).toBe(customColorBody)
      expect(mergedTheme.inputBackgroundColor).toBe(customColorBody)
    })

    it('should prioritize explicit inputBackgroundColor over colorBody fallback', () => {
      const customColorBody = '#F0F0F0'
      const customInputBackground = '#E0E0E0'
      const mergedTheme = mergePartnerTheme({
        colorBody: customColorBody,
        inputBackgroundColor: customInputBackground,
      })

      expect(mergedTheme.colorBody).toBe(customColorBody)
      expect(mergedTheme.inputBackgroundColor).toBe(customInputBackground)
    })
  })
})
