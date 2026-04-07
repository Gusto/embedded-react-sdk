import { useCallback, useState } from 'react'
import { SelectHolidaysPresentation } from '../TimeOffManagement/SelectHolidays/SelectHolidaysPresentation'
import type { HolidayItem } from '../TimeOffManagement/SelectHolidays/SelectHolidaysTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'

export interface HolidaySelectionFormProps extends BaseComponentInterface {
  companyId: string
}

export function HolidaySelectionForm(props: HolidaySelectionFormProps) {
  return (
    <BaseComponent {...props}>
      <Root />
    </BaseComponent>
  )
}

const DEFAULT_HOLIDAYS: HolidayItem[] = [
  { uuid: 'new-years', name: "New Year's Day", observedDate: 'January 1', nextObservation: '' },
  {
    uuid: 'mlk',
    name: 'Martin Luther King, Jr. Day',
    observedDate: 'Third Monday in January',
    nextObservation: '',
  },
  {
    uuid: 'presidents',
    name: "Presidents' Day",
    observedDate: 'Third Monday in February',
    nextObservation: '',
  },
  {
    uuid: 'memorial',
    name: 'Memorial Day',
    observedDate: 'Last Monday in May',
    nextObservation: '',
  },
  { uuid: 'juneteenth', name: 'Juneteenth', observedDate: 'June 19', nextObservation: '' },
  {
    uuid: 'independence',
    name: 'Independence Day',
    observedDate: 'July 4',
    nextObservation: '',
  },
  {
    uuid: 'labor',
    name: 'Labor Day',
    observedDate: 'First Monday in September',
    nextObservation: '',
  },
  {
    uuid: 'columbus',
    name: "Columbus Day (Indigenous Peoples' Day)",
    observedDate: 'Second Monday in October',
    nextObservation: '',
  },
  { uuid: 'veterans', name: 'Veterans Day', observedDate: 'November 11', nextObservation: '' },
  {
    uuid: 'thanksgiving',
    name: 'Thanksgiving',
    observedDate: 'Fourth Thursday in November',
    nextObservation: '',
  },
  {
    uuid: 'christmas',
    name: 'Christmas Day',
    observedDate: 'December 25',
    nextObservation: '',
  },
]

const ALL_HOLIDAY_UUIDS = new Set(DEFAULT_HOLIDAYS.map(h => h.uuid))

function Root() {
  const { onEvent } = useBase()
  const [selectedUuids, setSelectedUuids] = useState(ALL_HOLIDAY_UUIDS)

  const handleSelectionChange = useCallback((item: HolidayItem, selected: boolean) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      if (selected) {
        next.add(item.uuid)
      } else {
        next.delete(item.uuid)
      }
      return next
    })
  }, [])

  const handleContinue = useCallback(() => {
    onEvent(componentEvents.TIME_OFF_HOLIDAY_SELECTION_DONE)
  }, [onEvent])

  const handleBack = useCallback(() => {
    onEvent(componentEvents.CANCEL)
  }, [onEvent])

  return (
    <SelectHolidaysPresentation
      holidays={DEFAULT_HOLIDAYS}
      selectedHolidayUuids={selectedUuids}
      onSelectionChange={handleSelectionChange}
      onContinue={handleContinue}
      onBack={handleBack}
    />
  )
}
