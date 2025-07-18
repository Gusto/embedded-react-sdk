import { useRef, useEffect, useCallback, memo } from 'react'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useDrag } from 'react-dnd'
import type { ReactElement } from 'react'
import { VisuallyHidden } from '../VisuallyHidden'
import type { ReorderableListItem } from './ReorderableListTypes'
import styles from './ReorderableList.module.scss'
import { ITEM_TYPE } from './constants'
import ListIcon from '@/assets/icons/list.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ReorderableItemProps {
  item: ReorderableListItem
  index: number
  moveItem: (fromIndex: number, toIndex: number, source?: 'keyboard' | 'dragdrop') => void
  itemCount: number
  itemIndex: number
  listId: string
  isDraggingAny: boolean
  setIsDragging: (isDragging: boolean) => void
  isReorderingActive: boolean
  setIsReorderingActive: (isReorderingActive: boolean) => void
  isCurrentlyReordering: boolean
  setReorderingItemIndex: (reorderingItemIndex: number | null) => void
  renderDragHandle?: (props: {
    id: string | number
    label: string
    isReordering: boolean
    isDragging: boolean
  }) => ReactElement
  className?: string
}

/**
 * Component for an individual reorderable item
 */
export const ReorderableItem = memo(function ReorderableItem({
  item,
  index,
  moveItem,
  itemCount,
  itemIndex,
  listId,
  isDraggingAny,
  setIsDragging,
  isReorderingActive,
  setIsReorderingActive,
  isCurrentlyReordering,
  setReorderingItemIndex,
  renderDragHandle,
  className,
}: ReorderableItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation('common')
  const Components = useComponentContext()

  // Format the accessible item name
  const accessibleItemName = item.label

  // Add a ref to track if this specific item is being dragged
  const isBeingDraggedRef = useRef(false)

  // When this item becomes the reordering item, focus on it
  useEffect(() => {
    if (isCurrentlyReordering && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [isCurrentlyReordering])

  // React DnD - Drag source
  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: ITEM_TYPE,
      item: () => {
        isBeingDraggedRef.current = true
        setIsDragging(true)
        return { index, listId }
      },
      collect: monitor => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: () => {
        isBeingDraggedRef.current = false

        setIsDragging(false)

        if (buttonRef.current) {
          buttonRef.current.blur()
        }
      },
      canDrag: () => !isDraggingAny || isBeingDraggedRef.current,
    }),
    [index, listId, setIsDragging, isDraggingAny],
  )

  /**
   * Handles keyboard interactions for reordering
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newReorderingState: boolean

      switch (e.key) {
        case 'ArrowUp':
          if (isReorderingActive && index > 0) {
            e.preventDefault()
            setReorderingItemIndex(index)
            moveItem(index, index - 1, 'keyboard')
          }
          break
        case 'ArrowDown':
          if (isReorderingActive && index < itemCount - 1) {
            e.preventDefault()
            setReorderingItemIndex(index)
            moveItem(index, index + 1, 'keyboard')
          }
          break
        case 'Escape':
          if (isReorderingActive) {
            e.preventDefault()
            setIsReorderingActive(false)
            setReorderingItemIndex(null)
          }
          break
        case 'Tab':
          if (isReorderingActive) {
            setIsReorderingActive(false)
            setReorderingItemIndex(null)
          }
          break
        case ' ':
        case 'Enter':
          e.preventDefault()
          newReorderingState = !isReorderingActive
          setIsReorderingActive(newReorderingState)

          if (newReorderingState) {
            setReorderingItemIndex(index)
          } else {
            setReorderingItemIndex(null)
          }
          break
        default:
          break
      }
    },
    [isReorderingActive, index, itemCount, setReorderingItemIndex, moveItem, setIsReorderingActive],
  )

  // Set up drag preview and drag source
  useEffect(() => {
    if (ref.current) {
      dragPreview(ref.current)
    }
  }, [dragPreview])

  const itemClasses = classnames(
    styles.reorderableItem,
    isDragging ? styles.dragging : '',
    isReorderingActive ? styles.reordering : '',
    className,
  )

  return (
    <div
      ref={ref}
      role="listitem"
      aria-posinset={index + 1}
      aria-setsize={itemCount}
      className={itemClasses}
      data-position={index}
      data-item-index={itemIndex}
      data-list-id={listId}
      data-testid={`reorderable-item-${index}`}
      data-dragging={isDragging ? 'true' : 'false'}
      data-reordering={isReorderingActive ? 'true' : 'false'}
    >
      <VisuallyHidden>
        {t('reorderableList.draggablePosition', {
          item: accessibleItemName,
          position: String(index + 1),
          total: String(itemCount),
        })}
      </VisuallyHidden>
      <span className={styles.dragHandle}>
        {renderDragHandle ? (
          renderDragHandle({
            id: item.id || index,
            label: accessibleItemName,
            isReordering: isReorderingActive,
            isDragging: isDragging,
          })
        ) : (
          <Components.ButtonIcon
            data-index={index}
            data-item-index={itemIndex}
            data-reordering={isReorderingActive ? 'true' : 'false'}
            data-focus-visible={true}
            data-testid="drag-handle-button"
            tabIndex={0}
            onFocus={e => {
              e.currentTarget.setAttribute('data-focus-visible', 'true')
            }}
            onBlur={e => {
              e.currentTarget.removeAttribute('data-focus-visible')
            }}
            aria-label={
              isReorderingActive
                ? t('reorderableList.draggableLabelActive', {
                    item: accessibleItemName,
                  })
                : t('reorderableList.draggableLabel', {
                    item: accessibleItemName,
                  })
            }
            aria-roledescription={t('reorderableList.draggableItem')}
            aria-grabbed={isDragging}
            onKeyDown={handleKeyDown}
            buttonRef={node => {
              if (node) {
                buttonRef.current = node
                drag(node)
              }
            }}
          >
            <ListIcon />
          </Components.ButtonIcon>
        )}
      </span>
      <div className={styles.contentContainer}>{item.content}</div>
    </div>
  )
})
