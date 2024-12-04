import { useTranslation } from 'react-i18next'
import { LRUCache } from '@/helpers/LRUCache'
import type Resources from '@/types/i18nresources'

export const defaultNS = 'common'

//LRU cache holding requested resources
const resourceCache = new LRUCache(50)
/**
 * Dynamic loading of translation resources - works with Suspence to prevent early access to loadable strings
 * @param lng(string): resource language
 * @param ns(string): Namespace/name of the component/resource
 * @returns Promise<Translation resource>
 */
const loadResource = ({ lng = 'en', ns }: { ns: string; lng?: string }) => {
  let isLoading = true
  let isError = false
  let resource: Record<string, string>

  const importResources = async () => {
    try {
      const module = await import(`@/i18n/${lng}/${ns}.json`)

      resource = module.default
      isLoading = false
    } catch (err) {
      isError = true
      isLoading = false
    }
  }
  const promise = importResources()
  return () => {
    if (isLoading) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw promise // Throw the promise to indicate Suspense should suspend.
    } else if (isError) {
      throw new Error(`Error loading translation for component: ${ns}`) // Handle error
    } else {
      return resource // Return the resource when loading is complete
    }
  }
}

/**
 * Hook that allows component to load custom dictionary
 * @param @private {string} ns - Namespace - should match component name exactly - not exposed to consumers
 */
export const useI18n = (ns: keyof Resources | null) => {
  //Getting our instance of i18n -> supplied by the provider set in GustoApiProvider
  const { i18n: i18nInstance } = useTranslation()
  //Abort when namespace is not provided
  if (!ns) return
  const key = `${i18nInstance.resolvedLanguage}:${ns}`
  //Skip loading default resource if it is already in cache
  if (resourceCache.get(key) === null) {
    //If resource not in cache, initiate loading and add getter to cache
    resourceCache.put(key, loadResource({ lng: i18nInstance.resolvedLanguage, ns: ns }))
  }
  //Get resourceGetter from cache
  const resourceGetter = resourceCache.get(key)
  if (resourceGetter) {
    const resource = resourceGetter()
    i18nInstance.addResourceBundle(i18nInstance.resolvedLanguage ?? 'en', ns, resource, true, false) //Last argument is set to false to prevent override of keys provided by partners on GustoApiProvider level through dictionary prop
  }
}
