import { useFormContext } from 'react-hook-form'
import type { OvertimePolicy, TimeTrackingPerson } from './types'
import type { OvertimePolicyFormInput } from './useOvertimePolicyForm'
import { PolicyPeoplePicker } from './PolicyPeoplePicker'
import {
  CheckboxField,
  Flex,
  NumberInputField,
  RadioGroupField,
  TextInputField,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface OvertimePolicyFieldsProps {
  policy?: OvertimePolicy
  people: TimeTrackingPerson[]
  policyNames: Record<string, string>
  serverErrors?: string[]
}

export function OvertimePolicyFields({
  policy,
  people,
  policyNames,
  serverErrors,
}: OvertimePolicyFieldsProps) {
  const Components = useComponentContext()
  const { watch, setValue } = useFormContext<OvertimePolicyFormInput>()
  const hasDailyOvertime = watch('hasDailyOvertime')
  const hasDoubleOvertime = watch('hasDoubleOvertime')

  return (
    <Flex flexDirection="column" gap={20} alignItems="stretch">
      {serverErrors && serverErrors.length > 0 ? (
        <Components.Alert status="error" label="Overtime policy could not be saved">
          <Flex flexDirection="column" gap={4}>
            {serverErrors.map(message => (
              <Components.Text key={message}>{message}</Components.Text>
            ))}
          </Flex>
        </Components.Alert>
      ) : null}

      <TextInputField
        name="name"
        label="Policy name"
        description="Policy name will be visible to admins, but not to assigned team members."
        isRequired
      />

      <NumberInputField
        name="weeklyThreshold"
        label="Weekly overtime"
        description="Hours worked beyond this in a workweek are paid at 1.5x."
        isRequired
        min={10}
        max={168}
        adornmentEnd="hours/week"
      />

      <Flex flexDirection="column" gap={12} alignItems="stretch">
        <CheckboxField
          name="hasDailyOvertime"
          label="Daily overtime"
          description="Hours worked beyond this in a workday are paid at 1.5x."
          onChange={checked => {
            if (!checked) setValue('hasDoubleOvertime', false)
          }}
        />
        {hasDailyOvertime ? (
          <NumberInputField
            name="dailyThreshold"
            label="Daily overtime after"
            min={1}
            max={24}
            adornmentEnd="hours/day"
          />
        ) : null}
      </Flex>

      <Flex flexDirection="column" gap={12} alignItems="stretch">
        <CheckboxField
          name="hasDoubleOvertime"
          label="Daily double overtime"
          description="Hours worked beyond this in a workday are paid at 2x."
          isDisabled={!hasDailyOvertime}
        />
        {hasDailyOvertime && hasDoubleOvertime ? (
          <NumberInputField
            name="doubleOvertimeThreshold"
            label="Daily double overtime after"
            min={1}
            max={24}
            adornmentEnd="hours/day"
          />
        ) : null}
      </Flex>

      <RadioGroupField
        name="consecutiveDayOvertime"
        label="7th consecutive day overtime"
        options={[
          { value: 'no', label: 'No, my state doesn’t require 7th consecutive day overtime' },
          { value: 'yes', label: 'Yes, my state requires 7th consecutive day overtime' },
        ]}
      />

      <PolicyPeoplePicker
        name="employeeUuids"
        kind="overtime"
        policyId={policy?.id ?? null}
        people={people}
        policyNames={policyNames}
      />
    </Flex>
  )
}
