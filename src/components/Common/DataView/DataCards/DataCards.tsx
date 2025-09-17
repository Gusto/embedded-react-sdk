import styles from './DataCards.module.scss'
import type { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type DataCardsProps<T> = {
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  emptyState?: useDataViewPropReturn<T>['emptyState']
  footer?: useDataViewPropReturn<T>['footer']
}

export const DataCards = <T,>({
  data,
  columns,
  itemMenu,
  onSelect,
  emptyState,
  footer,
}: DataCardsProps<T>) => {
  const Components = useComponentContext()
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
                    onSelect(item, checked)
                  }
                : undefined
            }
          >
            {columns.map((column, index) => (
              <Flex key={index} flexDirection="column" gap={0}>
                <h5 className={styles.columnTitle}>{column.title}</h5>
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
                <div key={key}>{content}</div>
              ))
            })()}
          </Components.Card>
        </div>
      )}
    </div>
  )
}
