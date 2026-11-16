import i18next from 'i18next'

/**
 * Builds a real i18next `t` bound to the `common` namespace, seeded with the given resources.
 *
 * @param resources - Translation resources for the `common` namespace.
 * @returns A `TFunction` for `common` that resolves keys against `resources`.
 * @internal
 */
export const createCommonT = (resources: Record<string, Record<string, string>>) => {
  const instance = i18next.createInstance()
  void instance.init({
    lng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    initAsync: false,
    resources: { en: { common: resources } },
    interpolation: { escapeValue: false },
  })
  return instance.getFixedT('en', 'common')
}
