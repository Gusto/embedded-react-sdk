export interface HolidayItem {
  uuid: string
  name: string
  observedDate: string
  nextObservation: string
}

interface SelectHolidaysBaseProps {
  holidays: HolidayItem[]
}

interface SelectHolidaysSelectModeProps extends SelectHolidaysBaseProps {
  mode?: 'select'
  selectedHolidayUuids: Set<string>
  onSelectionChange: (item: HolidayItem, selected: boolean) => void
  onContinue: () => void
  onBack: () => void
}

interface SelectHolidaysViewModeProps extends SelectHolidaysBaseProps {
  mode: 'view'
  selectedHolidayUuids?: never
  onSelectionChange?: never
  onContinue?: never
  onBack?: never
}

export type SelectHolidaysPresentationProps =
  | SelectHolidaysSelectModeProps
  | SelectHolidaysViewModeProps
