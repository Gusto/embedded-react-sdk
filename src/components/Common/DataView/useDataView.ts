import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import type { ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { MenuItem } from '@/components/Common/UI/Menu/MenuTypes'

type DataViewColumnBase<T> = {
  title: string | React.ReactNode
  secondaryText?: keyof T
  secondaryRender?: (item: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export type DataViewFooterCell = ReactNode | { primary: ReactNode; secondary?: ReactNode }

export type DataViewButtonAction = {
  type: 'button'
  label: ReactNode
  onClick: () => void
  buttonProps?: Partial<ButtonProps>
}

export type DataViewMenuAction = {
  type: 'menu'
  items: MenuItem[]
  triggerLabel?: string
  menuLabel?: string
  onClose?: () => void
  isLoading?: boolean
}

export type DataViewAction = DataViewButtonAction | DataViewMenuAction

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
  rowActions?: {
    header?: ReactNode
    align?: 'left' | 'center' | 'right'
    buttons?: (item: T) => DataViewButtonAction[]
    menuItems?: (item: T) => DataViewMenuAction | null
  }
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
  rowActions?: NonNullable<useDataViewProp<T>['rowActions']>
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
  rowActions,
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
      rowActions,
    }
  }, [pagination, data, columns, itemMenu, onSelect, emptyState, footer, isFetching, rowActions])

  return dataViewProps
}
