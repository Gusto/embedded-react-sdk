import type {
  DeepPartial,
  ResourceDictionary,
  Resources,
  SupportedLanguages,
} from '@/types/Helpers'

/**
 * A partner-supplied `dictionary` spanning more than one translation namespace.
 *
 * @remarks
 * A component needs this shape when it renders screens that read from a namespace other than
 * its own — typically a management surface that mounts an onboarding screen. Keying the
 * overrides by namespace keeps each one addressable, so a partner can retune the management
 * chrome and the form fields independently.
 *
 * @typeParam NS - The namespaces the component reads from.
 * @internal
 */
export type MultiNamespaceDictionary<NS extends keyof Resources> = {
  [Lang in SupportedLanguages]?: Partial<{
    [K in NS]: DeepPartial<Resources[K]>
  }>
}

/**
 * Narrows a multi-namespace `dictionary` down to the overrides for a single namespace.
 *
 * @remarks
 * `useComponentDictionary` takes the overrides for one namespace at a time, so a component
 * with a {@link MultiNamespaceDictionary} calls this once per namespace it loads. Returns
 * `undefined` when the dictionary carries nothing for that namespace, which keeps
 * `useComponentDictionary` from merging an empty bundle.
 *
 * @typeParam NS - The namespaces the dictionary may carry.
 * @typeParam K - The namespace being picked.
 * @param dictionary - The partner-supplied overrides, if any.
 * @param ns - The namespace to extract.
 * @returns The overrides for `ns`, or `undefined` if there are none.
 * @internal
 */
export function pickNamespaceDictionary<NS extends keyof Resources, K extends NS>(
  dictionary: MultiNamespaceDictionary<NS> | undefined,
  ns: K,
): ResourceDictionary<K> | undefined {
  if (!dictionary) return undefined

  const picked = {} as Record<SupportedLanguages, DeepPartial<Resources[K]>>
  for (const lang in dictionary) {
    const langKey = lang as SupportedLanguages
    const nsValue = (
      dictionary[langKey] as Partial<Record<K, DeepPartial<Resources[K]>>> | undefined
    )?.[ns]
    if (nsValue) {
      picked[langKey] = nsValue
    }
  }
  return Object.keys(picked).length > 0 ? (picked as ResourceDictionary<K>) : undefined
}
