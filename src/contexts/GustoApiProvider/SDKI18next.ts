import { defaultNS } from '@/i18n'
import i18next, { i18n } from 'i18next'
import commonEn from '@/i18n/en/common.json'
import { initReactI18next } from 'react-i18next'

/**Creating new i18next instance to avoid global clashing */
const SDKI18next: i18n = i18next.createInstance({
  debug: false,
  fallbackLng: 'en',
  resources: {
    en: { common: commonEn },
  },
  defaultNS,
})

// eslint-disable-next-line
SDKI18next.use(initReactI18next).init().catch(console.error)

export { SDKI18next }
