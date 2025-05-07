import { useRef, useState, useEffect, useId } from 'react'
import { useDrag, useDrop, VisuallyHidden } from 'react-aria'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'
import type { ReorderableItemProps, ReorderableListProps } from './ReorderableListTypes'
import styles from './ReorderableList.module.scss'
import ListIcon from '@/assets/icons/list.svg?react'
import { ButtonIcon } from '@/components/Common/UI/Button/ButtonIcon'

/**
 * Helper component for accessibility announcements
 * Uses aria-live to ensure screen readers announce updates
 */
function LiveAnnouncement({ message }: { message: string }) {
  // Generate a unique ID for this live region
  const id = useId()

  // The key prop forces React to re-render the element when the message changes
  // This ensures screen readers detect the change and announce it
  return message ? (
    <div
      key={message}
      id={id}
      aria-live="assertive"
      aria-atomic="true"
      className={styles.visuallyHidden || 'visually-hidden'}
      role="status"
    >
      {message}
    </div>
  ) : null
}

/**
 * A reorderable list component that supports both drag-and-drop and keyboard-based reordering
 * with full accessibility support.
 */
export function ReorderableList({ items, label, onReorder, className }: ReorderableListProps) {
  const [itemOrder, setItemOrder] = useState<number[]>(() => {
    return Array.from({ length: items.length }, (_, i) => i)
  })
  const { t } = useTranslation('common')
  const [announcement, setAnnouncement] = useState<string>('')
  const announcementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (items.length !== itemOrder.length) {
      setItemOrder(Array.from({ length: items.length }, (_, i) => i))
    }
  }, [items.length, itemOrder.length])

  useEffect(() => {
    // Clear any existing timeout
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current)
    }

    if (announcement) {
      // Set a new timeout to clear the announcement
      announcementTimeoutRef.current = setTimeout(() => {
        setAnnouncement('')
        announcementTimeoutRef.current = null
      }, 2000)
    }

    // Cleanup on unmount
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current)
      }
    }
  }, [announcement])

  /**
   * Moves an item from one position to another and updates the order state
   * @param fromPosition The current position of the item
   * @param toPosition The target position for the item
   * @param source Whether the reordering is from keyboard or drag-and-drop
   */
  const moveItem = (
    fromPosition: number,
    toPosition: number,
    source: 'keyboard' | 'dragdrop' = 'dragdrop',
  ) => {
    if (
      fromPosition === toPosition ||
      fromPosition < 0 ||
      fromPosition >= itemOrder.length ||
      toPosition < 0 ||
      toPosition > itemOrder.length
    ) {
      return
    }

    const newOrder = [...itemOrder]
    const [movedValue] = newOrder.splice(fromPosition, 1)

    if (movedValue === undefined) {
      return
    }

    const adjustedPosition =
      source === 'dragdrop' && fromPosition < toPosition ? toPosition - 1 : toPosition
    newOrder.splice(adjustedPosition, 0, movedValue)

    setItemOrder(newOrder)

    const itemLabel = items[movedValue]?.label || `Item ${movedValue + 1}`

    if (fromPosition < toPosition) {
      setAnnouncement(
        t('reorderableList.itemMovedDown', {
          item: itemLabel,
          position: String(toPosition + 1),
          total: String(itemOrder.length),
        }),
      )
    } else {
      setAnnouncement(
        t('reorderableList.itemMovedUp', {
          item: itemLabel,
          position: String(toPosition + 1),
          total: String(itemOrder.length),
        }),
      )
    }

    if (onReorder) {
      onReorder(newOrder)
    }
  }

  const [activeDropZone, setActiveDropZone] = useState<number | null>(null)

  return (
    <div role="list" aria-label={label} className={classnames(styles.reorderableList, className)}>
      <LiveAnnouncement message={announcement} />

      <DropZone
        position={0}
        isActive={activeDropZone === 0}
        onActivate={() => {
          setActiveDropZone(0)
        }}
        onDeactivate={() => {
          setActiveDropZone(null)
        }}
        onDrop={fromPosition => {
          moveItem(fromPosition, 0, 'dragdrop')
        }}
      />

      {itemOrder.map((itemIndex, position) => {
        const item = items[itemIndex]
        if (!item) return null

        return (
          <div key={`item-container-${itemIndex}`}>
            <ReorderableItem
              key={`item-${itemIndex}`}
              item={item}
              index={position}
              moveItem={moveItem}
              itemCount={items.length}
              itemIndex={itemIndex}
            />

            <DropZone
              position={position + 1}
              isActive={activeDropZone === position + 1}
              onActivate={() => {
                setActiveDropZone(position + 1)
              }}
              onDeactivate={() => {
                setActiveDropZone(null)
              }}
              onDrop={fromPosition => {
                moveItem(fromPosition, position + 1, 'dragdrop')
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

/**
 * Component for drop zones between items
 * Handles the visual indication and logic for dropping items between list items
 */
function DropZone({
  position,
  isActive,
  onActivate,
  onDeactivate,
  onDrop,
}: {
  position: number
  isActive: boolean
  onActivate: () => void
  onDeactivate: () => void
  onDrop: (fromPosition: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const { dropProps, isDropTarget } = useDrop({
    ref,
    onDropEnter: () => {
      onActivate()
    },
    onDropExit: () => {
      onDeactivate()
    },
    onDrop: async e => {
      const textItem = e.items.find(item => item.kind === 'text')
      if (!textItem) {
        return
      }

      try {
        const textValue = await textItem.getText('text/plain')
        const fromPosition = parseInt(textValue, 10)
        if (!isNaN(fromPosition)) {
          onDrop(fromPosition)
        }
      } catch (error) {
        // Errors during drag and drop are generally non-critical
        // and should not break the user experience
      }
    },
  })

  const dropZoneClass = classnames(styles.dropZone, {
    [styles.activeDropZone as string]: isActive || isDropTarget,
  })

  const isHighlighted = isActive || isDropTarget

  // Define styles separately for readability
  const dropZoneStyles = {
    minHeight: isHighlighted ? '30px' : '12px',
    padding: '6px 0',
    margin: '0',
    position: 'relative',
    transition: 'all 0.15s ease-in-out',
    transform: isHighlighted ? 'scaleY(1.05)' : 'scaleY(1)',
  } as React.CSSProperties

  return (
    <div
      {...dropProps}
      ref={ref}
      className={dropZoneClass}
      data-position={position}
      aria-hidden="true"
      style={dropZoneStyles}
    />
  )
}

/**
 * Component for an individual reorderable item
 * Handles both drag-and-drop and keyboard-based reordering for a single item
 */
function ReorderableItem({
  item,
  index,
  moveItem,
  itemCount,
  itemIndex,
}: ReorderableItemProps & { itemIndex: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation('common')

  const [isBeingDragged, setIsBeingDragged] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [itemAnnouncement, setItemAnnouncement] = useState<string>('')
  const itemAnnouncementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Format the accessible item name
  const accessibleItemName = item.label

  useEffect(() => {
    // Clear any existing timeout
    if (itemAnnouncementTimeoutRef.current) {
      clearTimeout(itemAnnouncementTimeoutRef.current)
    }

    if (itemAnnouncement) {
      // Set a new timeout to clear the announcement
      itemAnnouncementTimeoutRef.current = setTimeout(() => {
        setItemAnnouncement('')
        itemAnnouncementTimeoutRef.current = null
      }, 1500)
    }

    // Cleanup on unmount
    return () => {
      if (itemAnnouncementTimeoutRef.current) {
        clearTimeout(itemAnnouncementTimeoutRef.current)
      }
    }
  }, [itemAnnouncement])

  const { dragProps, dragButtonProps } = useDrag({
    hasDragButton: true,
    getItems: () => {
      return [{ 'text/plain': index.toString() }]
    },
    onDragStart: () => {
      setIsBeingDragged(true)
      setItemAnnouncement(
        t('reorderableList.dragStarted', {
          item: accessibleItemName,
        }),
      )
    },
    onDragEnd: () => {
      setIsBeingDragged(false)
      setItemAnnouncement(
        t('reorderableList.dragEnded', {
          item: accessibleItemName,
        }),
      )
    },
  })

  useEffect(() => {
    if (isReordering && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [isReordering, index])

  /**
   * Handles keyboard interactions for reordering
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newReorderingState: boolean

    switch (e.key) {
      case 'ArrowUp':
        if (isReordering && index > 0) {
          e.preventDefault()
          moveItem(index, index - 1, 'keyboard')
          setItemAnnouncement(
            t('reorderableList.movedUp', {
              item: accessibleItemName,
              position: String(index),
              total: String(itemCount),
            }),
          )
        }
        break
      case 'ArrowDown':
        if (isReordering && index < itemCount - 1) {
          e.preventDefault()
          moveItem(index, index + 1, 'keyboard')
          setItemAnnouncement(
            t('reorderableList.movedDown', {
              item: accessibleItemName,
              position: String(index + 2),
              total: String(itemCount),
            }),
          )
        }
        break
      case 'Escape':
        if (isReordering) {
          e.preventDefault()
          setIsReordering(false)
          setItemAnnouncement(
            t('reorderableList.reorderingCanceled', {
              item: accessibleItemName,
            }),
          )
        }
        break
      case 'Tab':
        if (isReordering) {
          e.preventDefault()
          setIsReordering(false)
          setItemAnnouncement(
            t('reorderableList.reorderingExited', {
              item: accessibleItemName,
            }),
          )
        }
        break
      case ' ':
      case 'Enter':
        e.preventDefault()
        newReorderingState = !isReordering
        setIsReordering(newReorderingState)

        if (newReorderingState) {
          setItemAnnouncement(
            t('reorderableList.reorderingStarted', {
              item: accessibleItemName,
            }),
          )
        } else {
          setItemAnnouncement(
            t('reorderableList.reorderingComplete', {
              item: accessibleItemName,
            }),
          )
        }
        break
      default:
        break
    }
  }

  // Item is no longer a drop target - that's handled by the DropZone components
  const itemClasses = classnames(styles.reorderableItem, {
    [styles.dragging as string]: isBeingDragged,
    [styles.reordering as string]: isReordering,
  })

  // Content wrapper style
  const contentWrapperStyle = {
    flex: 1,
  } as React.CSSProperties

  return (
    <div
      {...dragProps}
      ref={ref}
      role="listitem"
      aria-posinset={index + 1}
      aria-setsize={itemCount}
      className={itemClasses}
      data-position={index}
      data-item-index={itemIndex}
      data-testid={`reorderable-item-${index}`}
      data-dragging={isBeingDragged ? 'true' : 'false'}
      data-reordering={isReordering ? 'true' : 'false'}
    >
      {/* Item-specific live announcement */}
      <LiveAnnouncement message={itemAnnouncement} />

      <VisuallyHidden>
        {t('reorderableList.draggablePosition', {
          item: accessibleItemName,
          position: String(index + 1),
          total: String(itemCount),
        })}
      </VisuallyHidden>
      <ButtonIcon
        {...dragButtonProps}
        className={styles.dragHandle}
        aria-label={
          isReordering
            ? t('reorderableList.draggableLabelActive', {
                item: accessibleItemName,
              })
            : t('reorderableList.draggableLabel', {
                item: accessibleItemName,
              })
        }
        onKeyDown={handleKeyDown}
        ref={buttonRef}
      >
        <ListIcon />
      </ButtonIcon>
      <div style={contentWrapperStyle}>{item.content}</div>
    </div>
  )
}
