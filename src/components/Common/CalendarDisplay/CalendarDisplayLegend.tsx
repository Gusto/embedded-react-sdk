import { VisuallyHidden } from 'react-aria'
import { Text } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import type { CalendarDisplayProps } from './CalendarDisplay'
import { Flex } from '@/components/Common'

export type CalendarDisplayLegendProps = Pick<
  CalendarDisplayProps,
  'highlightDates' | 'rangeSelected'
>

export const CalendarDisplayLegend = ({ highlightDates }: CalendarDisplayLegendProps) => {
  const { t } = useTranslation('Company.PaySchedule')
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
    <div className="react-aria-CalendarLegend" data-testid="calendar-legend">
      <VisuallyHidden>{t('labels.legend')}</VisuallyHidden>
      <Flex flexDirection="column" gap={24}>
        {highlightDates?.map((highlight, index) => (
          <Flex justifyContent="center" alignItems="center" key={index} gap={16}>
            <div
              data-highlight={highlight.highlightColor}
              className="react-aria-CalendarLegendMarker"
              data-testid="calendar-legend-item"
            />
            <Flex flexDirection="column" gap={0}>
              <Text className="react-aria-CalendarLegendText">{highlight.label}</Text>
              <Text className="react-aria-CalendarLegendSubText">
                {getFormattedLegendDate(highlight.date)}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </div>
  )
}
