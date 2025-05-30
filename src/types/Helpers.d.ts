import { BREAKPOINTS } from '@/shared/constants'
import type { CustomTypeOptions } from 'i18next'

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P]
}

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>
}[keyof T]

export type MachineEventType<
  TEventPayloads,
  TEventType extends keyof TEventPayloads = keyof TEventPayloads,
> = {
  type: TEventType
  payload: TEventPayloads[TEventType]
}

//Makes specific property in the given type required
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean
}

/**
 * I18N related types
 */
export type Resources = CustomTypeOptions['resources']

export type SupportedLanguages = 'en' // Add more languages here as needed, e.g. | 'es' | 'fr'

//ResourceDictionary us supporting 2 cases - global GustoProvider dictionary with all resources and component specific dictionaries
export type ResourceDictionary<K extends keyof Resources | undefined = undefined> =
  K extends keyof Resources
    ? Record<SupportedLanguages, DeepPartial<Resources[K]>>
    : Record<SupportedLanguages, Partial<{ [Key in keyof Resources]: DeepPartial<Resources[Key]> }>>
