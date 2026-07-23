import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTaxRequirementsGetSuspense } from '@gusto/embedded-api/react-query/taxRequirementsGet'
import { useTaxRequirementsUpdateStateMutation } from '@gusto/embedded-api/react-query/taxRequirementsUpdateState'
import { TaxRateHistorySection } from './TaxRateHistorySection'
import { AddRateAction } from './AddRateAction'
import { TaxRateManagementProvider, type TaxRateKeyGroup } from './context'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { DetailViewLayout, Flex } from '@/components/Common'
import { componentEvents, type STATES_ABBR } from '@/shared/constants'
import { useBase } from '@/components/Base'

/**
 * Props for {@link TaxRateManagement}.
 *
 * @public
 */
export interface TaxRateManagementProps extends BaseComponentInterface<'Company.StateTaxes'> {
  /** The associated company identifier. */
  companyId: string
  /** Two-letter code of the state whose tax rate history is managed. */
  state: string
}

/**
 * Standalone view of a company's effective-dated state tax rate history, with the ability to
 * schedule a new future-dated rate.
 *
 * @remarks
 * Lower-level building block used by {@link StateTaxes} for its "manage tax rates" view. Only
 * effective-dated requirement keys (e.g. tax rates, deposit schedules) are shown — non-dated
 * sections like registration numbers have no history/scheduling story and are edited via
 * {@link StateTaxesForm} instead.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `CANCEL` | The user navigated back to the state tax list | — |
 *
 * @param props - {@link TaxRateManagementProps}
 * @returns The rendered tax rate history/scheduling view.
 * @public
 *
 * @example
 * ```tsx
 * import { CompanyOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyOnboarding.TaxRateManagement
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       state="CA"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function TaxRateManagement(props: TaxRateManagementProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, state, className, children }: TaxRateManagementProps) {
  useI18n('Company.StateTaxes')
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'manageRates' })
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })
  const { onEvent, baseSubmitHandler } = useBase()

  const { data: currentData } = useTaxRequirementsGetSuspense({ companyUuid: companyId, state })
  const { data: schedulingData } = useTaxRequirementsGetSuspense({
    companyUuid: companyId,
    state,
    scheduling: true,
  })

  const { mutateAsync: updateStateTax, isPending: isPendingUpdate } =
    useTaxRequirementsUpdateStateMutation()

  const groups = useMemo<TaxRateKeyGroup[]>(() => {
    const byKey = new Map<string, TaxRateKeyGroup>()

    currentData.taxRequirementsState?.requirementSets?.forEach(set => {
      if (!set.key || typeof set.effectiveFrom !== 'string') return
      const group = byKey.get(set.key) ?? {
        key: set.key,
        label: set.label,
        sets: [],
        candidateSets: [],
      }
      group.sets.push(set)
      byKey.set(set.key, group)
    })

    schedulingData.taxRequirementsState?.requirementSets?.forEach(set => {
      if (!set.key || typeof set.effectiveFrom !== 'string') return
      const group = byKey.get(set.key)
      if (!group) return
      group.candidateSets.push(set)
    })

    return Array.from(byKey.values())
  }, [currentData, schedulingData])

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  const handleAddRate = async (
    key: string,
    effectiveFrom: string,
    requirements: { key: string; value: string }[],
  ): Promise<boolean> => {
    let succeeded = false
    await baseSubmitHandler({ key, effectiveFrom, requirements }, async payload => {
      await updateStateTax({
        request: {
          companyUuid: companyId,
          state,
          requestBody: {
            requirementSets: [
              {
                state,
                key: payload.key,
                effectiveFrom: payload.effectiveFrom,
                requirements: payload.requirements,
              },
            ],
          },
        },
      })
      succeeded = true
    })
    return succeeded
  }

  const singleGroup = groups.length === 1 ? groups[0] : undefined

  return (
    <TaxRateManagementProvider
      value={{ state, groups, isPendingUpdate, handleCancel, handleAddRate }}
    >
      <DetailViewLayout
        className={className}
        title={t('title', { state: statesHash(state as (typeof STATES_ABBR)[number]) })}
        subtitle={t('subtitle')}
        onBack={handleCancel}
        backLabel={t('backCta')}
        actions={singleGroup && <AddRateAction state={state} group={singleGroup} />}
      >
        <Flex flexDirection="column" gap={32} alignItems="stretch">
          {children ??
            groups.map(group => (
              <TaxRateHistorySection key={group.key} group={group} showHeader={groups.length > 1} />
            ))}
        </Flex>
      </DetailViewLayout>
    </TaxRateManagementProvider>
  )
}
