import { useMemo } from 'react'

type SelectionState = {
  allSelected: boolean
}

export function useSelectionState<T>(
  data: T[],
  getIsItemSelected?: (item: T) => boolean,
): SelectionState {
  return useMemo(() => {
    if (data.length === 0 || !getIsItemSelected) {
      return { allSelected: false }
    }

    const allSelected = data.every(getIsItemSelected)

    return { allSelected }
  }, [data, getIsItemSelected])
}
