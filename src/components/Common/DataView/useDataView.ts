import { useMemo } from 'react'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

export type SelectionMode = 'multiple' | 'single'

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

type FooterKeys<T> = keyof T | string

type BaseDataViewProps<T> = {
  columns: DataViewColumn<T>[]
  data: T[]
  pagination?: PaginationControlProps
  itemMenu?: (item: T) => React.ReactNode
  emptyState?: () => React.ReactNode
  footer?: () => Partial<Record<FooterKeys<T>, React.ReactNode>>
  isFetching?: boolean
}

type NoSelectionProps = {
  onSelect?: undefined
  onSelectAll?: undefined
  getIsItemSelected?: undefined
  selectionMode?: undefined
}

type SingleSelectionProps<T> = {
  selectionMode: 'single'
  onSelect: (item: T, checked: boolean) => void
  onSelectAll?: undefined
  getIsItemSelected?: (item: T) => boolean
}

type MultipleSelectionProps<T> = {
  selectionMode?: 'multiple'
  onSelect: (item: T, checked: boolean) => void
  /**
   * Called when the select-all checkbox is toggled.
   * The header checkbox state reflects only the currently visible `data` array.
   * With pagination, consumers decide whether to select all data or only the visible page.
   * `visibleData` is the current page's data array for reference.
   */
  onSelectAll?: (checked: boolean, visibleData: T[]) => void
  /**
   * Required for multi-select. Returns whether a given item is currently selected.
   * Use a stable identifier from the item (e.g. item.id) rather than array index.
   */
  getIsItemSelected: (item: T) => boolean
}

export type useDataViewProp<T> = BaseDataViewProps<T> &
  (NoSelectionProps | SingleSelectionProps<T> | MultipleSelectionProps<T>)

export type useDataViewPropReturn<T> = {
  pagination?: PaginationControlProps
  data: T[]
  columns: DataViewColumn<T>[]
  itemMenu?: (item: T) => React.ReactNode
  onSelect?: (item: T, checked: boolean) => void
  onSelectAll?: (checked: boolean, visibleData: T[]) => void
  getIsItemSelected?: (item: T) => boolean
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
  onSelectAll,
  getIsItemSelected,
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
      onSelectAll,
      getIsItemSelected,
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
    onSelectAll,
    getIsItemSelected,
    emptyState,
    footer,
    isFetching,
    selectionMode,
  ])

  return dataViewProps
}
