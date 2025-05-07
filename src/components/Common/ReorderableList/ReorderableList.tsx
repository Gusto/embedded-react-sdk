import { useRef, useState, useEffect, useCallback } from 'react'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { ReorderableListProps, ReorderableListAnimationConfig } from './ReorderableListTypes'
import styles from './ReorderableList.module.scss'
import { ReorderableItem } from './ReorderableItem'
import { DropZone } from './DropZone'
import { generateUniqueListId, calculateNewOrder, adjustTargetPosition } from './utils'

// Default animation config
const DEFAULT_ANIMATION_CONFIG: ReorderableListAnimationConfig = {
  duration: 200,
  easing: 'ease-in-out',
  disabled: false,
}

/**
 * A reorderable list component that supports both drag-and-drop and keyboard-based reordering
 * with full accessibility support.
 */
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
  useTranslation('common')
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null)

  // Track the current drag operation
  const [isDragging, setIsDragging] = useState(false)
  // Track whether any item is in reordering mode (for keyboard navigation)
  const [isReorderingActive, setIsReorderingActive] = useState(false)
  // Keep track of which item is in reordering mode
  const [reorderingItemIndex, setReorderingItemIndex] = useState<number | null>(null)

  const pendingReorderRef = useRef<boolean>(false)

  // Track whether DnD is fully initialized
  const [isInitialized, setIsInitialized] = useState(false)

  // Ref to track which drop zones are active to prevent flicker
  const activeDropZonesRef = useRef<Record<number, boolean>>({})

  // Merge animation config with defaults
  const mergedAnimationConfig = {
    ...DEFAULT_ANIMATION_CONFIG,
    ...animationConfig,
  }

  // On mount, ensure DnD is properly initialized
  useEffect(() => {
    let mounted = true

    const timer = setTimeout(() => {
      if (mounted) {
        setIsInitialized(true)
      }
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (items.length !== itemOrder.length) {
      setItemOrder(Array.from({ length: items.length }, (_, i) => i))
    }
  }, [items.length, itemOrder.length])

  // Debounced state setter for drop zones to prevent flickering
  const activateDropZone = useCallback((position: number) => {
    // Clear any other active drop zones
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

  /**
   * Moves an item from one position to another and updates the order state
   */
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
              <div style={{ flex: 1 }}>{item.content}</div>
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
                isInitialized={isInitialized}
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
