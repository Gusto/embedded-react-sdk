import { Heading } from 'react-aria-components'
import styles from './DataCards.module.scss'
import { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { Card } from '@/components/Common/Card/Card'
import { Flex } from '@/components/Common/Flex/Flex'

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
  return (
    <div role="list" data-testid="data-cards">
      {data.length === 0 && <Card>{emptyState?.()}</Card>}
      {data.map((item, index) => (
        <div role="listitem" key={index}>
          <Card
            menu={itemMenu && itemMenu(item)}
            onSelect={
              onSelect
                ? () => {
                    onSelect(item)
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
          </Card>
        </div>
      ))}
    </div>
  )
}
