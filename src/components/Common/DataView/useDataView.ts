import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

type DataViewColumnBase<T> = {
  title: string | React.ReactNode
  secondaryText?: keyof T
  secondaryRender?: (item: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export type DataViewFooterCell = ReactNode | { primary: ReactNode; secondary?: ReactNode }

export type DataViewColumn<T> =
  | (DataViewColumnBase<T> & {
      key: keyof T
      render?: (item: T) => React.ReactNode
    })
  | (DataViewColumnBase<T> & {
      key?: string
      render: (item: T) => React.ReactNode
    })

// Type for footer object keys - allows data keys and custom string keys
type FooterKeys<T> = keyof T | string

export type useDataViewProp<T> = {
  columns: DataViewColumn<T>[]
  data: T[]
  pagination?: PaginationControlProps
  itemMenu?: (item: T) => React.ReactNode
  onSelect?: (item: T, checked: boolean) => void
  emptyState?: () => React.ReactNode
  footer?: () => Partial<Record<FooterKeys<T>, DataViewFooterCell>>
  isFetching?: boolean
}

export type useDataViewPropReturn<T> = {
  pagination?: PaginationControlProps
  data: T[]
  columns: DataViewColumn<T>[]
  itemMenu?: (item: T) => React.ReactNode
  onSelect?: (item: T, checked: boolean) => void
  emptyState?: () => React.ReactNode
  footer?: () => Partial<Record<FooterKeys<T>, DataViewFooterCell>>
  isFetching?: boolean
}

export const useDataView = <T>({
  columns,
  data,
  itemMenu,
  onSelect,
  pagination,
  emptyState,
  footer,
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
      footer,
      isFetching,
    }
  }, [pagination, data, columns, itemMenu, onSelect, emptyState, footer, isFetching])

  return dataViewProps
}
