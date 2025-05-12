import { useRef, useState, type ReactElement } from 'react'
// TODO [GWS-4453]: Migrate to UI directory and create adapter
// eslint-disable-next-line no-restricted-imports
import { useButton, useDrag, useDrop } from 'react-aria'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'
import styles from './reorderableList.module.scss'
import { VisuallyHidden } from '@/components/Common'
import ListIcon from '@/assets/icons/list.svg?react'

interface ReorderableListProps {
  items: ReactElement[]
  label: string
  onReorder?: (itemOrder: number[]) => void
}
export function ReorderableList({ items, label, onReorder }: ReorderableListProps) {
  const [intitalOrder] = useState<number[]>(items.map((_, i) => i))
  const [itemOrder, setItemOrder] = useState<number[]>(items.map((_, i) => i))

  const zipped = itemOrder.map((item, index) => [item, intitalOrder[index]] as const)

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex) {
      const updatedOrder = [...itemOrder]
      const [movedItem] = updatedOrder.splice(fromIndex, 1)
      updatedOrder.splice(toIndex, 0, movedItem as number)
      setItemOrder(updatedOrder)
      onReorder?.(updatedOrder)
    }
  }
  return (
    <div role="list" aria-label={label} className={styles.reorderableList}>
      {zipped.map(([orderIndex, initial], index) => {
        //Typeguard

        if (initial === undefined) return null
        const item = items[orderIndex]
        if (!item) return null

        return (
          <ReorderableItem
            key={initial}
            item={item}
            index={index}
            moveItem={moveItem}
            itemCount={items.length}
          />
        )
      })}
    </div>
  )
}

interface ReorderableItemProps {
  item: ReactElement
  index: number
  moveItem: (fromIndex: number, toIndex: number) => void
  itemCount: number
}

export function ReorderableItem({ item, index, moveItem, itemCount }: ReorderableItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation('common')

  const { dragProps, dragButtonProps, isDragging } = useDrag({
    hasDragButton: true,
    getItems: () => [{ 'text/plain': index.toString() }],
  })
  const { buttonProps } = useButton({ ...dragButtonProps, elementType: 'div' }, buttonRef)
  const { dropProps, isDropTarget } = useDrop({
    ref,
    onDrop: async e => {
      const item = e.items[0]
      if (item?.kind !== 'text') return
      const fromIndex = parseInt(await item.getText('text/plain'), 10)
      moveItem(fromIndex, index)
    },
  })

  return (
    <div
      {...dragProps}
      {...dropProps}
      ref={ref}
      role="listitem"
      aria-posinset={index + 1}
      aria-setsize={itemCount}
      className={classnames(styles.reorderableItem, {
        [`${styles.dropTarget}`]: isDropTarget,
        [`${styles.dragging}`]: isDragging,
      })}
    >
      <VisuallyHidden>
        {t('labels.draggablePosition', {
          position: String(index + 1),
          total: itemCount.toString(),
        })}
      </VisuallyHidden>
      <span
        {...buttonProps}
        aria-label={t('labels.draggableLabel')}
        ref={buttonRef}
        className={styles.dragHandle}
        style={{ pointerEvents: 'none' }}
      >
        <ListIcon />
      </span>
      <div style={{ flex: 1 }}>{item}</div>
    </div>
  )
}
