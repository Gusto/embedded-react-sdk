import type {
  ReactNode,
  TableHTMLAttributes,
  HTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react'

export interface TableColumn<T> {
  key?: string | keyof T
  title: ReactNode
  render?: (item: T) => ReactNode
  isRowHeader?: boolean
}

export interface TableProps<T>
  extends Pick<
    TableHTMLAttributes<HTMLTableElement>,
    'className' | 'aria-label' | 'id' | 'role' | 'aria-labelledby' | 'aria-describedby'
  > {
  data: T[]
  columns: TableColumn<T>[]
  emptyState?: () => ReactNode
  onSelect?: (item: T, isSelected: boolean) => void
  itemMenu?: (item: T) => ReactNode
}

export interface TableHeadProps
  extends Pick<HTMLAttributes<HTMLTableSectionElement>, 'className' | 'id' | 'role'> {
  children: ReactNode
}

export interface TableBodyProps
  extends Pick<HTMLAttributes<HTMLTableSectionElement>, 'className' | 'id' | 'role'> {
  children?: ReactNode
  renderEmptyState?: () => ReactNode
}

export interface TableRowProps
  extends Pick<HTMLAttributes<HTMLTableRowElement>, 'className' | 'id' | 'role'> {
  children: ReactNode
}

export interface TableHeaderProps
  extends Pick<
    ThHTMLAttributes<HTMLTableHeaderCellElement>,
    'className' | 'id' | 'scope' | 'colSpan' | 'rowSpan'
  > {
  children: ReactNode
  isRowHeader?: boolean
}

export interface TableCellProps
  extends Pick<
    TdHTMLAttributes<HTMLTableDataCellElement>,
    'className' | 'id' | 'colSpan' | 'rowSpan'
  > {
  children: ReactNode
}
