import { useMemo } from 'react'

type SelectionState = {
  allSelected: boolean
  someSelected: boolean
  isIndeterminate: boolean
}

export function useSelectionState<T>(
  data: T[],
  isItemSelected?: (item: T, index: number) => boolean,
): SelectionState {
  return useMemo(() => {
    if (data.length === 0 || !isItemSelected) {
      return { allSelected: false, someSelected: false, isIndeterminate: false }
    }

    let selectedCount = 0
    data.forEach((item, i) => {
      if (isItemSelected(item, i)) selectedCount++
    })

    const allSelected = selectedCount === data.length
    const someSelected = selectedCount > 0

    return {
      allSelected,
      someSelected,
      isIndeterminate: someSelected && !allSelected,
    }
  }, [data, isItemSelected])
}
