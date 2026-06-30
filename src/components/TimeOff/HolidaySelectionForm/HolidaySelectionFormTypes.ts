/**
 * A single federal holiday row shown in the holiday selection table.
 *
 * @public
 */
export interface HolidayItem {
  /** Stable identifier for the holiday (the federal holiday key). */
  uuid: string
  /** Localized display name of the holiday. */
  name: string
  /** Localized text describing when the holiday is observed. */
  observedDate: string
  /** Localized date string for the next time this holiday will be observed. */
  nextObservation: string
}

interface HolidaySelectionFormBaseProps {
  holidays: HolidayItem[]
}

interface HolidaySelectionFormSelectModeProps extends HolidaySelectionFormBaseProps {
  mode?: 'select'
  selectedHolidayUuids: Set<string>
  onSelectionChange: (item: HolidayItem, selected: boolean) => void
  onSelectAll: (selected: boolean, visibleItems: HolidayItem[]) => void
  onContinue: () => void
  onBack: () => void
  isPending?: boolean
}

interface HolidaySelectionFormViewModeProps extends HolidaySelectionFormBaseProps {
  mode: 'view'
  selectedHolidayUuids?: never
  onSelectionChange?: never
  onSelectAll?: never
  onContinue?: never
  onBack?: never
}

/** @internal */
export type HolidaySelectionFormPresentationProps =
  | HolidaySelectionFormSelectModeProps
  | HolidaySelectionFormViewModeProps
