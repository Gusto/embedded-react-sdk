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
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

/**
 * Props for {@link HolidaySelectionForm}.
 *
 * @public
 */
export interface HolidaySelectionFormProps extends BaseComponentInterface<'Company.TimeOff.HolidayPolicy'> {
  /** The associated company identifier. */
  companyId: string
  /** Whether to create a new holiday policy or edit the existing one. Defaults to `'create'`. */
  mode?: 'create' | 'edit'
}

/**
 * Lets a user select which US federal holidays are observed by the company's holiday pay policy.
 *
 * In `'create'` mode, submitting creates a new holiday pay policy. In `'edit'` mode, the form
 * is pre-populated with the existing policy's selections and submitting updates it. All 11 US
 * federal holidays are shown with their observed and next-observation dates; in create mode they
 * are all selected by default.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `timeOff/holidaySelection/done` | Holidays were saved in create mode | — |
 * | `timeOff/holidaySelection/editDone` | Holidays were saved in edit mode | — |
 * | `CANCEL` | The user backed out of the form | — |
 *
 * @param props - See {@link HolidaySelectionFormProps}.
 * @returns The rendered holiday selection form.
 * @public
 */
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
  const { locale } = useLocale()
  const queryClient = useQueryClient()

  const holidays = useMemo(() => getDefaultHolidayItems(t, undefined, locale), [t, locale])
  const allKeys = useMemo(() => new Set(FEDERAL_HOLIDAY_KEYS), [])
  const { selectedUuids, handleSelectionChange, handleSelectAll } = useHolidaySelection(allKeys)

  const { mutateAsync: createPolicy, isPending } = useHolidayPayPoliciesCreateMutation()

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
      isPending={isPending}
    />
  )
}

function EditRoot({ companyId }: RootProps) {
  useI18n('Company.TimeOff.HolidayPolicy')
  const { t } = useTranslation('Company.TimeOff.HolidayPolicy')
  const { onEvent, baseSubmitHandler } = useBase()
  const { locale } = useLocale()
  const queryClient = useQueryClient()

  const { data } = useHolidayPayPoliciesGetSuspense({ companyUuid: companyId })
  const policy = data.holidayPayPolicy!

  const holidays = useMemo(() => getDefaultHolidayItems(t, undefined, locale), [t, locale])

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

  const { mutateAsync: updatePolicy, isPending } = useHolidayPayPoliciesUpdateMutation()

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
      isPending={isPending}
    />
  )
}
