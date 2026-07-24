import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

/** @internal */
export interface SelectContractorsPresentationProps {
  contractors: Contractor[]
  selectedIds: Set<string>
  searchValue: string
  onSelect: (contractor: Contractor, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  pagination: PaginationControlProps
  isFetching: boolean
}
