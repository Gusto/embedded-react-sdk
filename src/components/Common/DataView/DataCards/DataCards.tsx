import { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { DataCard } from '@/components/Common/DataView/DataCards/DataCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { Heading } from 'react-aria-components'

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
      {data.length === 0 && <DataCard>{emptyState?.()}</DataCard>}
      {data.map((item, index) => (
        <div role="listitem" key={index}>
          <DataCard
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
              <Flex key={index} flexDirection="column" gap={4}>
                <Heading
                  style={{
                    marginTop: 0,
                  }}
                  level={5}
                >
                  {column.title}
                </Heading>
                <div>
                  {' '}
                  {column.render ? column.render(item) : String(item[column.key as keyof T])}
                </div>
              </Flex>
            ))}
          </DataCard>
        </div>
      ))}
    </div>
  )
}
