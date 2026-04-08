import { useMemo } from 'react'

type SelectionState = {
  allSelected: boolean
  someSelected: boolean
}

export function useSelectionState<T>(
  data: T[],
  getIsItemSelected?: (item: T) => boolean,
): SelectionState {
  return useMemo(() => {
    if (data.length === 0 || !getIsItemSelected) {
      return { allSelected: false, someSelected: false }
    }

    let selectedCount = 0
    data.forEach(item => {
      if (getIsItemSelected(item)) selectedCount++
    })

    return {
      allSelected: selectedCount === data.length,
      someSelected: selectedCount > 0,
    }
  }, [data, getIsItemSelected])
}
