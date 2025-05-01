import type { useDataViewPropReturn } from '../useDataView'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type DataTableProps<T> = {
  label: string
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  emptyState?: useDataViewPropReturn<T>['emptyState']
}

export const DataTable = <T,>({
  label,
  data,
  columns,
  itemMenu,
  onSelect,
  emptyState,
}: DataTableProps<T>) => {
  const Components = useComponentContext()

  return (
    <Components.Table
      aria-label={label}
      data-testid="data-table"
      data={data}
      columns={columns}
      onSelect={onSelect}
      itemMenu={itemMenu}
      emptyState={emptyState}
    />
  )
}
