import { type Ref, type RefCallback, type RefObject, useMemo } from 'react'

const setRef = <T>(
  ref: RefObject<T | null> | ((instance: T | null) => void) | null | undefined,
  value: T | null,
) => {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

/**
 * Combines multiple refs into a single ref callback that can be passed to a component's `ref` prop.
 *
 * @typeParam Instance - The element or instance type the refs point to.
 * @param refs - Refs to fork. Each may be a ref object, a ref callback, or `undefined`.
 * @returns A single ref callback that assigns the instance to every provided ref, or `null` when all refs are nullish.
 * @internal
 */
export const useForkRef = <Instance>(
  ...refs: Array<Ref<Instance> | undefined>
): RefCallback<Instance> | null => {
  return useMemo(() => {
    if (refs.every(ref => ref == null)) {
      return null
    }

    return instance => {
      refs.forEach(ref => {
        setRef(ref, instance)
      })
    }
  }, [refs])
}
