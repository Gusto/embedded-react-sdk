export interface HolidayItem {
  uuid: string
  name: string
  observedDate: string
  nextObservation: string
}

interface HolidaySelectionFormBaseProps {
  holidays: HolidayItem[]
}

interface HolidaySelectionFormSelectModeProps extends HolidaySelectionFormBaseProps {
  mode?: 'select'
  selectedHolidayUuids: Set<string>
  onSelectionChange: (item: HolidayItem, selected: boolean) => void
  onContinue: () => void
  onBack: () => void
}

interface HolidaySelectionFormViewModeProps extends HolidaySelectionFormBaseProps {
  mode: 'view'
  selectedHolidayUuids?: never
  onSelectionChange?: never
  onContinue?: never
  onBack?: never
}

export type HolidaySelectionFormPresentationProps =
  | HolidaySelectionFormSelectModeProps
  | HolidaySelectionFormViewModeProps
