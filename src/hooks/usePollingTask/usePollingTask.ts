import { useCallback, useEffect, useRef, useState } from 'react'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'

/**
 * The outcome of evaluating a single poll tick.
 *
 * @remarks
 * `'done'` (a domain-understood outcome, success or real failure) and `'error'` (the read failed
 * in a way not worth retrying, so the poll never learned what happened) are both terminal but go
 * to different callbacks — `onDone` and `onError` — so callers can't conflate the two.
 *
 * @typeParam TValue - The terminal value handed to `onDone`.
 * @internal
 */
export type PollTickResult<TValue> =
  { status: 'polling' } | { status: 'done'; value: TValue } | { status: 'error'; error: unknown }

/**
 * The result of one poll tick's read — the data it resolved to, or the error it rejected with.
 *
 * @remarks
 * `lastData` (rejection only) is the most recent successfully-read data, or `null` if none has
 * succeeded yet — the same value `onDeadline` receives, and worth verifying against for the same
 * reason.
 *
 * @typeParam TData - The value a successful read resolves to.
 * @internal
 */
export type PollReadOutcome<TData> =
  { success: true; data: TData } | { success: false; error: unknown; lastData: TData | null }

const NON_RETRYABLE_HTTP_STATUSES = new Set([401, 403])

/**
 * Whether a poll read's error is not worth retrying.
 *
 * @remarks
 * `SDKValidationError` (also matches `ResponseValidationError`) means the response failed schema
 * validation. A 401/403 means the session that started the poll expired mid-poll (SDK-1291) --
 * neither recovers by retrying. Everything else (network blips, timeouts, transient 5xx) may
 * still succeed on the next tick.
 *
 * @internal
 */
export function isNonRetryablePollError(error: unknown): boolean {
  if (error instanceof SDKValidationError) return true
  return (
    error instanceof GustoEmbeddedError &&
    NON_RETRYABLE_HTTP_STATUSES.has(error.httpMeta.response.status)
  )
}

/**
 * Configuration for {@link usePollingTask}.
 *
 * @typeParam TData - The value each poll read resolves to.
 * @typeParam TValue - The terminal value produced by `evaluate` and handed to `onDone`.
 * @internal
 */
export interface UsePollingTaskOptions<TData, TValue> {
  /** Reads the current server state for one tick. Rejections are passed to `evaluate`, not thrown. */
  fetch: (signal: AbortSignal) => Promise<TData>
  /**
   * Decides whether the operation has reached a terminal state, from this tick's read outcome.
   * Called on every tick, including ones where `fetch` rejected — see {@link PollReadOutcome} and
   * {@link isNonRetryablePollError}.
   */
  evaluate: (outcome: PollReadOutcome<TData>) => PollTickResult<TValue>
  /** Called once, from the poll loop, when `evaluate` reports a `'done'` terminal state. */
  onDone: (value: TValue) => void
  /** Called once, from the poll loop, when `evaluate` reports an `'error'` terminal state. */
  onError: (error: unknown) => void
  /**
   * Called once when `deadlineMs` elapses without a terminal state, with the most recent data
   * successfully read (or `null` if no read ever succeeded). Verify against that data before
   * reporting a failure.
   */
  onDeadline: (lastData: TData | null) => void
  /** Delay between the end of one tick and the start of the next. Defaults to {@link DEFAULT_POLL_INTERVAL_MS}. */
  intervalMs?: number
  /** How long the task may run before `onDeadline` is called. Defaults to {@link DEFAULT_POLL_DEADLINE_MS}. */
  deadlineMs?: number
}

/**
 * Default delay between polling reads.
 *
 * @internal
 */
export const DEFAULT_POLL_INTERVAL_MS = 5_000

/**
 * Default duration a polling task may run before its deadline fires.
 *
 * @internal
 */
export const DEFAULT_POLL_DEADLINE_MS = 3 * 60 * 1000

/**
 * An imperative handle to a polling task.
 *
 * @internal
 */
