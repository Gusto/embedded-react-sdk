import { useMemo } from 'react'

type SelectionState = {
  allSelected: boolean
  isIndeterminate: boolean
}

export function useSelectionState<T>(
  data: T[],
  getIsItemSelected?: (item: T) => boolean,
): SelectionState {
  return useMemo(() => {
    if (data.length === 0 || !getIsItemSelected) {
      return { allSelected: false, isIndeterminate: false }
    }

    const allSelected = data.every(getIsItemSelected)
    const someSelected = data.some(getIsItemSelected)

    return { allSelected, isIndeterminate: someSelected && !allSelected }
  }, [data, getIsItemSelected])
}
