import { useMemo } from 'react'

type SelectionState = {
  allSelected: boolean
  someSelected: boolean
}

export function useSelectionState<T>(
  data: T[],
  isItemSelected?: (item: T, index: number) => boolean,
): SelectionState {
  return useMemo(() => {
    if (data.length === 0 || !isItemSelected) {
      return { allSelected: false, someSelected: false }
    }

    let selectedCount = 0
    data.forEach((item, i) => {
      if (isItemSelected(item, i)) selectedCount++
    })

    return {
      allSelected: selectedCount === data.length,
      someSelected: selectedCount > 0,
    }
  }, [data, isItemSelected])
}
