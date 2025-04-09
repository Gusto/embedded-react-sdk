import { type Ref, type RefCallback, type RefObject, useMemo } from 'react'

const setRef = <T>(
  ref: RefObject<T | null> | ((instance: T | null) => void) | null | undefined,
  value: T | null,
) => {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

/**
 * Sets multiple refs with a single handler.
 * @param refs - The refs to set.
 * @returns A single ref handler that sets all the provided refs which can be passed to the `ref` prop of a component.
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