export interface PollingTask {
  /** Begins polling, reading once immediately. Restarts the task if one is already running. */
  start: () => void
  /** Stops polling without calling `onDone` or `onDeadline`. */
  stop: () => void
  /** Whether the task is currently running. Safe to render; not used to decide completion. */
  isPolling: boolean
}

/**
 * Polls an async operation to completion in a self-contained loop that owns its own timer and
 * decides the terminal state from the data it reads.
 *
 * @remarks
 * Use this instead of driving a poll from a query's `refetchInterval` and reacting to the result
 * in an effect. That pattern makes completion depend on a render arriving — if the query
 * observer never notifies the component, the operation finishes on the server and the screen
 * never advances (SDK-1291). Here the loop reads the server directly and evaluates the result in
 * its own closure, so the terminal decision does not depend on the component rendering.
 *
 * Behavior worth knowing:
 *
 * - `start()` reads immediately, then every `intervalMs` after the previous read settles, so a
 *   slow read never stacks up overlapping requests.
 * - A rejected read isn't thrown; it's handed to `evaluate` as a {@link PollReadOutcome}, since
 *   SDK queries are configured with `retry: false`. See {@link PollTickResult} for how `evaluate`
 *   routes a read error to `'polling'` (retry) vs `'error'` (give up). When `fetch` reads through
 *   a shared query key, observers of that key still see the error even though the task carries on.
 * - A `'done'` or `'error'` result on the deadline tick wins over the deadline, and `onDeadline`
 *   receives the last data read so the caller can verify before declaring failure.
 * - Each tick bumps internal state, which gives the calling component a render source
 *   independent of any query observer. Fresh cache data is then picked up on that render.
 * - `stop()` and unmount abort the in-flight read and guarantee no further callbacks fire.
 *
 * Callbacks are read through a ref, so changing their identity between renders never restarts
 * the loop.
 *
 * @typeParam TData - The value each poll read resolves to.
 * @typeParam TValue - The terminal value produced by `evaluate` and handed to `onDone`.
 * @param options - See {@link UsePollingTaskOptions}.
 * @returns The {@link PollingTask} handle.
 * @internal
 */
export function usePollingTask<TData, TValue>(
  options: UsePollingTaskOptions<TData, TValue>,
): PollingTask {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const runIdRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [, setTickCount] = useState(0)

  const teardown = useCallback(() => {
    runIdRef.current += 1
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    controllerRef.current?.abort()
    controllerRef.current = null
  }, [])

  const stop = useCallback(() => {
    teardown()
    setIsPolling(false)
  }, [teardown])

  const start = useCallback(() => {
    teardown()

    const runId = runIdRef.current
    const controller = new AbortController()
    controllerRef.current = controller
    const { intervalMs = DEFAULT_POLL_INTERVAL_MS, deadlineMs = DEFAULT_POLL_DEADLINE_MS } =
      optionsRef.current
    const deadline = Date.now() + deadlineMs
    let last: { value: TData } | null = null

    setIsPolling(true)

    const isCurrentRun = () => runIdRef.current === runId

    const tick = async () => {
      if (!isCurrentRun()) return

      const { fetch: read, evaluate, onDone, onError, onDeadline } = optionsRef.current

      let outcome: PollReadOutcome<TData>
      try {
        const data = await read(controller.signal)
        last = { value: data }
        outcome = { success: true, data }
      } catch (error) {
        outcome = { success: false, error, lastData: last ? last.value : null }
      }

      if (!isCurrentRun()) return

      setTickCount(count => count + 1)

      const result = evaluate(outcome)
      if (result.status === 'done') {
        stop()
        onDone(result.value)
        return
      }
      if (result.status === 'error') {
        stop()
        onError(result.error)
        return
      }

      if (Date.now() >= deadline) {
        stop()
        onDeadline(last ? last.value : null)
        return
      }

      timeoutRef.current = setTimeout(() => {
        void tick()
      }, intervalMs)
    }

    void tick()
  }, [teardown, stop])

  useEffect(() => teardown, [teardown])

  return { start, stop, isPolling }
}
