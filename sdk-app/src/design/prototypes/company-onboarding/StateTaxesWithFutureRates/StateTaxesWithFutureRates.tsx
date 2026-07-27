import { Suspense, useMemo, useState } from 'react'
import { useTaxRequirementsGetAllSuspense } from '@gusto/embedded-api/react-query/taxRequirementsGetAll'
import { useTaxRequirementsGetSuspense } from '@gusto/embedded-api/react-query/taxRequirementsGet'
import { useTaxRequirementsUpdateStateMutation } from '@gusto/embedded-api/react-query/taxRequirementsUpdateState'
import type { TaxRequirementSet } from '@gusto/embedded-api/models/components/taxrequirementset'
import { StateTaxesListView } from '../../../components/company/onboarding/StateTaxesWithFutureRates/StateTaxesListView'
import { TaxRatesHistoryView } from '../../../components/company/onboarding/StateTaxesWithFutureRates/TaxRatesHistoryView'
import type { TaxRateSubmission } from '../../../components/company/onboarding/StateTaxesWithFutureRates/AddTaxRateDialog'
import { BaseComponent, useBase } from '@/components/Base'
import { Flex } from '@/components/Common'

export interface StateTaxesWithFutureRatesProps {
  companyId: string
}

type View = { name: 'list' } | { name: 'history'; state: string }

function stringifyRequirementValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'number') return isNaN(value) ? '' : String(value)
  if (typeof value === 'string') return value
  if (typeof value === 'boolean') return String(value)
  return ''
}

function ListRoot({
  companyId,
  onManageRates,
}: {
  companyId: string
  onManageRates: (state: string) => void
}) {
  const { data } = useTaxRequirementsGetAllSuspense({ companyUuid: companyId })
  const stateTaxRequirements = data.taxRequirementStatesList ?? []
  return (
    <StateTaxesListView
      stateTaxRequirements={stateTaxRequirements}
      onEditCurrent={() => {}}
      onManageRates={onManageRates}
    />
  )
}

function HistoryRoot({
  companyId,
  state,
  onBack,
}: {
  companyId: string
  state: string
  onBack: () => void
}) {
  const currentQuery = useTaxRequirementsGetSuspense({ companyUuid: companyId, state })
  const schedulingQuery = useTaxRequirementsGetSuspense({
    companyUuid: companyId,
    state,
    scheduling: true,
  })
  const { mutateAsync: updateStateTax } = useTaxRequirementsUpdateStateMutation()
  const { baseSubmitHandler } = useBase()

  const apiSets = useMemo(
    () => currentQuery.data.taxRequirementsState?.requirementSets ?? [],
    [currentQuery.data.taxRequirementsState?.requirementSets],
  )
  const schedulingSets = useMemo(
    () => schedulingQuery.data.taxRequirementsState?.requirementSets ?? [],
    [schedulingQuery.data.taxRequirementsState?.requirementSets],
  )

  const availableFutureDates = useMemo(() => {
    const existing = new Set(
      apiSets
        .map(s => s.effectiveFrom)
        .filter((d): d is string => typeof d === 'string' && d.length > 0),
    )
    return schedulingSets
      .map(s => s.effectiveFrom)
      .filter((d): d is string => typeof d === 'string' && d.length > 0 && !existing.has(d))
      .sort()
  }, [schedulingSets, apiSets])

  const templateSet = useMemo<TaxRequirementSet | null>(() => {
    if (schedulingSets.length > 0) return schedulingSets[0] ?? null
    const effectiveDated = apiSets.filter(
      s => typeof s.effectiveFrom === 'string' && s.effectiveFrom.length > 0,
    )
    return effectiveDated[effectiveDated.length - 1] ?? null
  }, [schedulingSets, apiSets])

  const handleAddTaxRate = async (submission: TaxRateSubmission): Promise<boolean> => {
    if (!templateSet || !templateSet.key) return false
    let success = false
    await baseSubmitHandler(submission, async payload => {
      const applicableRequirements = (templateSet.requirements ?? [])
        .filter(req => req.editable !== false && req.key)
        .map(req => ({
          key: req.key as string,
          value: stringifyRequirementValue(payload.values[req.key as string]),
        }))
        .filter(r => r.value.length > 0)

      await updateStateTax({
        request: {
          companyUuid: companyId,
          state,
          requestBody: {
            requirementSets: [
              {
                state,
                key: templateSet.key as string,
                effectiveFrom: payload.effectiveFrom,
                requirements: applicableRequirements,
              },
            ],
          },
        },
      })
      success = true
    })
    return success
  }

  return (
    <TaxRatesHistoryView
      state={state}
      requirementSets={apiSets}
      availableFutureDates={availableFutureDates}
      onBack={onBack}
      onAddTaxRate={handleAddTaxRate}
    />
  )
}

export function StateTaxesWithFutureRates({ companyId }: StateTaxesWithFutureRatesProps) {
  const [view, setView] = useState<View>({ name: 'list' })

  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32} alignItems="stretch">
        <Suspense fallback={<div>Loading...</div>}>
          {view.name === 'list' && (
            <ListRoot
              companyId={companyId}
              onManageRates={state => {
                setView({ name: 'history', state })
              }}
            />
          )}
          {view.name === 'history' && (
            <HistoryRoot
              companyId={companyId}
              state={view.state}
              onBack={() => {
                setView({ name: 'list' })
              }}
            />
          )}
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
