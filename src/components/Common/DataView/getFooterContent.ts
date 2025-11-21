import type { ReactNode } from 'react'
import type { DataViewFooterCell } from './useDataView'

type StructuredFooter = { primary: ReactNode; secondary?: ReactNode }

const isStructuredFooter = (value: DataViewFooterCell): value is StructuredFooter => {
  return typeof value === 'object' && value !== null && 'primary' in value
}

export const getFooterContent = (value?: DataViewFooterCell): StructuredFooter => {
  if (isStructuredFooter(value)) {
    return {
      primary: value.primary,
      secondary: value.secondary,
    }
  }

  if (value === null || value === undefined) {
    return { primary: '' }
  }

  return {
    primary: value,
  }
}
