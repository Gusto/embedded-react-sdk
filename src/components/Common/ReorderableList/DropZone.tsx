import { useRef, useEffect, memo } from 'react'
import classnames from 'classnames'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import styles from './ReorderableList.module.scss'
import { ITEM_TYPE } from './constants'

interface DropZoneProps {
  position: number
  isActive: boolean
  onActivate: () => void
  onDeactivate: () => void
  onDrop: (fromPosition: number) => void
  listId: string
  className?: string
}

export const DropZone = memo(function DropZone({
  position,
  isActive,
  onActivate,
  onDeactivate,
  onDrop,
  listId,
  className,
}: DropZoneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  // Add a debounce timer for hover state changes to prevent flickering
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHoveringRef = useRef(false)

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      hover: (item: { index: number; listId: string }, monitor) => {
        if (item.listId !== listId) return

        const clientOffset = monitor.getClientOffset()
        if (!clientOffset || !ref.current) return

        if (isHoveringRef.current) return

        isHoveringRef.current = true

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        onActivate()
      },
      collect: monitor => ({
        isOver: !!monitor.isOver(),
      }),
      drop: (item: { index: number; listId: string }) => {
        if (item.listId !== listId) return
        onDeactivate()
        onDrop(item.index)
        return { dropped: true }
      },
      canDrop: (item: { index: number; listId: string }) => {
        if (item.listId !== listId) return false
        return item.index !== position && item.index !== position - 1
      },
    }),
    [listId, onActivate, onDeactivate, onDrop, position],
  )

  // Connect the drop ref to the DOM element
  useEffect(() => {
    if (ref.current) {
      drop(ref.current)
    }
  }, [drop])

  // Handle deactivation when item is no longer being hovered
  useEffect(() => {
    if (!isOver && isActive) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        isHoveringRef.current = false
        onDeactivate()
        debounceTimerRef.current = null
      }, 100)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [isOver, isActive, onDeactivate])

  const isHighlighted = isActive || isOver

  const dropZoneClass = classnames(
    styles.dropZone,
    isActive || isOver ? styles.activeDropZone : '',
    isHighlighted ? styles.isHighlighted : '',
    className,
  )

  return (
    <div className={styles.dropZoneContainer}>
      <div
        ref={ref}
        className={dropZoneClass}
        data-position={position}
        data-list-id={listId}
        aria-hidden="true"
        aria-label={t('reorderableList.dropItemHere')}
      />
    </div>
  )
})
