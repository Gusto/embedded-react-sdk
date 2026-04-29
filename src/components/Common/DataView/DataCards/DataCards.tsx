import { useId } from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import styles from './DataCards.module.scss'
import type { useDataViewPropReturn, SelectionMode } from '@/components/Common/DataView/useDataView'
import type { TableProps } from '@/components/Common/UI/Table/TableTypes'
import { useSelectionState } from '@/components/Common/DataView/useSelectionState'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type DataCardsProps<T> = {
  label: string
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: (item: T, checked: boolean) => void
  onSelectAll?: (checked: boolean, visibleData: T[]) => void
  getIsItemSelected?: (item: T) => boolean
  emptyState?: useDataViewPropReturn<T>['emptyState']
  footer?: useDataViewPropReturn<T>['footer']
  selectionMode?: SelectionMode
  isWithinBox?: TableProps['isWithinBox']
}

export const DataCards = <T,>({
  label,
  data,
  columns,
  itemMenu,
  onSelect,
  onSelectAll,
  getIsItemSelected,
  emptyState,
  footer,
  selectionMode = 'multiple',
  isWithinBox,
}: DataCardsProps<T>) => {
  const Components = useComponentContext()
  const { t } = useTranslation('common')
  const radioGroupName = useId()
  const { allSelected } = useSelectionState(data, getIsItemSelected)

  const renderAction = (item: T, index: number) => {
    if (!onSelect) return undefined

    const isSelected = getIsItemSelected?.(item) ?? false

    if (selectionMode === 'single') {
      return (
        <Components.Radio
          name={radioGroupName}
          value={isSelected}
          onChange={() => {
            onSelect(item, true)
          }}
          label={t('card.selectRowLabel')}
          shouldVisuallyHideLabel
        />
      )
    }

    return (
      <Components.Checkbox
        value={isSelected}
        onChange={(checked: boolean) => {
          onSelect(item, checked)
        }}
        label={t('card.selectRowLabel')}
        shouldVisuallyHideLabel
      />
    )
  }

  return (
    <div className={cn(styles.root, isWithinBox && styles.withinBox)} data-testid="data-cards">
      {onSelect && getIsItemSelected && selectionMode === 'multiple' && data.length > 0 && (
        <div className={styles.selectAllRow}>
          <Components.Checkbox
            value={allSelected}
            onChange={(checked: boolean) => onSelectAll?.(checked, data)}
            label={t('card.selectAllRowsLabel')}
          />
        </div>
      )}
      <div role="list" aria-label={label}>
        {data.length === 0 && emptyState && (
          <div role="listitem">
            <Components.Card className={isWithinBox ? styles.flushCard : undefined}>
              {emptyState()}
            </Components.Card>
          </div>
        )}
        {data.map((item, index) => (
          <div role="listitem" key={index}>
            <Components.Card
              menu={itemMenu && itemMenu(item)}
              action={renderAction(item, index)}
              className={isWithinBox ? styles.flushCard : undefined}
            >
              {columns.map((column, colIndex) => (
                <Flex key={colIndex} flexDirection="column" gap={0}>
                  {column.title && <h5 className={styles.columnTitle}>{column.title}</h5>}
                  <div className={styles.columnData}>
                    {' '}
                    {column.render ? column.render(item) : String(item[column.key as keyof T])}
                  </div>
                </Flex>
              ))}
            </Components.Card>
          </div>
        ))}
        {footer && (
          <div role="listitem">
            <Components.Card className={isWithinBox ? styles.flushCard : undefined}>
              {(() => {
                const footerContent = footer()

                return Object.entries(footerContent).map(([key, content]) => {
                  const columnIndex = key.startsWith('column-')
                    ? parseInt(key.replace('column-', ''), 10)
                    : -1
                  const columnTitle = columnIndex >= 0 ? columns[columnIndex]?.title : undefined

                  return (
                    <Flex key={key} flexDirection="column" gap={0}>
                      {columnTitle && <h5 className={styles.columnTitle}>{columnTitle}</h5>}
                      <div className={styles.footerItem}>{content}</div>
                    </Flex>
                  )
                })
              })()}
            </Components.Card>
          </div>
        )}
      </div>
    </div>
  )
}
