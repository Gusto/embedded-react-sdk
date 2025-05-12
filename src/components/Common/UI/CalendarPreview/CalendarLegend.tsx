import { useTranslation } from 'react-i18next'
import { VisuallyHidden } from '../../VisuallyHidden'
import { Flex } from '../../Flex/Flex'
import type { CalendarPreviewProps } from './CalendarPreviewTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type CalendarLegendProps = Pick<CalendarPreviewProps, 'highlightDates' | 'dateRange'>

export const CalendarLegend = ({ highlightDates }: CalendarLegendProps) => {
  const { t } = useTranslation('Company.PaySchedule')
  const { Text } = useComponentContext()
  const getFormattedLegendDate = (date: Date) => {
    // adjust for timezone offset to prevent date shifting
    const userTimezoneOffset = date.getTimezoneOffset() * 60000
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset)

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
              <Text size="sm" className="react-aria-CalendarLegendSubText">
                {getFormattedLegendDate(highlight.date)}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </div>
  )
}
