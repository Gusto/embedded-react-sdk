import { useFieldArray, useFormContext } from 'react-hook-form'
import type { BreakPolicy, TimeTrackingPerson } from './types'
import type { BreakPolicyFormInput } from './useBreakPolicyForm'
import { PolicyPeoplePicker } from './PolicyPeoplePicker'
import { useStateName } from './useStateName'
import {
  CheckboxField,
  Flex,
  Grid,
  NumberInputField,
  SelectField,
  TextInputField,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const COMPENSATION_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid (off-duty)' },
  { value: 'paid', label: 'Paid (on-duty)' },
]

export interface BreakPolicyFieldsProps {
  policy?: BreakPolicy
  jurisdiction: string | null
  people: TimeTrackingPerson[]
  policyNames: Record<string, string>
  serverErrors?: string[]
}

export function BreakPolicyFields({
  policy,
  jurisdiction,
  people,
  policyNames,
  serverErrors,
}: BreakPolicyFieldsProps) {
  const Components = useComponentContext()
  const stateName = useStateName()
  const { control, watch } = useFormContext<BreakPolicyFormInput>()
  const meals = useFieldArray({ control, name: 'meals' })
  const rests = useFieldArray({ control, name: 'rests' })
  const values = watch()

  const outOfStateCount = jurisdiction
    ? values.employeeUuids.filter(uuid => {
        const workState = people.find(person => person.uuid === uuid)?.workState
        return workState !== undefined && workState !== null && workState !== jurisdiction
      }).length
    : 0
  const hasShortMeal =
    values.providesMeal &&
    values.meals.some(rule => typeof rule.durationMinutes === 'number' && rule.durationMinutes < 30)

  return (
    <Flex flexDirection="column" gap={20} alignItems="stretch">
      {serverErrors && serverErrors.length > 0 ? (
        <Components.Alert status="error" label="Break policy could not be saved">
          <Flex flexDirection="column" gap={4}>
            {serverErrors.map(message => (
              <Components.Text key={message}>{message}</Components.Text>
            ))}
          </Flex>
        </Components.Alert>
      ) : null}

      <TextInputField name="name" label="Policy name" isRequired />

      {outOfStateCount > 0 && jurisdiction ? (
        <Components.Alert
          status="warning"
          label={`Some employees don’t work in ${stateName(jurisdiction)}`}
          disableScrollIntoView
        >
          <Components.Text>
            {`${outOfStateCount} selected ${outOfStateCount === 1 ? 'employee works' : 'employees work'} in a different state. Break laws vary by state, so make sure this policy fits where they work.`}
          </Components.Text>
        </Components.Alert>
      ) : null}

      <BreakRulesSection
        title="Provide a meal break"
        toggleName="providesMeal"
        arrayName="meals"
        isEnabled={values.providesMeal}
        fields={meals.fields}
        onAdd={() => {
          meals.append({ durationMinutes: 30, everyHours: 5, compensation: 'unpaid' })
        }}
        onRemove={meals.remove}
        addLabel="Add another meal break"
      />
      {hasShortMeal ? (
        <Components.Alert
          status="warning"
          label="Meal breaks are typically at least 30 minutes long"
          disableScrollIntoView
        />
      ) : null}

      <BreakRulesSection
        title="Provide a rest break"
        toggleName="providesRest"
        arrayName="rests"
        isEnabled={values.providesRest}
        fields={rests.fields}
        onAdd={() => {
          rests.append({ durationMinutes: 10, everyHours: 4, compensation: 'paid' })
        }}
        onRemove={rests.remove}
        addLabel="Add another rest break"
      />

      <CheckboxField
        name="payPremium"
        label="Add break premium hours to timesheets"
        description="A premium of 1 hour will be added for each flagged timesheet violation, capped at a maximum of 2 premiums per workday (1 meal and 1 rest)."
      />
      {!values.payPremium && policy?.payPremium ? (
        <Components.Alert
          status="warning"
          label="You’ll need to manually calculate premiums"
          disableScrollIntoView
        />
      ) : null}

      <PolicyPeoplePicker
        name="employeeUuids"
        kind="break"
        policyId={policy?.id ?? null}
        people={people}
        policyNames={policyNames}
      />
      <Components.Text size="sm" variant="supporting">
        You can’t change someone’s break policy assignment if they’ve already taken a break today.
      </Components.Text>
    </Flex>
  )
}

function BreakRulesSection({
  title,
  toggleName,
  arrayName,
  isEnabled,
  fields,
  onAdd,
  onRemove,
  addLabel,
}: {
  title: string
  toggleName: 'providesMeal' | 'providesRest'
  arrayName: 'meals' | 'rests'
  isEnabled: boolean
  fields: Array<{ id: string }>
  onAdd: () => void
  onRemove: (index: number) => void
  addLabel: string
}) {
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={12} alignItems="stretch">
      <CheckboxField name={toggleName} label={title} />
      {isEnabled ? (
        <>
          {fields.map((field, index) => (
            <Grid
              key={field.id}
              gap={12}
              gridTemplateColumns={{ base: '1fr', small: '1fr 1fr 1.3fr auto' }}
              alignItems="end"
            >
              <NumberInputField
                name={`${arrayName}.${index}.durationMinutes`}
                label="Minimum length"
                min={1}
                adornmentEnd="min"
              />
              <NumberInputField
                name={`${arrayName}.${index}.everyHours`}
                label="Provided every"
                min={0}
                maximumFractionDigits={2}
                adornmentEnd="hrs"
              />
              <SelectField
                name={`${arrayName}.${index}.compensation`}
                label="Compensation"
                placeholder="Select"
                options={COMPENSATION_OPTIONS}
              />
              {fields.length > 1 ? (
                <Components.Button
                  variant="tertiary"
                  onClick={() => {
                    onRemove(index)
                  }}
                >
                  Remove
                </Components.Button>
              ) : null}
            </Grid>
          ))}
          <Flex flexDirection="row">
            <Components.Button variant="tertiary" onClick={onAdd}>
              {addLabel}
            </Components.Button>
          </Flex>
        </>
      ) : null}
    </Flex>
  )
}
