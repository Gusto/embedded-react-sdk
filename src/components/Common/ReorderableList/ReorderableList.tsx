import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import classnames from 'classnames'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { ReactElement } from 'react'
import type { ReorderableListItem } from './ReorderableListTypes'
import styles from './ReorderableList.module.scss'
import { ReorderableItem } from './ReorderableItem'
import { DropZone } from './DropZone'

// Helper functions
function generateUniqueListId(prefix = 'reorderable-list'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function reorderArray<T>(array: T[], from: number, to: number): T[] {
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

function calculateNewOrder(
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

function adjustTargetPosition(
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

interface ReorderableListAnimationConfig {
  duration?: number
  easing?: string
  disabled?: boolean
}

interface ReorderableListProps {
  items: ReorderableListItem[]
  label: string
  onReorder?: (itemOrder: number[]) => void
  className?: string
  animationConfig?: ReorderableListAnimationConfig
  disabled?: boolean
  renderDragHandle?: (props: {
    id: string | number
    label: string
    isReordering: boolean
    isDragging: boolean
  }) => ReactElement
  dropZoneClassName?: string
  itemClassName?: string
}

// Default animation config
const DEFAULT_ANIMATION_CONFIG: ReorderableListAnimationConfig = {
  duration: 200,
  easing: 'ease-in-out',
  disabled: false,
}

export function ReorderableList({
  items,
  label,
  onReorder,
  className,
  animationConfig = DEFAULT_ANIMATION_CONFIG,
  disabled = false,
  renderDragHandle,
  dropZoneClassName,
  itemClassName,
}: ReorderableListProps) {
  const listId = useRef(generateUniqueListId()).current

  const [itemOrder, setItemOrder] = useState<number[]>(() =>
    Array.from({ length: items.length }, (_, i) => i),
  )
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isReorderingActive, setIsReorderingActive] = useState(false)
  const [reorderingItemIndex, setReorderingItemIndex] = useState<number | null>(null)
  const pendingReorderRef = useRef<boolean>(false)
  const activeDropZonesRef = useRef<Record<number, boolean>>({})

  const mergedAnimationConfig = useMemo(
    () => ({
      ...DEFAULT_ANIMATION_CONFIG,
      ...animationConfig,
    }),
    [animationConfig],
  )

  useEffect(() => {
    if (items.length !== itemOrder.length) {
      setItemOrder(Array.from({ length: items.length }, (_, i) => i))
    }
  }, [items.length, itemOrder.length])

  // Debounced state setter for drop zones to prevent flickering
  const activateDropZone = useCallback((position: number) => {
    activeDropZonesRef.current = {}
    activeDropZonesRef.current[position] = true
    setActiveDropZone(position)
  }, [])

  const deactivateDropZone = useCallback((position: number) => {
    if (position in activeDropZonesRef.current) {
      activeDropZonesRef.current[position] = false
    }

    const activeDropZones = Object.entries(activeDropZonesRef.current)
      .filter(([_, isActive]) => isActive)
      .map(([pos]) => Number(pos))

    if (activeDropZones.length === 0) {
      setActiveDropZone(null)
    } else if (activeDropZones.length === 1) {
      setActiveDropZone(Number(activeDropZones[0]))
    }
  }, [])

  const moveItem = useCallback(
    (fromPosition: number, toPosition: number, source: 'keyboard' | 'dragdrop' = 'dragdrop') => {
      if (
        disabled ||
        fromPosition === toPosition ||
        fromPosition < 0 ||
        fromPosition >= itemOrder.length ||
        toPosition < 0 ||
        toPosition > itemOrder.length
      ) {
        return
      }

      pendingReorderRef.current = true
      const movedItemIndex = itemOrder[fromPosition]

      // Use utility function to calculate new order
      const newOrder = calculateNewOrder(
        itemOrder,
        fromPosition,
        adjustTargetPosition(fromPosition, toPosition, source),
      )

      setItemOrder(newOrder)

      // Use the configured animation duration
      const animationDuration = mergedAnimationConfig.disabled ? 0 : mergedAnimationConfig.duration

      setTimeout(() => {
        setIsDragging(false)
        pendingReorderRef.current = false
        activeDropZonesRef.current = {}
        setActiveDropZone(null)

        if (source === 'keyboard') {
          const newPosition = newOrder.findIndex(idx => idx === movedItemIndex)

          if (newPosition >= 0) {
            setReorderingItemIndex(newPosition)
            const dragButtons = document.querySelectorAll(
              `[data-list-id="${listId}"] .${styles.dragHandle} button`,
            )

            if (newPosition < dragButtons.length) {
              // Use requestAnimationFrame for smoother focus handling
              requestAnimationFrame(() => {
                if (dragButtons[newPosition]) {
                  const buttonToFocus = dragButtons[newPosition] as HTMLElement
                  buttonToFocus.focus()
                }
              })
            }
          }
        }

        if (onReorder) {
          onReorder(newOrder)
        }
      }, animationDuration)
    },
    [itemOrder, listId, onReorder, disabled, mergedAnimationConfig],
  )

  // If the list is disabled, don't render the DnD functionality
  if (disabled) {
    return (
      <div
        role="list"
        aria-label={label}
        className={classnames(styles.reorderableList, className, styles.disabled)}
        data-list-id={listId}
        data-testid="reorderable-list"
      >
        {itemOrder.map(itemIndex => {
          const item = items[itemIndex]
          if (!item) return null

          return (
            <div
              key={`item-static-${item.id || itemIndex}`}
              role="listitem"
              className={classnames(styles.reorderableItem, itemClassName)}
            >
              <div className={styles.contentContainer}>{item.content}</div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        role="list"
        aria-label={label}
        className={classnames(styles.reorderableList, className)}
        data-list-id={listId}
        data-testid="reorderable-list"
        style={{
          ...(!mergedAnimationConfig.disabled &&
            ({
              '--animation-duration': `${mergedAnimationConfig.duration}ms`,
              '--animation-easing': mergedAnimationConfig.easing,
            } as React.CSSProperties)),
        }}
      >
        <DropZone
          position={0}
          listId={listId}
          isActive={activeDropZone === 0}
          onActivate={() => {
            activateDropZone(0)
          }}
          onDeactivate={() => {
            deactivateDropZone(0)
          }}
          onDrop={(fromPosition: number) => {
            if (!pendingReorderRef.current) {
              moveItem(fromPosition, 0, 'dragdrop')
            }
          }}
          className={dropZoneClassName}
        />

        {itemOrder.map((itemIndex, position) => {
          const item = items[itemIndex]
          if (!item) return null

          return (
            <div key={`item-container-${item.id || itemIndex}-${position}`}>
              <ReorderableItem
                key={`item-${item.id || itemIndex}`}
                item={item}
                index={position}
                moveItem={moveItem}
                itemCount={items.length}
                itemIndex={itemIndex}
                listId={listId}
                isDraggingAny={isDragging}
                setIsDragging={setIsDragging}
                isReorderingActive={isReorderingActive}
                setIsReorderingActive={setIsReorderingActive}
                isCurrentlyReordering={isReorderingActive && reorderingItemIndex === position}
                setReorderingItemIndex={setReorderingItemIndex}
                renderDragHandle={renderDragHandle}
                className={itemClassName}
              />

              <DropZone
                position={position + 1}
                listId={listId}
                isActive={activeDropZone === position + 1}
                onActivate={() => {
                  activateDropZone(position + 1)
                }}
                onDeactivate={() => {
                  deactivateDropZone(position + 1)
                }}
                onDrop={(fromPosition: number) => {
                  if (!pendingReorderRef.current) {
                    moveItem(fromPosition, position + 1, 'dragdrop')
                  }
                }}
                className={dropZoneClassName}
              />
            </div>
          )
        })}
      </div>
    </DndProvider>
  )
}
