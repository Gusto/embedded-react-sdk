import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHolidayPayPoliciesCreateMutation } from '@gusto/embedded-api/react-query/holidayPayPoliciesCreate'
import {
  getDefaultHolidayItems,
  buildFederalHolidaysPayload,
  FEDERAL_HOLIDAY_KEYS,
} from '../shared/holidayHelpers'
import { HolidaySelectionFormPresentation } from './HolidaySelectionFormPresentation'
import type { HolidayItem } from './HolidaySelectionFormTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useI18n } from '@/i18n'

export interface HolidaySelectionFormProps extends BaseComponentInterface {
  companyId: string
}

export function HolidaySelectionForm(props: HolidaySelectionFormProps) {
  return (
    <BaseComponent {...props}>
      <Root companyId={props.companyId} />
    </BaseComponent>
  )
}

function Root({ companyId }: { companyId: string }) {
  useI18n('Company.TimeOff.HolidayPolicy')
  const { t } = useTranslation('Company.TimeOff.HolidayPolicy')
  const { onEvent, baseSubmitHandler } = useBase()

  const holidays = useMemo(() => getDefaultHolidayItems(t), [t])
  const allKeys = useMemo(() => new Set(FEDERAL_HOLIDAY_KEYS), [])
  const [selectedUuids, setSelectedUuids] = useState(allKeys)

  const { mutateAsync: createPolicy } = useHolidayPayPoliciesCreateMutation()

  const handleSelectionChange = useCallback((item: HolidayItem, selected: boolean) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      if (selected) {
        next.add(item.uuid)
      } else {
        next.delete(item.uuid)
      }
      return next
    })
  }, [])

  const handleContinue = useCallback(async () => {
    await baseSubmitHandler({}, async () => {
      await createPolicy({
        request: {
          companyUuid: companyId,
          holidayPayPolicyRequest: {
            federalHolidays: buildFederalHolidaysPayload(selectedUuids),
          },
        },
      })
      onEvent(componentEvents.TIME_OFF_HOLIDAY_SELECTION_DONE)
    })
  }, [baseSubmitHandler, createPolicy, companyId, selectedUuids, onEvent])

  const handleBack = useCallback(() => {
    onEvent(componentEvents.CANCEL)
  }, [onEvent])

  return (
    <HolidaySelectionFormPresentation
      holidays={holidays}
      selectedHolidayUuids={selectedUuids}
      onSelectionChange={handleSelectionChange}
      onContinue={handleContinue}
      onBack={handleBack}
    />
  )
}
