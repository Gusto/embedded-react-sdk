/**
 * Generates a unique ID for lists to avoid conflicts when using multiple lists in the same page
 */
export function generateUniqueListId(prefix = 'reorderable-list'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Reorders an array by moving an element from one position to another
 */
export function reorderArray<T>(array: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= array.length || to < 0 || to > array.length) {
    return [...array]
  }

  const newArray = [...array]
  const [removed] = newArray.splice(from, 1)

  if (removed === undefined) {
    return [...array]
  }

  newArray.splice(to, 0, removed)
  return newArray
}

/**
 * Calculates the new order of indices after a reordering operation
 */
export function calculateNewOrder(
  currentOrder: number[],
  fromPosition: number,
  toPosition: number,
): number[] {
  if (
    fromPosition === toPosition ||
    fromPosition < 0 ||
    fromPosition >= currentOrder.length ||
    toPosition < 0 ||
    toPosition > currentOrder.length
  ) {
    return [...currentOrder]
  }

  return reorderArray(currentOrder, fromPosition, toPosition)
}

/**
 * Adjusts a target position when moving an element in an array
 */
export function adjustTargetPosition(
  fromPosition: number,
  toPosition: number,
  source: 'keyboard' | 'dragdrop' = 'dragdrop',
): number {
  // When dragging, adjust the target position if moving an element forward
  if (source === 'dragdrop' && fromPosition < toPosition) {
    return toPosition - 1
  }
  return toPosition
}
