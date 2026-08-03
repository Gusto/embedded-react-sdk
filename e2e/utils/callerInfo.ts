/**
 * Returns a human-readable label for the caller of the function that invoked
 * this -- e.g. `createAndSubmitOffCycleBonus (payrollFlowDrivers.ts:203)`, or
 * `<anonymous> (05-off-cycle-correction-review.spec.ts:28)` when the caller is
 * an inline test-body callback with no name of its own.
 *
 * Uses V8's `Error.prepareStackTrace` hook to get structured `CallSite`
 * objects instead of parsing the formatted `.stack` string.
 *
 * Must be called synchronously, before your own function's first `await` --
 * the caller's own prior awaits don't matter (Node's default async stack
 * traces resolve through those fine), but once *your* frame has already
 * resumed from an await of its own, V8 can no longer stitch back to the
 * caller and this degrades to `<anonymous> (file:line)`. Capture the result
 * in a local at the top of your function and use it after any subsequent
 * `await`, the way `waitForLoadingComplete` does.
 */
export function getCallerLabel(): string {
  const original = Error.prepareStackTrace
  try {
    Error.prepareStackTrace = (_err, stack) => stack
    const holder: { stack?: unknown } = {}
    Error.captureStackTrace(holder, getCallerLabel)
    const stack = holder.stack as NodeJS.CallSite[] | undefined
    // stack[0] is whoever called getCallerLabel (e.g. waitForLoadingComplete);
    // stack[1] is that function's own caller -- the one we want to report.
    const frame = stack?.[1]
    if (!frame) return 'unknown'

    const fnName = frame.getFunctionName() ?? frame.getMethodName()
    const file = frame.getFileName()?.split('/').pop() ?? 'unknown'
    const line = frame.getLineNumber()
    const location = `${file}:${line}`
    return fnName ? `${fnName} (${location})` : `<anonymous> (${location})`
  } finally {
    Error.prepareStackTrace = original
  }
}
