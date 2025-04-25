import { Column } from 'react-aria-components'
import type { TableHeaderProps } from './TableTypes'
export const TableHeader = ({ children, className, isRowHeader, ...props }: TableHeaderProps) => {
  return (
    <Column isRowHeader={isRowHeader} className={className} {...props}>
      {children}
    </Column>
  )
}
