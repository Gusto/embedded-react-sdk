import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The outcome of evaluating a single poll tick.
 *
 * @typeParam TValue - The terminal value handed to `onDone`.
 * @internal
 */
export type PollTickResult<TValue> = { done: true; value: TValue } | { done: false }

/**
 * Configuration for {@link usePollingTask}.
 *
 * @typeParam TData - The value each poll read resolves to.
 * @typeParam TValue - The terminal value produced by `evaluate` and handed to `onDone`.
 * @internal
 */
export interface UsePollingTaskOptions<TData, TValue> {
  /** Reads the current server state for one tick. Rejections are tolerated and retried next tick. */
  fetch: (signal: AbortSignal) => Promise<TData>
  /**
   * Decides whether the operation has reached a terminal state, from the data this tick just
   * read. Must not depend on rendered state — that dependency is the bug this hook exists to
   * avoid.
   */
  evaluate: (data: TData) => PollTickResult<TValue>
  /** Called once, from the poll loop, when `evaluate` reports a terminal state. */
  onDone: (value: TValue) => void
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
 * - A rejected read is not a failed task. It is ignored and retried on the next tick, which
 *   matters because SDK queries are configured with `retry: false`. Note that when `fetch` reads
 *   through a shared query key, the failure is still recorded on that key, so observers of it
 *   see the error state even though the task carries on.
 * - A terminal result on the deadline tick wins over the deadline, and `onDeadline` receives the
 *   last data read so the caller can verify before declaring failure.
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

      const { fetch: read, evaluate, onDone, onDeadline } = optionsRef.current

      try {
        last = { value: await read(controller.signal) }
      } catch {
        // One failed read is not a failed task — try again on the next tick.
      }

      if (!isCurrentRun()) return

      setTickCount(count => count + 1)

      if (last) {
        const result = evaluate(last.value)
        if (result.done) {
          stop()
          onDone(result.value)
          return
        }
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
