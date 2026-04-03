import { useState } from 'react'
import { DateRangePicker } from './DateRangePicker'
import type { DateRange } from './DateRangePickerTypes'

export default {
  title: 'UI/Form/Inputs/DateRangePicker',
}

function RangeStory({ label, initialRange }: { label: string; initialRange: DateRange }) {
  const [value, setValue] = useState<DateRange | null>(initialRange)
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>{label}</h3>
      <DateRangePicker
        label={label}
        shouldVisuallyHideLabel
        value={value}
        onChange={setValue}
        startDateLabel="From"
        endDateLabel="To"
      />
    </div>
  )
}

const variants: { label: string; range: DateRange }[] = [
  {
    label: 'Mid-Row Range (Tue–Thu)',
    range: { start: new Date(2025, 3, 8), end: new Date(2025, 3, 10) },
  },
  {
    label: 'Full Row (Sun–Sat)',
    range: { start: new Date(2025, 3, 6), end: new Date(2025, 3, 12) },
  },
  { label: 'Multi-Row Range', range: { start: new Date(2025, 3, 8), end: new Date(2025, 3, 24) } },
  { label: 'Start on Sunday', range: { start: new Date(2025, 3, 6), end: new Date(2025, 3, 16) } },
  { label: 'End on Saturday', range: { start: new Date(2025, 3, 9), end: new Date(2025, 3, 19) } },
  {
    label: 'Cross-Month (view start)',
    range: { start: new Date(2025, 2, 25), end: new Date(2025, 3, 10) },
  },
  { label: 'Single Day', range: { start: new Date(2025, 3, 15), end: new Date(2025, 3, 15) } },
  {
    label: 'Full Month (Apr 1–30)',
    range: { start: new Date(2025, 3, 1), end: new Date(2025, 3, 30) },
  },
]

export const AllVariants = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: 32,
      padding: 16,
    }}
  >
    {variants.map(v => (
      <RangeStory key={v.label} label={v.label} initialRange={v.range} />
    ))}
  </div>
)

export const MidRowRange = () => (
  <RangeStory
    label="Mid-Row Range"
    initialRange={{ start: new Date(2025, 3, 8), end: new Date(2025, 3, 10) }}
  />
)

export const FullRowRange = () => (
  <RangeStory
    label="Full Row Range"
    initialRange={{ start: new Date(2025, 3, 6), end: new Date(2025, 3, 12) }}
  />
)

export const MultiRowRange = () => (
  <RangeStory
    label="Multi-Row Range"
    initialRange={{ start: new Date(2025, 3, 8), end: new Date(2025, 3, 24) }}
  />
)

export const StartOnSunday = () => (
  <RangeStory
    label="Start on Sunday"
    initialRange={{ start: new Date(2025, 3, 6), end: new Date(2025, 3, 16) }}
  />
)

export const EndOnSaturday = () => (
  <RangeStory
    label="End on Saturday"
    initialRange={{ start: new Date(2025, 3, 9), end: new Date(2025, 3, 19) }}
  />
)

export const CrossMonthRange = () => (
  <RangeStory
    label="Cross-Month Range"
    initialRange={{ start: new Date(2025, 2, 25), end: new Date(2025, 3, 10) }}
  />
)

export const SingleDayRange = () => (
  <RangeStory
    label="Single Day"
    initialRange={{ start: new Date(2025, 3, 15), end: new Date(2025, 3, 15) }}
  />
)

export const FullMonthRange = () => (
  <RangeStory
    label="Full Month Range"
    initialRange={{ start: new Date(2025, 3, 1), end: new Date(2025, 3, 30) }}
  />
)
