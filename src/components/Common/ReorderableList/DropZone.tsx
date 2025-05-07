import { useRef, useEffect, memo } from 'react'
import classnames from 'classnames'
import { useDrop } from 'react-dnd'
import styles from './ReorderableList.module.scss'
import { ITEM_TYPE } from './constants'

/**
 * Props for the DropZone component
 */
interface DropZoneProps {
  /**
   * Position in the list where this drop zone appears
   */
  position: number

  /**
   * Whether this drop zone is currently active (being targeted)
   */
  isActive: boolean

  /**
   * Callback when the drop zone becomes active
   */
  onActivate: () => void

  /**
   * Callback when the drop zone is no longer active
   */
  onDeactivate: () => void

  /**
   * Callback when an item is dropped on this zone
   */
  onDrop: (fromPosition: number) => void

  /**
   * ID of the parent list to ensure drops only work within the same list
   */
  listId: string

  /**
   * Optional CSS class to apply to the drop zone
   */
  className?: string
}

/**
 * Component for drop zones between items
 */
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

  // Track if the drop operation has been handled
  const dropHandledRef = useRef(false)

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

        if (dropHandledRef.current) return
        dropHandledRef.current = true

        setTimeout(() => {
          dropHandledRef.current = false
        }, 100)

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

  useEffect(() => {
    if (ref.current) {
      drop(ref.current)
    }
  }, [drop])

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
        aria-label="Drop item here"
      />
    </div>
  )
})
