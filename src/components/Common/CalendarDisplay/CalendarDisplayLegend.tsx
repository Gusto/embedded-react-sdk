import { CalendarDisplayProps } from './CalendarDisplay'
import { Flex, Grid } from '@/components/Common'
import { VisuallyHidden } from 'react-aria'
import { Text } from 'react-aria-components'

export type CalendarDisplayLegendProps = CalendarDisplayProps

export const CalendarDisplayLegend = ({ highlightDates }: CalendarDisplayLegendProps) => {
  return (
    <div>
      <VisuallyHidden>Legend</VisuallyHidden>
      <Flex>
        {highlightDates?.map((highlight, index) => (
          <Flex justifyContent="center" alignItems="center" key={index}>
            <div data-highlight={highlight.highlightColor} className="react-aria-CalendarLegend" />
            <Text>{highlight.label}</Text>
          </Flex>
        ))}
      </Flex>
    </div>
  )
}
