import { VisuallyHidden } from 'react-aria'
import { Text } from 'react-aria-components'
import { CalendarDisplayProps } from './CalendarDisplay'
import { Flex } from '@/components/Common'

export type CalendarDisplayLegendProps = Pick<
  CalendarDisplayProps,
  'highlightDates' | 'rangeSelected'
>

export const CalendarDisplayLegend = ({ highlightDates }: CalendarDisplayLegendProps) => {
  const getFormattedLegendDate = (date: string) => {
    // Create date and adjust for timezone offset to prevent date shifting
    const inputDate = new Date(date)
    const userTimezoneOffset = inputDate.getTimezoneOffset() * 60000
    const adjustedDate = new Date(inputDate.getTime() + userTimezoneOffset)

    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(adjustedDate)
  }

  return (
    <div style={{ padding: '20px', borderTop: '1px solid var(--g-colors-gray-600)' }}>
      <VisuallyHidden>Legend</VisuallyHidden>
      <Flex flexDirection="column" gap={24}>
        {highlightDates?.map((highlight, index) => (
          <Flex justifyContent="center" alignItems="center" key={index} gap={16}>
            <div data-highlight={highlight.highlightColor} className="react-aria-CalendarLegend" />
            <Flex flexDirection="column" gap={0}>
              <Text
                style={{
                  fontSize: '14px',
                }}
              >
                {highlight.label}
              </Text>
              <Text
                style={{
                  fontSize: '14px',
                  color: 'var(--g-colors-gray-800)',
                }}
              >
                {getFormattedLegendDate(highlight.date)}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </div>
  )
}
