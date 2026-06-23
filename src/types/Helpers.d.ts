import { BREAKPOINTS } from '@/shared/constants'
import type { CustomTypeOptions } from 'i18next'

/**
 * Recursively makes every property of `T` optional, descending into nested objects and arrays.
 *
 * @public
 */
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

// Robot3 state machine helper types for consistent usage across the codebase
export type { Transition, Immediate } from 'robot3'
export type { EventType } from '@/shared/constants'

// Reusable type for robot3 state machine transitions that accept any EventType
export type MachineTransition = Transition<EventType> | Immediate<EventType>

//Makes specific property in the given type required
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean
}

/**
 * The full set of SDK i18n resource namespaces and their string keys.
 * Each key names a component's resource namespace.
 *
 * @public
 */
export type Resources = CustomTypeOptions['resources']

/**
 * Language codes the SDK ships translations for; the top-level keys of {@link ResourceDictionary}.
 *
 * @public
 */
export type SupportedLanguages = 'en' // Add more languages here as needed, e.g. | 'es' | 'fr'

/**
 * Supported keys to provide as a dictionary - global GustoProvider dictionary with all resources and component specific dictionaries
 *
 * @public
 */
export type ResourceDictionary<K extends keyof Resources | undefined = undefined> =
  K extends keyof Resources
    ? Record<SupportedLanguages, DeepPartial<Resources[K]>>
    : Record<SupportedLanguages, Partial<{ [Key in keyof Resources]: DeepPartial<Resources[Key]> }>>
