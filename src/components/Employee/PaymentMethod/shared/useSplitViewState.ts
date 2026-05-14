import { useEffect, useRef } from 'react'
import type { useForm } from 'react-hook-form'
import type { CombinedSchemaInputs } from './paymentMethodSchema'
import type { WorkingSplit } from './SplitViewFields'
import { SPLIT_BY } from '@/shared/constants'

export function useSplitViewState({
  splits,
  formMethods,
}: {
  splits: WorkingSplit[]
  formMethods: ReturnType<typeof useForm<CombinedSchemaInputs>>
}) {
  const { setValue, resetField, watch } = formMethods
  const splitBy = watch('splitBy')
  const priorities = watch('priority')

  const remainderId = Object.entries(priorities).reduce(
    (maxId, [uuid, priority]) => (!maxId || (priorities[maxId] ?? 0) < priority ? uuid : maxId),
    '',
  )

  // Use refs so the effect reads current splits/remainderId without re-running on every reorder
  const splitsRef = useRef(splits)
  splitsRef.current = splits
  const remainderIdRef = useRef(remainderId)
  remainderIdRef.current = remainderId

  useEffect(() => {
    if (!splitsRef.current.length) return
    if (splitBy === SPLIT_BY.amount) {
      const newValues = splitsRef.current.reduce<Record<string, number | null>>((acc, curr) => {
        acc[curr.uuid] = curr.uuid === remainderIdRef.current ? null : 0
        return acc
      }, {})
      setValue('splitAmount', newValues)
    } else {
      const newValues = splitsRef.current.reduce<Record<string, number>>((acc, curr, index) => {
        acc[curr.uuid] = index === 0 ? 100 : 0
        return acc
      }, {})
      setValue('splitAmount', newValues)
    }
  }, [splitBy, setValue])

  const updateSplitAmount = (uuid: string, value: number | null) => {
    setValue(`splitAmount.${uuid}`, value)
  }

  const handleReorder = (newOrder: number[]) => {
    const newPriorities = newOrder.reduce(
      (acc: Record<string, number>, curr: number, currIndex: number) => {
        const split = splits[curr]
        return split ? { ...acc, [split.uuid]: currIndex + 1 } : acc
      },
      {},
    )
    const lastSplitIndex = newOrder[newOrder.length - 1]
    if (lastSplitIndex === undefined) return
    const lastSplit = splits[lastSplitIndex]
    if (!lastSplit) return
    setValue('priority', newPriorities)
    if (remainderId && remainderId !== lastSplit.uuid) {
      resetField(`splitAmount.${remainderId}`)
      updateSplitAmount(remainderId, 0)
    }
    updateSplitAmount(lastSplit.uuid, null)
  }

  return { splitBy, remainderId, updateSplitAmount, handleReorder }
}
