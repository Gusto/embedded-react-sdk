import { Heading } from 'react-aria-components'
import styles from './DataCards.module.scss'
import type { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export type DataCardsProps<T> = {
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  emptyState?: useDataViewPropReturn<T>['emptyState']
}

export const DataCards = <T,>({
  data,
  columns,
  itemMenu,
  onSelect,
  emptyState,
}: DataCardsProps<T>) => {
  const Components = useComponentContext()
  return (
    <div role="list" data-testid="data-cards">
      {data.length === 0 && <Components.Card>{emptyState?.()}</Components.Card>}
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
                <Heading className={styles.columnTitle} level={5}>
                  {column.title}
                </Heading>
                <div className={styles.columnData}>
                  {' '}
                  {column.render ? column.render(item) : String(item[column.key as keyof T])}
                </div>
              </Flex>
            ))}
          </Components.Card>
        </div>
      ))}
    </div>
  )
}
