import { BREAKPOINTS } from '@/shared/constants'
import type { Resources } from '@/i18n/types'

export type { Resources, Translations } from '@/i18n/types'

/**
 * Recursively makes every property of `T` optional, descending into nested objects and arrays.
 *
 * @public
 * @group Utility types
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P]
}

/**
 * Requires at least one property of `T` to be provided while leaving the rest optional.
 *
 * @typeParam T - The object type whose properties are individually optional but collectively required.
 * @public
 */
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

/**
 * An open map of `data-*` attributes that can be spread onto a rendered DOM element.
 *
 * @public
 */
export type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean
}

/**
 * Language codes the SDK ships translations for; the top-level keys of {@link ResourceDictionary}.
 *
 * @public
 * @group Utility types
 */
export type SupportedLanguages = 'en' // Add more languages here as needed, e.g. | 'es' | 'fr'

/**
 * Translation overrides for **every** SDK namespace at once, keyed by language then
 * namespace — the global dictionary accepted by {@link GustoProvider}. Each namespace
 * maps to a deep-partial of its keys (see {@link Resources}); override only what you need.
 * For a single component's namespace, use {@link ResourceDictionary} instead.
 *
 * @public
 * @group Utility types
 */
export interface GlobalResourceDictionary extends Record<
  SupportedLanguages,
  Partial<{ [Key in keyof Resources]: DeepPartial<Resources[Key]> }>
> {}

/**
 * Translation overrides for a single resource namespace `K`, keyed by language (e.g.
 * `ResourceDictionary<'Company.Addresses'>`). With no `K`, resolves to
 * {@link GlobalResourceDictionary} (all namespaces).
 *
 * @public
 * @group Utility types
 */
export type ResourceDictionary<K extends keyof Resources | undefined = undefined> =
  K extends keyof Resources
    ? Record<SupportedLanguages, DeepPartial<Resources[K]>>
    : GlobalResourceDictionary
