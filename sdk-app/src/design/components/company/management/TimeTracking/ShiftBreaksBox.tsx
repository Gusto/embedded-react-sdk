import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { BreakRule } from './types'
import { breakTypeLabel, describeBreakRequirement, formatTimeInZone } from './formatters'
import { NO_RULE, calculateShiftHours, type ShiftFormInput } from './shiftForm'
import { zonedToUtcIso } from './timeZones'
import styles from './ShiftBreaksBox.module.scss'
import {
  DataView,
  EmptyData,
  Flex,
  HamburgerMenu,
  NumberInputField,
  SelectField,
  TextInputField,
  useDataView,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type BreakInput = ShiftFormInput['breaks'][number]

type BreakEdit = { index: number; original: BreakInput | null }

function ruleValue(rule: BreakRule): string {
  return rule.id ?? `${rule.breakType}-${rule.afterHoursWorkedMinutes}`
}

export interface ShiftBreaksBoxProps {
  date: string
  timeZone: string
  rules: BreakRule[]
}

/** Lists a shift's breaks in a table; adding or editing swaps the table for one break's fields. */
export function ShiftBreaksBox({ date, timeZone, rules }: ShiftBreaksBoxProps) {
  const Components = useComponentContext()
  const { control, watch, trigger, getFieldState } = useFormContext<ShiftFormInput>()
  const breaks = useFieldArray({ control, name: 'breaks' })
  const values = watch()
  const [editing, setEditing] = useState<BreakEdit | null>(null)

  const ruleOptions = [
    ...(rules.length === 0 ? [{ value: NO_RULE, label: 'Break' }] : []),
    ...rules.map(rule => ({
      value: ruleValue(rule),
      label: `${breakTypeLabel(rule.breakType, rule.isPaid)} · ${rule.durationMinutes} min`,
    })),
  ]
  const formatStart = (start: string) =>
    start ? formatTimeInZone(zonedToUtcIso(date, start, timeZone), timeZone) : '—'
  const alerts = breakAlerts(values, rules, formatStart)
  const missingAlerts = alerts.filter(alert => alert.kind === 'missing')
  const displayedAlerts =
    missingAlerts.length > 1
      ? [
          {
            key: 'missing-breaks',
            label: 'Missing breaks',
            description: (
              <Components.UnorderedList items={missingAlerts.map(alert => alert.description)} />
            ),
          },
          ...alerts.filter(alert => alert.kind !== 'missing'),
        ]
      : alerts

  const startEditing = (shiftBreak: BreakInput | null, index?: number) => {
    if (index === undefined) {
      breaks.append(shiftBreak ?? { ruleId: NO_RULE, start: '', lengthMinutes: undefined })
      setEditing({ index: breaks.fields.length, original: null })
      return
    }
    setEditing({ index, original: values.breaks[index] ?? null })
  }

  const cancelEditing = () => {
    if (!editing) return
    if (editing.original) breaks.update(editing.index, editing.original)
    else breaks.remove(editing.index)
    setEditing(null)
  }

  const saveEditing = async () => {
    if (!editing) return
    await trigger()
    if (!getFieldState(`breaks.${editing.index}`).invalid) setEditing(null)
  }

  const ruleLabel = (ruleId: string) =>
    ruleOptions.find(option => option.value === ruleId)?.label ?? 'Break'

  const dataViewProps = useDataView<BreakInput & { index: number }>({
    data: values.breaks.map((shiftBreak, index) => ({ ...shiftBreak, index })),
    columns: [
      { key: 'type', title: 'Break type', render: shiftBreak => ruleLabel(shiftBreak.ruleId) },
      { key: 'start', title: 'Start', render: shiftBreak => formatStart(shiftBreak.start) },
      {
        key: 'length',
        title: 'Length',
        render: shiftBreak =>
          typeof shiftBreak.lengthMinutes === 'number' ? `${shiftBreak.lengthMinutes} min` : '—',
      },
    ],
    itemMenu: shiftBreak => (
      <HamburgerMenu
        triggerLabel={`Actions for ${ruleLabel(shiftBreak.ruleId)} at ${formatStart(shiftBreak.start)}`}
        items={[
          {
            label: 'Edit',
            onClick: () => {
              startEditing(shiftBreak, shiftBreak.index)
            },
          },
          {
            label: 'Remove',
            onClick: () => {
              breaks.remove(shiftBreak.index)
            },
          },
        ]}
      />
    ),
    emptyState: () => <EmptyData title="No breaks" />,
  })

  if (editing) {
    const index = editing.index
    return (
      <Components.Box
        header={<Components.BoxHeader title={editing.original ? 'Edit break' : 'Add break'} />}
        footer={
          <div className={styles.footerActions}>
            <Components.Button variant="secondary" onClick={cancelEditing}>
              Cancel
            </Components.Button>
            <Components.Button
              onClick={() => {
                void saveEditing()
              }}
            >
              Save
            </Components.Button>
          </div>
        }
      >
        <Flex flexDirection="column" gap={12} alignItems="stretch">
          <SelectField
            name={`breaks.${index}.ruleId`}
            label="Break type"
            placeholder="Select a break type"
            options={ruleOptions}
          />
          <NumberInputField
            name={`breaks.${index}.lengthMinutes`}
            label="Length"
            min={1}
            adornmentEnd="min"
          />
          <TextInputField name={`breaks.${index}.start`} label="Start" type="time" />
        </Flex>
      </Components.Box>
    )
  }

  return (
    <Flex flexDirection="column" gap={12} alignItems="stretch">
      {displayedAlerts.map(alert => (
        <Components.Alert
          key={alert.key}
          status="warning"
          label={alert.label}
          disableScrollIntoView
        >
          {typeof alert.description === 'string' ? (
            <Components.Text>{alert.description}</Components.Text>
          ) : (
            alert.description
          )}
        </Components.Alert>
      ))}
      <Components.Box
        withPadding={false}
        header={<Components.BoxHeader title="Breaks" />}
        footer={
          <Flex flexDirection="row">
            <Components.Button
              variant="secondary"
              onClick={() => {
                const firstRule = rules[0]
                startEditing({
                  ruleId: firstRule ? ruleValue(firstRule) : NO_RULE,
                  lengthMinutes: firstRule?.durationMinutes,
                  start: '',
                })
              }}
            >
              Add break
            </Components.Button>
          </Flex>
        }
      >
        <DataView label="Breaks" isWithinBox {...dataViewProps} />
      </Components.Box>
    </Flex>
  )
}

interface BreakAlert {
  key: string
  kind: 'missing' | 'shortened'
  label: string
  description: string
}

/** Mirrors compliance.ts against unsaved form values so issues show while editing. */
function breakAlerts(
  values: ShiftFormInput,
  rules: BreakRule[],
  formatStart: (start: string) => string,
): BreakAlert[] {
  const shiftHours = calculateShiftHours(values)
  if (shiftHours === null) return []
  const shiftMinutes = shiftHours * 60
  const alerts: BreakAlert[] = []

  for (const rule of rules) {
    const taken = values.breaks.filter(shiftBreak => shiftBreak.ruleId === ruleValue(rule))
    const required =
      rule.breakType === 'rest'
        ? Math.floor(shiftMinutes / rule.afterHoursWorkedMinutes)
        : shiftMinutes >= rule.afterHoursWorkedMinutes
          ? 1
          : 0
    if (taken.length < required) {
      alerts.push({
        key: `missing-${ruleValue(rule)}`,
        kind: 'missing',
        label: rule.breakType === 'meal' ? 'Missing meal break' : 'Missing rest break',
        description:
          required - taken.length > 1
            ? `${required - taken.length} more are needed. ${describeBreakRequirement(rule)}`
            : describeBreakRequirement(rule),
      })
    }
    taken.forEach((shiftBreak, index) => {
      if (
        typeof shiftBreak.lengthMinutes === 'number' &&
        shiftBreak.lengthMinutes < rule.durationMinutes
      ) {
        alerts.push({
          key: `short-${ruleValue(rule)}-${index}`,
          kind: 'shortened',
          label: 'Shortened break',
          description: `The ${rule.breakType} break at ${formatStart(shiftBreak.start)} is ${shiftBreak.lengthMinutes} minutes. The break policy requires at least ${rule.durationMinutes} minutes.`,
        })
      }
    })
  }
  return alerts
}
