import { useMemo } from 'react'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

export type SelectionMode = 'multiple' | 'single'

type DataViewColumnBase<T> = {
  title: string | React.ReactNode
  secondaryText?: keyof T
  secondaryRender?: (item: T) => React.ReactNode
}

export type DataViewColumn<T> =
  | (DataViewColumnBase<T> & {
      key: keyof T
      render?: (item: T) => React.ReactNode
    })
  | (DataViewColumnBase<T> & {
      key?: string
      render: (item: T) => React.ReactNode
    })

type FooterKeys<T> = keyof T | string

export type useDataViewProp<T> = {
  columns: DataViewColumn<T>[]
  data: T[]
  pagination?: PaginationControlProps
  itemMenu?: (item: T) => React.ReactNode
  onSelect?: (item: T, checked: boolean) => void
  isItemSelected?: (item: T, index: number) => boolean
  emptyState?: () => React.ReactNode
  footer?: () => Partial<Record<FooterKeys<T>, React.ReactNode>>
  isFetching?: boolean
  selectionMode?: SelectionMode
}

export type useDataViewPropReturn<T> = {
  pagination?: PaginationControlProps
  data: T[]
  columns: DataViewColumn<T>[]
  itemMenu?: (item: T) => React.ReactNode
  onSelect?: (item: T, checked: boolean) => void
  isItemSelected?: (item: T, index: number) => boolean
  emptyState?: () => React.ReactNode
  footer?: () => Partial<Record<FooterKeys<T>, React.ReactNode>>
  isFetching?: boolean
  selectionMode?: SelectionMode
}

export const useDataView = <T>({
  columns,
  data,
  itemMenu,
  onSelect,
  isItemSelected,
  pagination,
  emptyState,
  footer,
  isFetching,
  selectionMode,
}: useDataViewProp<T>): useDataViewPropReturn<T> => {
  const dataViewProps = useMemo(() => {
    return {
      pagination,
      data,
      columns,
      itemMenu,
      onSelect,
      isItemSelected,
      emptyState,
      footer,
      isFetching,
      selectionMode,
    }
  }, [
    pagination,
    data,
    columns,
    itemMenu,
    onSelect,
    isItemSelected,
    emptyState,
    footer,
    isFetching,
    selectionMode,
  ])

  return dataViewProps
}
