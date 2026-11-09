# Compatibility hooks

Every hook here is an `afterSuccess` hook that remaps a response body before the generated client's
zod parse. They exist for two reasons, and often both at once:

1. **The generated client is strict.** `@gusto/embedded-api` is generated with
   `laxMode: strict` and `forwardCompatibleEnumsByDefault: false`, so enums are closed
   and nullish/numeric coercion is off. One unexpected value fails the parse for
   the **whole** response — a single payroll with an unlisted `off_cycle_reason` takes down
   the entire list and every surface that reads it.
2. **The published schema doesn't match actual API behavior.** The OAS omits enum members the
   application emits, marks fields non-nullable that come back `null`, and types amounts as numbers
   that arrive as decimal strings.

These hooks are a stopgap. The intended fix is generating with `laxMode`, which handles nullish and
numeric coalescing directly; forward-compatible enums cover the rest. That's a large change needing
extensive testing before we'd trust it, so until it lands these hooks stay. Don't delete one on the
theory that lax mode is coming.

## Adding one

Verify the mismatch is real first: read the schema in
`node_modules/@gusto/embedded-api/src/models/components/`. Fields are often already nullable,
optional, or open enums, in which case nothing is needed.

Build on `createResponseBodyHook(operationIDs, remapBody)`. The factory owns operation gating,
reading the body off a clone, and rebuilding the response; your remapper returns a new body, or
`undefined` to pass the response through untouched. Don't mutate the body, and use the shared
`isRecord` guard rather than writing another one.

- **Preserve meaning.** Collapse to a shape the schema already accepts — `null` for a nullable
  field, an omitted key for an optional one — or fall back to a known-safe member. Never relabel a
  value as a different category, and never drop a whole entry to save the response.
- **Scope by operation.** Hooks are global, so list only the operation IDs you mean. For endpoints
  that return a bare array in some operations and an object in others, branch on the `operationID`
  argument.
- **Register in `ApiProvider.tsx`**, never from a component — a component-local registration leaves
  a window where requests fire before the effect runs. Export it from `index.ts`, and add it to the
  expected list in `ApiProvider.test.tsx`.
- **Document the exit.** The TSDoc should say what's broken upstream and what retires the hook, so
  it doesn't outlive the bug.

Every hook gets a test file next to it. Assert against the generated `$inboundSchema` so the test
proves the response actually parses, and assert that an unaffected response returns the original
`Response` object.

Not everything in `../` is a workaround: `apiVersionHook`, `apiVersionMismatchHook`, and
`createSdkQueryClient` are permanent plumbing and don't belong here.
