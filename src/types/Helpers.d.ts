import { BREAKPOINTS } from '@/shared/constants'

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
