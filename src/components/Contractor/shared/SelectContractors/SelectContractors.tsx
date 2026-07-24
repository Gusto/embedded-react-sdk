import { useEffect, useMemo } from 'react'
import { useSelectContractors } from './useSelectContractors'
import { SelectContractorsPresentation } from './SelectContractorsPresentation'
import { BaseLayout } from '@/components/Base'

/** @internal */
export interface SelectContractorsProps {
  companyId: string
  /** Called with the currently selected contractor ids whenever the selection changes. */
  onSelectionChange: (selectedIds: string[]) => void
}

/**
 * Multi-select contractor table. Fetches and filters eligible contractors via
 * {@link useSelectContractors} and reports the current selection through
 * `onSelectionChange` rather than emitting an SDK event — the composing
 * screen is responsible for translating the selection into its own events.
 *
 * @internal
 */
export function SelectContractors({ companyId, onSelectionChange }: SelectContractorsProps) {
  const result = useSelectContractors(companyId)

  const selectedIdsKey = result.isLoading ? null : [...result.selectedIds].sort().join(',')

  const selectedIds = useMemo(
    () => (selectedIdsKey === null ? null : selectedIdsKey.split(',').filter(Boolean)),
    [selectedIdsKey],
  )

  useEffect(() => {
    if (selectedIds === null) return
    onSelectionChange(selectedIds)
  }, [selectedIds, onSelectionChange])

  if (result.isLoading) {
    return <BaseLayout isLoading error={result.errorHandling.errors} />
  }

  return (
    <BaseLayout error={result.errorHandling.errors}>
      <SelectContractorsPresentation
        contractors={result.data.contractors}
        selectedIds={result.selectedIds}
        searchValue={result.searchValue}
        onSelect={result.actions.onSelect}
        onSelectAll={result.actions.onSelectAll}
        onSearchChange={result.actions.onSearchChange}
        onSearchClear={result.actions.onSearchClear}
        pagination={result.pagination}
        isFetching={result.status.isFetching}
      />
    </BaseLayout>
  )
}
