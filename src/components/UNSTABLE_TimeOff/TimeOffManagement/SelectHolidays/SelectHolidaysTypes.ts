export interface HolidayItem {
  uuid: string
  name: string
  observedDate: string
  nextObservation: string
}

export interface SelectHolidaysPresentationProps {
  holidays: HolidayItem[]
  selectedHolidayUuids: Set<string>
  onSelectionChange: (item: HolidayItem, selected: boolean) => void
  onContinue: () => void
  onBack: () => void
}
