import { operations } from '@/types/schema'

// Type Helpers
export type PathParams<Operation extends keyof operations> =
  operations[Operation]['parameters']['path']
// @ts-expect-error HACK revisit after Speakeasy implementation
export type RequestBodyParams<Operation extends keyof operations> = NonNullable<
  operations[Operation]['requestBody']
>['content']['application/json']
type Responses<Operation extends keyof operations> = NonNullable<operations[Operation]['responses']>
export type ResponseType<
  Operation extends keyof operations,
  Code extends keyof Responses<Operation>,
> = Responses<Operation>[Code] extends { content: { 'application/json': unknown } }
  ? Responses<Operation>[Code]['content']['application/json']
  : never
