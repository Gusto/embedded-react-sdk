import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useHolidayPayPoliciesCreateMutation } from '@gusto/embedded-api/react-query/holidayPayPoliciesCreate'
import {
  useHolidayPayPoliciesGetSuspense,
  queryKeyHolidayPayPoliciesGet,
  invalidateAllHolidayPayPoliciesGet,
  type HolidayPayPoliciesGetQueryData,
} from '@gusto/embedded-api/react-query/holidayPayPoliciesGet'
import { useHolidayPayPoliciesUpdateMutation } from '@gusto/embedded-api/react-query/holidayPayPoliciesUpdate'
import type { HolidayPayPolicy } from '@gusto/embedded-api/models/components/holidaypaypolicy'
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
  mode?: 'create' | 'edit'
}

export function HolidaySelectionForm(props: HolidaySelectionFormProps) {
  return (
    <BaseComponent {...props}>
      {props.mode === 'edit' ? (
        <EditRoot companyId={props.companyId} />
      ) : (
        <CreateRoot companyId={props.companyId} />
      )}
    </BaseComponent>
  )
}

interface RootProps {
  companyId: string
}

function useHolidaySelection(initialKeys: Set<string>) {
  const [selectedUuids, setSelectedUuids] = useState(initialKeys)

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

  const handleSelectAll = useCallback((selected: boolean, visibleItems: HolidayItem[]) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      for (const item of visibleItems) {
        if (selected) next.add(item.uuid)
        else next.delete(item.uuid)
      }
      return next
    })
  }, [])

  return { selectedUuids, handleSelectionChange, handleSelectAll }
}

function seedPolicyCache(
  queryClient: ReturnType<typeof useQueryClient>,
  companyId: string,
  policy: HolidayPayPolicy | undefined,
) {
  if (!policy) return
  queryClient.setQueryData<HolidayPayPoliciesGetQueryData>(
    queryKeyHolidayPayPoliciesGet(companyId, {}),
    prev =>
      prev
        ? { ...prev, holidayPayPolicy: policy }
        : (undefined as unknown as HolidayPayPoliciesGetQueryData),
  )
}

function CreateRoot({ companyId }: RootProps) {
  useI18n('Company.TimeOff.HolidayPolicy')
  const { t } = useTranslation('Company.TimeOff.HolidayPolicy')
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()

  const holidays = useMemo(() => getDefaultHolidayItems(t), [t])
  const allKeys = useMemo(() => new Set(FEDERAL_HOLIDAY_KEYS), [])
  const { selectedUuids, handleSelectionChange, handleSelectAll } = useHolidaySelection(allKeys)

  const { mutateAsync: createPolicy } = useHolidayPayPoliciesCreateMutation()

  const handleContinue = useCallback(async () => {
    await baseSubmitHandler({}, async () => {
      const response = await createPolicy({
        request: {
          companyUuid: companyId,
          holidayPayPolicyRequest: {
            federalHolidays: buildFederalHolidaysPayload(selectedUuids),
          },
        },
      })
      // Seed the GET cache so the next mount of SelectEmployeesHoliday's
      // StandaloneLoader (in addEmployeesHoliday state) reads the freshly
      // created policy instead of a stale `{ holidayPayPolicy: undefined }`
      // left over from PolicyList's pre-create GET.
      seedPolicyCache(queryClient, companyId, response.holidayPayPolicy)
      await invalidateAllHolidayPayPoliciesGet(queryClient)
      onEvent(componentEvents.TIME_OFF_HOLIDAY_SELECTION_DONE)
    })
  }, [baseSubmitHandler, createPolicy, companyId, selectedUuids, queryClient, onEvent])

  const handleBack = useCallback(() => {
    onEvent(componentEvents.CANCEL)
  }, [onEvent])

  return (
    <HolidaySelectionFormPresentation
      holidays={holidays}
      selectedHolidayUuids={selectedUuids}
      onSelectionChange={handleSelectionChange}
      onSelectAll={handleSelectAll}
      onContinue={handleContinue}
      onBack={handleBack}
    />
  )
}

function EditRoot({ companyId }: RootProps) {
  useI18n('Company.TimeOff.HolidayPolicy')
  const { t } = useTranslation('Company.TimeOff.HolidayPolicy')
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()

  const { data } = useHolidayPayPoliciesGetSuspense({ companyUuid: companyId })
  const policy = data.holidayPayPolicy!

  const holidays = useMemo(() => getDefaultHolidayItems(t), [t])

  const initialSelected = useMemo(() => {
    const next = new Set<string>()
    const federal = policy.federalHolidays
    for (const key of FEDERAL_HOLIDAY_KEYS) {
      const entry = federal[key as keyof typeof federal]
      if (entry?.selected === true) {
        next.add(key)
      }
    }
    return next
  }, [policy.federalHolidays])

  const { selectedUuids, handleSelectionChange, handleSelectAll } =
    useHolidaySelection(initialSelected)

  const { mutateAsync: updatePolicy } = useHolidayPayPoliciesUpdateMutation()

  const handleContinue = useCallback(async () => {
    await baseSubmitHandler({}, async () => {
      const response = await updatePolicy({
        request: {
          companyUuid: companyId,
          requestBody: {
            version: policy.version!,
            federalHolidays: buildFederalHolidaysPayload(selectedUuids),
          },
        },
      })
      seedPolicyCache(queryClient, companyId, response.holidayPayPolicy)
      await invalidateAllHolidayPayPoliciesGet(queryClient)
      onEvent(componentEvents.TIME_OFF_HOLIDAY_SELECTION_EDIT_DONE)
    })
  }, [
    baseSubmitHandler,
    updatePolicy,
    companyId,
    policy.version,
    selectedUuids,
    queryClient,
    onEvent,
  ])

  const handleBack = useCallback(() => {
    onEvent(componentEvents.CANCEL)
  }, [onEvent])

  return (
    <HolidaySelectionFormPresentation
      holidays={holidays}
      selectedHolidayUuids={selectedUuids}
      onSelectionChange={handleSelectionChange}
      onSelectAll={handleSelectAll}
      onContinue={handleContinue}
      onBack={handleBack}
    />
  )
}
