import { useState } from 'react'
import { fn } from 'storybook/test'
import { SelectHolidaysPresentation } from './SelectHolidaysPresentation'
import type { HolidayItem } from './SelectHolidaysTypes'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Company.TimeOff.HolidayPolicy')
  return <>{children}</>
}

export default {
  title: 'TimeOff/SelectHolidays',
  decorators: [
    (Story: React.ComponentType) => (
      <I18nLoader>
        <Story />
      </I18nLoader>
    ),
  ],
}

const holidays: HolidayItem[] = [
  {
    uuid: '1',
    name: "New Year's Day",
    observedDate: 'January 1',
    nextObservation: 'January 1, 2027',
  },
  {
    uuid: '2',
    name: 'Martin Luther King, Jr. Day',
    observedDate: 'Third Monday in January',
    nextObservation: 'January 18, 2027',
  },
  {
    uuid: '3',
    name: "Presidents' Day",
    observedDate: 'Third Monday in February',
    nextObservation: 'February 15, 2027',
  },
  {
    uuid: '4',
    name: 'Memorial Day',
    observedDate: 'Last Monday in May',
    nextObservation: 'May 31, 2026',
  },
  {
    uuid: '5',
    name: 'Juneteenth',
    observedDate: 'June 19',
    nextObservation: 'June 19, 2026',
  },
  {
    uuid: '6',
    name: 'Independence Day',
    observedDate: 'July 4',
    nextObservation: 'July 4, 2026',
  },
  {
    uuid: '7',
    name: 'Labor Day',
    observedDate: 'First Monday in September',
    nextObservation: 'September 7, 2026',
  },
  {
    uuid: '8',
    name: "Columbus Day (Indigenous Peoples' Day)",
    observedDate: 'Second Monday in October',
    nextObservation: 'October 12, 2026',
  },
  {
    uuid: '9',
    name: 'Veterans Day',
    observedDate: 'November 11',
    nextObservation: 'November 11, 2026',
  },
  {
    uuid: '10',
    name: 'Thanksgiving',
    observedDate: 'Fourth Thursday in November',
    nextObservation: 'November 26, 2026',
  },
  {
    uuid: '11',
    name: 'Christmas Day',
    observedDate: 'December 25',
    nextObservation: 'December 25, 2026',
  },
]

const allUuids = new Set(holidays.map(h => h.uuid))
const partialUuids = new Set(['1', '5', '6', '10', '11'])

const onContinue = fn().mockName('onContinue')
const onBack = fn().mockName('onBack')

function StoryWrapper({ initialSelected }: { initialSelected: Set<string> }) {
  const [selectedUuids, setSelectedUuids] = useState(initialSelected)

  const handleSelectionChange = (item: HolidayItem, selected: boolean) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      if (selected) {
        next.add(item.uuid)
      } else {
        next.delete(item.uuid)
      }
      return next
    })
  }

  return (
    <SelectHolidaysPresentation
      holidays={holidays}
      selectedHolidayUuids={selectedUuids}
      onSelectionChange={handleSelectionChange}
      onContinue={onContinue}
      onBack={onBack}
    />
  )
}

export const AllSelected = () => <StoryWrapper initialSelected={allUuids} />

export const PartialSelection = () => <StoryWrapper initialSelected={partialUuids} />

export const EditMode = () => <StoryWrapper initialSelected={new Set()} />
