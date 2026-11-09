import type { AfterSuccessHook } from '@/types/hooks'

/**
 * Narrows a parsed JSON value to a plain object so compatibility remappers can read its fields.
 *
 * @remarks
 * Arrays are excluded so a remapper that expects an object body doesn't walk a list response by
 * index.
 *
 * @param value - Any value parsed out of a response body.
 * @returns `true` when the value is a non-null, non-array object.
 * @internal
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * Rewrites a parsed response body so it satisfies the generated schema.
 *
 * @param body - The response body as parsed by `JSON.parse`, of unknown shape.
 * @param operationID - The operation that produced the body, for remappers whose list and object
 * responses need different handling.
 * @returns The rewritten body, or `undefined` when the response needs no changes.
 * @internal
 */
export type ResponseBodyRemapper = (body: unknown, operationID: string) => unknown

/**
 * Builds an `afterSuccess` hook that rewrites a response body before the SDK's zod parse.
 *
 * @remarks
 * Every compatibility workaround in this directory shares the same mechanics: ignore operations it
 * doesn't target, read the body off a clone (leaving the original stream intact for the SDK), hand
 * it to a remapper, and either pass the original `Response` through untouched or serialize the
 * rewritten body into a fresh one. Returning the original response object when nothing changed
 * keeps the common case allocation-free and lets tests assert identity.
 *
 * A body that isn't JSON passes through unchanged, so a hook registered against an operation that
 * can return an empty or non-JSON success body is still safe.
 *
 * @param operationIDs - Operations this hook applies to; every other operation passes through.
 * @param remapBody - Produces the rewritten body, or `undefined` to pass the response through.
 * @returns An `afterSuccess` hook ready to register on the SDK client.
 * @internal
 */
export function createResponseBodyHook(
  operationIDs: readonly string[],
  remapBody: ResponseBodyRemapper,
): AfterSuccessHook {
  const targetOperationIDs: ReadonlySet<string> = new Set(operationIDs)

  return {
    afterSuccess: async (context, response) => {
      if (!targetOperationIDs.has(context.operationID)) return response

      let body: unknown
      try {
        body = await response.clone().json()
      } catch {
        return response
      }

      const remapped = remapBody(body, context.operationID)
      if (remapped === undefined) return response

      const headers = new Headers(response.headers)
      headers.delete('content-length')
      return new Response(JSON.stringify(remapped), {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    },
  }
}
