import { t } from 'i18next'

export function ensureRequired<T>(prop: T | undefined): T {
  if (prop === undefined) {
    throw new Error(t('errors.ensureRequired'))
  }
  return prop
}
