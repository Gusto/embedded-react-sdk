import type { ReactNode } from 'react'
import type { DataViewColumn } from './useDataView'

type ColumnContent<T> = {
  primary: ReactNode
  secondary?: ReactNode
}

const normalizeNode = (value: unknown): ReactNode => {
  if (value === null || value === undefined) {
    return ''
  }
  return value as ReactNode
}

export const getColumnContent = <T>(item: T, column: DataViewColumn<T>): ColumnContent<T> => {
  const primary = column.render
    ? column.render(item)
    : column.key
      ? normalizeNode(item[column.key as keyof T])
      : ''

  const secondary = column.secondaryRender
    ? column.secondaryRender(item)
    : column.secondaryText
      ? normalizeNode(item[column.secondaryText])
      : undefined

  return {
    primary: normalizeNode(primary),
    secondary:
      secondary === undefined || secondary === null || secondary === ''
        ? undefined
        : normalizeNode(secondary),
  }
}
