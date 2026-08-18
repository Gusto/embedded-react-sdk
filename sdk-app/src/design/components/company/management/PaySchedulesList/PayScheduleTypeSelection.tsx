import { useState } from 'react'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type PayScheduleType =
  (typeof PayScheduleAssignmentBodyType)[keyof typeof PayScheduleAssignmentBodyType]

export interface PayScheduleTypeSelectionProps {
  currentType: PayScheduleType | null | undefined
  hasEmployees: boolean
  hasDepartments: boolean
  onContinue: (type: PayScheduleType) => void
  onBack: () => void
}

const ALWAYS_OPTIONS: Array<{
  value: PayScheduleType
  label: string
  description: string
}> = [
  {
    value: PayScheduleAssignmentBodyType.Single,
    label: 'Everyone on one schedule',
    description: 'Choose one pay schedule for all your employees',
  },
  {
    value: PayScheduleAssignmentBodyType.HourlySalaried,
    label: 'By compensation type',
    description: 'Assign separate pay schedules to hourly and salaried employees',
  },
]

const BY_EMPLOYEE_OPTION = {
  value: PayScheduleAssignmentBodyType.ByEmployee,
  label: 'By employee',
  description:
    'Assign employees to pay schedules individually. Use this for schedules based on location, owner, status or other qualifiers.',
}

const BY_DEPARTMENT_OPTION = {
  value: PayScheduleAssignmentBodyType.ByDepartment,
  label: 'By department',
  description:
    'Assign pay schedules to departments. Use this to pay Sales or other commission-based department separately.',
}

export function PayScheduleTypeSelection({
  currentType,
  hasEmployees,
  hasDepartments,
  onContinue,
  onBack,
}: PayScheduleTypeSelectionProps) {
  const Components = useComponentContext()

  const options = [
    ...ALWAYS_OPTIONS,
    ...(hasEmployees ? [BY_EMPLOYEE_OPTION] : []),
    ...(hasDepartments ? [BY_DEPARTMENT_OPTION] : []),
  ]

  const initialValue: PayScheduleType =
    currentType && options.some(o => o.value === currentType)
      ? currentType
      : PayScheduleAssignmentBodyType.Single

  const [selectedType, setSelectedType] = useState<PayScheduleType>(initialValue)

  return (
    <Flex flexDirection="column" gap={24} alignItems="stretch">
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">Choose schedule type</Components.Heading>
        <Components.Text variant="supporting">
          After you choose, you can create a pay schedule for each group.
        </Components.Text>
      </Flex>
      <Components.RadioGroup
        label="Choose schedule type"
        shouldVisuallyHideLabel
        options={options}
        value={selectedType}
        onChange={value => {
          setSelectedType(value as PayScheduleType)
        }}
      />
      <ActionsLayout>
        <Components.Button variant="secondary" onClick={onBack}>
          Back
        </Components.Button>
        <Components.Button
          onClick={() => {
            onContinue(selectedType)
          }}
        >
          Continue
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
