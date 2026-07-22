import { useMemo, useState } from 'react'
import type { TaxRequirementSet } from '@gusto/embedded-api/models/components/taxrequirementset'
import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import { AddTaxRateDialog, type TaxRateSubmission } from './AddTaxRateDialog'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'

export interface TaxRateRow {
  id: string
  effectiveFrom: string
  isCurrent: boolean
  isFuture: boolean
  isHistorical: boolean
  values: Record<string, string>
}

interface TaxRatesHistoryViewProps {
  state: string
  requirementSets: TaxRequirementSet[]
  availableFutureDates: string[]
  onBack: () => void
  onAddTaxRate: (submission: TaxRateSubmission) => Promise<boolean>
}

function isEffectiveDated(
  set: TaxRequirementSet,
): set is TaxRequirementSet & { effectiveFrom: string } {
  return typeof set.effectiveFrom === 'string' && set.effectiveFrom.length > 0
}

function extractRequirementColumns(sets: TaxRequirementSet[]): TaxRequirement[] {
  const seen = new Map<string, TaxRequirement>()
  for (const set of sets) {
    for (const req of set.requirements ?? []) {
      if (req.key && !seen.has(req.key) && req.editable !== false) {
        seen.set(req.key, req)
      }
    }
  }
  return Array.from(seen.values())
}

function toRows(sets: (TaxRequirementSet & { effectiveFrom: string })[]): TaxRateRow[] {
  const today = new Date().toISOString().slice(0, 10)
  const sorted = [...sets].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))
  const currentIndex = sorted.reduce((acc, set, idx) => {
    if (set.effectiveFrom <= today) return idx
    return acc
  }, -1)

  return sorted.map((set, idx) => {
    const values: Record<string, string> = {}
    for (const req of set.requirements ?? []) {
      if (req.key) {
        values[req.key] = req.value === null || req.value === undefined ? '—' : String(req.value)
      }
    }
    return {
      id: `${set.key ?? 'set'}-${set.effectiveFrom}-${idx}`,
      effectiveFrom: set.effectiveFrom,
      isCurrent: idx === currentIndex,
      isFuture: idx > currentIndex,
      isHistorical: idx < currentIndex && currentIndex !== -1,
      values,
    }
  })
}

export function TaxRatesHistoryView({
  state,
  requirementSets,
  availableFutureDates,
  onBack,
  onAddTaxRate,
}: TaxRatesHistoryViewProps) {
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const effectiveDatedSets = useMemo(
    () => requirementSets.filter(isEffectiveDated),
    [requirementSets],
  )
  const requirementColumns = useMemo(
    () => extractRequirementColumns(effectiveDatedSets),
    [effectiveDatedSets],
  )
  const rows = useMemo(() => toRows(effectiveDatedSets), [effectiveDatedSets])

  const templateSet = useMemo<TaxRequirementSet | null>(() => {
    if (effectiveDatedSets.length === 0) return null
    const sorted = [...effectiveDatedSets].sort((a, b) =>
      a.effectiveFrom.localeCompare(b.effectiveFrom),
    )
    return sorted[sorted.length - 1] ?? null
  }, [effectiveDatedSets])

  const { ...dataViewProps } = useDataView<TaxRateRow>({
    data: rows,
    columns: [
      {
        key: 'effectiveFrom',
        title: 'Effective date',
        render: row => dateFormatter.formatLongWithYear(row.effectiveFrom),
      },
      {
        key: 'status',
        title: '',
        render: row => (
          <>
            {row.isCurrent && <Components.Badge status="success">Current</Components.Badge>}
            {row.isFuture && <Components.Badge status="info">Scheduled</Components.Badge>}
            {row.isHistorical && <Components.Badge status="warning">Historical</Components.Badge>}
          </>
        ),
      },
      ...requirementColumns.map(req => ({
        key: req.key as string,
        title: req.label ?? req.key ?? '',
        render: (row: TaxRateRow) => row.values[req.key as string] ?? '—',
      })),
    ],
    emptyState: () => (
      <EmptyData
        title="No effective-dated rates yet"
        description="Add a tax rate to schedule an effective-dated configuration for this state."
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={24} alignItems="stretch">
      <Flex justifyContent="space-between" alignItems="center" gap={16}>
        <Flex flexDirection="column" gap={32}>
          <Components.Button variant="secondary" onClick={onBack}>
            <CaretLeftIcon /> Back to states
          </Components.Button>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Tax rates for {state}</Components.Heading>
            <Components.Text size="sm">
              Effective-dated tax rate history and scheduled future rates.
            </Components.Text>
          </Flex>
        </Flex>
        <Components.Button
          variant="primary"
          onClick={() => {
            setIsDialogOpen(true)
          }}
          isDisabled={availableFutureDates.length === 0 || templateSet === null}
        >
          Add tax rate
        </Components.Button>
      </Flex>

      <DataView label={`Tax rates for ${state}`} {...dataViewProps} />

      <AddTaxRateDialog
        isOpen={isDialogOpen}
        state={state}
        availableEffectiveDates={availableFutureDates}
        requirementTemplate={templateSet}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (isSubmitting) return
          setIsDialogOpen(false)
        }}
        onSubmit={async submission => {
          setIsSubmitting(true)
          try {
            const success = await onAddTaxRate(submission)
            if (success) setIsDialogOpen(false)
          } finally {
            setIsSubmitting(false)
          }
        }}
      />
    </Flex>
  )
}
