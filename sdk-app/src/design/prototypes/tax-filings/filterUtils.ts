export interface FilterOption {
  value: string
  label: string
}

export interface FilterDef {
  key: string
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (next: string[]) => void
}

export function summarizeSelection(selected: string[], options: FilterOption[]): string {
  if (selected.length === 0) return 'All'
  const byValue = new Map(options.map(o => [o.value, o.label]))
  return selected.map(v => byValue.get(v) ?? v).join(', ')
}

export function isFilterActive(selected: string[]): boolean {
  return selected.length > 0
}
