import { useState } from 'react'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import { ManagePayScheduleTypeSelectionPresentation } from './ManagePayScheduleTypeSelectionPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export type PayScheduleType =
  (typeof PayScheduleAssignmentBodyType)[keyof typeof PayScheduleAssignmentBodyType]

export interface ManagePayScheduleTypeSelectionProps extends BaseComponentInterface {
  companyId: string
  currentType?: PayScheduleType | null
}

export function ManagePayScheduleTypeSelection(props: ManagePayScheduleTypeSelectionProps) {
  useI18n('CompanyManagement.ManagePayScheduleTypeSelection')
  useComponentDictionary('CompanyManagement.ManagePayScheduleTypeSelection', props.dictionary)
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ currentType }: ManagePayScheduleTypeSelectionProps) {
  const { onEvent } = useBase()
  const [selectedType, setSelectedType] = useState<PayScheduleType>(
    currentType ?? PayScheduleAssignmentBodyType.Single,
  )

  const handleTypeChange = (value: string) => {
    setSelectedType(value as PayScheduleType)
  }

  const handleContinue = () => {
    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_TYPE_SELECTED, { type: selectedType })
  }

  const handleBack = () => {
    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_CANCEL)
  }

  return (
    <ManagePayScheduleTypeSelectionPresentation
      selectedType={selectedType}
      onTypeChange={handleTypeChange}
      onContinue={handleContinue}
      onBack={handleBack}
    />
  )
}
