import { TableHeader as AriaTableHeader } from 'react-aria-components'
import type { TableHeadProps } from './TableTypes'

export const TableHead = ({ children, className, ...props }: TableHeadProps) => {
  return (
    <AriaTableHeader className={className} {...props}>
      {children}
    </AriaTableHeader>
  )
}
