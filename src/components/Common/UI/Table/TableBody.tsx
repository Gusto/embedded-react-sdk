import { TableBody as AriaTableBody } from 'react-aria-components'
import type { TableBodyProps } from './TableTypes'

export const TableBody = ({ children, className, renderEmptyState, ...props }: TableBodyProps) => {
  return (
    <AriaTableBody className={className} renderEmptyState={renderEmptyState} {...props}>
      {children}
    </AriaTableBody>
  )
}
