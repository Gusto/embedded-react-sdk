import { addMinutes, placeBreak, timeOnShift, type BreakDraft } from './breaks'
import { breakRuleLabel, minutesBetween, zonedParts, type ApiBreakRule } from './model'
import { Flex, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function BreaksEditor({
  breaks,
  onChange,
  rules,
  shiftStart,
  shiftEnd,
  timeZone,
}: {
  breaks: BreakDraft[]
  onChange: (next: BreakDraft[]) => void
  rules: ApiBreakRule[]
  shiftStart: string | null
  shiftEnd: string | null
  timeZone: string
}) {
  const Components = useComponentContext()
  const update = (key: string, patch: Partial<BreakDraft>) => {
    onChange(breaks.map(b => (b.key === key ? { ...b, ...patch } : b)))
  }

  return (
    <Flex flexDirection="column" gap={8}>
      <Components.Text weight="medium">Breaks</Components.Text>
      {breaks.length === 0 && (
        <Components.Text size="sm" variant="supporting">
          No breaks.
        </Components.Text>
      )}
      {breaks.map(b => (
        <Grid
          key={b.key}
          gridTemplateColumns={{ base: '1fr', small: '2fr 1fr 1fr auto' }}
          gap={8}
          alignItems="end"
        >
          <Components.Text size="sm">
            {b.rule ? breakRuleLabel(b.rule) : 'Unlinked break · unpaid'}
          </Components.Text>
          <Components.TextInput
            type="time"
            label="Start"
            value={zonedParts(b.start, timeZone).time}
            onChange={value => {
              if (!value || !shiftStart) return
              const start = timeOnShift(value, shiftStart, timeZone)
              const length = b.end ? minutesBetween(b.start, b.end) : null
              update(b.key, { start, end: length === null ? b.end : addMinutes(start, length) })
            }}
          />
          <Components.TextInput
            type="time"
            label="End"
            value={b.end ? zonedParts(b.end, timeZone).time : ''}
            onChange={value => {
              if (!value || !shiftStart) return
              update(b.key, { end: timeOnShift(value, shiftStart, timeZone) })
            }}
          />
          <Components.Button
            variant="tertiary"
            onClick={() => {
              onChange(breaks.filter(x => x.key !== b.key))
            }}
          >
            Remove
          </Components.Button>
        </Grid>
      ))}
      <Flex gap={8} flexWrap="wrap">
        {rules.map(rule => (
          <Components.Button
            key={rule.uuid}
            variant="secondary"
            isDisabled={!shiftStart || !shiftEnd}
            onClick={() => {
              if (!shiftStart || !shiftEnd) return
              onChange([...breaks, placeBreak(breaks, rule, shiftStart, shiftEnd)])
            }}
          >
            Add {rule.break_type} break
          </Components.Button>
        ))}
      </Flex>
      <Components.Text size="sm" variant="supporting">
        Changing a start keeps the break’s length. Times are in {timeZone}.
      </Components.Text>
    </Flex>
  )
}
