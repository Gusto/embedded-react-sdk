import { useMemo } from 'react'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

type DataViewColumn<T> =
  | {
      key: keyof T
      title: string | React.ReactNode
      render?: (item: T) => React.ReactNode
    }
  | {
      key?: string
      title: string | React.ReactNode
      render: (item: T) => React.ReactNode
    }

export type useDataViewProp<T> = {
  columns: DataViewColumn<T>[]
  data: T[]
  pagination?: PaginationControlProps
  itemMenu?: (item: T) => React.ReactNode
  onSelect?: (item: T, checked: boolean) => void
  emptyState?: () => React.ReactNode
  isFetching?: boolean
}

export type useDataViewPropReturn<T> = {
  pagination?: PaginationControlProps
  data: T[]
  columns: DataViewColumn<T>[]
  itemMenu?: (item: T) => React.ReactNode
  onSelect?: (item: T, checked: boolean) => void
  emptyState?: () => React.ReactNode
  isFetching?: boolean
}

export const useDataView = <T>({
  columns,
  data,
  itemMenu,
  onSelect,
  pagination,
  emptyState,
  isFetching,
}: useDataViewProp<T>): useDataViewPropReturn<T> => {
  const dataViewProps = useMemo(() => {
    return {
      pagination,
      data,
      columns,
      itemMenu,
      onSelect,
      emptyState,
      isFetching,
    }
  }, [pagination, data, columns, itemMenu, onSelect, emptyState, isFetching])

  return dataViewProps
}
