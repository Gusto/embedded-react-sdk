import { useMemo } from 'react'
import { PaginationControlProps } from '@/components/Common'

type DataViewColumn<T> = {
  key: keyof T
  title: string
  render?: (item: T) => React.ReactNode
}

export type useDataViewProp<T> = {
  columns: DataViewColumn<T>[]
  data: T[]
  defaultPageSize?: number
  pageSizes?: Array<number>
  itemMenu?: (item: T) => React.ReactNode
  onSelect?: (item: T) => void
}

export type useDataViewPropReturn<T> = {
  pagination: PaginationControlProps
  data: T[]
  columns: DataViewColumn<T>[]
  defaultPageSize: number
  pageSizes: Array<number>
  itemMenu?: (item: T) => React.ReactNode
  onSelect?: (item: T) => void
}

export const useDataView = <T>({
  columns,
  data,
  defaultPageSize = 25,
  pageSizes = [10, 25, 50, 100],
  itemMenu,
  onSelect,
}: useDataViewProp<T>): useDataViewPropReturn<T> => {
  const dataViewProps = useMemo(() => {
    return {
      pagination: {
        currentPage: 1,
        totalPages: 1,
        handleFirstPage: () => {},
        handlePreviousPage: () => {},
        handleNextPage: () => {},
        handleLastPage: () => {},
        handleItemsPerPageChange: (n: number) => {},
      },
      data,
      columns,
      defaultPageSize,
      pageSizes,
      itemMenu,
      onSelect,
    }
  }, [data, columns, defaultPageSize, pageSizes, itemMenu, onSelect])

  return dataViewProps
}
