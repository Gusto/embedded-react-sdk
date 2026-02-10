import { useId, useState } from 'react'
import styles from './DataCards.module.scss'
import type { useDataViewPropReturn, SelectionMode } from '@/components/Common/DataView/useDataView'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type DataCardsProps<T> = {
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  emptyState?: useDataViewPropReturn<T>['emptyState']
  footer?: useDataViewPropReturn<T>['footer']
  selectionMode?: SelectionMode
}

export const DataCards = <T,>({
  data,
  columns,
  itemMenu,
  onSelect,
  emptyState,
  footer,
  selectionMode = 'multiple',
}: DataCardsProps<T>) => {
  const Components = useComponentContext()
  const radioGroupName = useId()
  const [selectedRadioIndex, setSelectedRadioIndex] = useState<number | null>(null)

  const handleSelect = (item: T, index: number, checked: boolean) => {
    if (selectionMode === 'single') {
      setSelectedRadioIndex(index)
      onSelect?.(item, true)
    } else {
      onSelect?.(item, checked)
    }
  }

  return (
    <div role="list" data-testid="data-cards">
      {data.length === 0 && emptyState && (
        <div role="listitem">
          <Components.Card>{emptyState()}</Components.Card>
        </div>
      )}
      {data.map((item, index) => (
        <div role="listitem" key={index}>
          <Components.Card
            menu={itemMenu && itemMenu(item)}
            onSelect={
              onSelect
                ? (checked: boolean) => {
                    handleSelect(item, index, checked)
                  }
                : undefined
            }
            selectionMode={selectionMode}
            radioGroupName={radioGroupName}
            isSelected={selectionMode === 'single' ? selectedRadioIndex === index : undefined}
          >
            {columns.map((column, index) => (
              <Flex key={index} flexDirection="column" gap={0}>
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
          <Components.Card>
            {(() => {
              const footerContent = footer()

              // Footer content is always an object with column keys
              return Object.entries(footerContent).map(([key, content]) => (
                <div key={key} className={styles.footerItem}>
                  {content}
                </div>
              ))
            })()}
          </Components.Card>
        </div>
      )}
    </div>
  )
}
