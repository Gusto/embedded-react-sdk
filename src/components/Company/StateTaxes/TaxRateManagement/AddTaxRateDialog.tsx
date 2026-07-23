import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { buildRequirementSchema } from '../shared/buildRequirementSchema'
import { RequirementFields } from '../shared/RequirementFields'
import { getUniqueRhfKey } from '../shared/rhfKey'
import { isRequirementApplicable, type StateTaxesFormValues } from '../shared/applicableIf'
import { stringifyRequirementValue } from '../shared/requirementValue'
import { useTaxRateManagement, type TaxRateKeyGroup } from './context'
import { Flex, SelectField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import type { STATES_ABBR } from '@/shared/constants'

interface AddTaxRateDialogProps {
  isOpen: boolean
  state: string
  group: TaxRateKeyGroup
  onClose: () => void
}

function latestSet(sets: TaxRateKeyGroup['candidateSets']) {
  if (sets.length === 0) return null
  const sorted = [...sets].sort((a, b) =>
    (a.effectiveFrom ?? '').localeCompare(b.effectiveFrom ?? ''),
  )
  return sorted[sorted.length - 1] ?? null
}

/** @internal */
export function AddTaxRateDialog({ isOpen, state, group, onClose }: AddTaxRateDialogProps) {
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'manageRates' })
  const { t: tForm } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })
  const { handleAddRate, isPendingUpdate } = useTaxRateManagement()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const templateSet = useMemo(() => latestSet(group.candidateSets), [group.candidateSets])

  const availableDates = useMemo(
    () =>
      group.candidateSets
        .map(candidate => candidate.effectiveFrom)
        .filter((date): date is string => typeof date === 'string')
        .sort(),
    [group.candidateSets],
  )

  const { shape, defaults } = useMemo(
    () => buildRequirementSchema(templateSet?.requirements, tForm),
    [templateSet, tForm],
  )

  const dynamicSchema = useMemo(
    () =>
      z.object({
        effectiveFrom: z.string().min(1),
        fields: z.object(shape),
      }),
    [shape],
  )

  type FormShape = z.infer<typeof dynamicSchema>

  const defaultValues = useMemo<FormShape>(
    () => ({
      effectiveFrom: templateSet?.effectiveFrom ?? availableDates[0] ?? '',
      fields: defaults,
    }),
    [templateSet, availableDates, defaults],
  )

  const methods = useForm<FormShape>({ resolver: zodResolver(dynamicSchema), defaultValues })

  useEffect(() => {
    if (isOpen) methods.reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultValues])

  const handleSubmit = methods.handleSubmit(async data => {
    if (!templateSet?.key) return
    const formValues: StateTaxesFormValues = { fields: data.fields }
    const requirements = templateSet.requirements ?? []
    const applicableRequirements = requirements
      .map((req, index) => ({ req, index }))
      .filter(({ req }) => req.editable !== false)
      .filter(({ req }) => isRequirementApplicable(req, 'fields', formValues))

    setIsSubmitting(true)
    try {
      const success = await handleAddRate(
        templateSet.key,
        data.effectiveFrom,
        applicableRequirements.map(({ req, index }) => ({
          key: req.key as string,
          value: stringifyRequirementValue(data.fields[getUniqueRhfKey(req, index, requirements)]),
        })),
      )
      if (success) onClose()
    } finally {
      setIsSubmitting(false)
    }
  })

  const hasEditableFields = (templateSet?.requirements ?? []).some(
    requirement => requirement.editable !== false,
  )

  return (
    <Components.Dialog
      isOpen={isOpen}
      onClose={onClose}
      onPrimaryActionClick={() => {
        void handleSubmit()
      }}
      isPrimaryActionLoading={isSubmitting || isPendingUpdate}
      primaryActionLabel={t('saveRateCta')}
      closeActionLabel={t('cancelCta')}
      title={t('addRateDialogTitle', {
        state: statesHash(state as (typeof STATES_ABBR)[number]),
      })}
    >
      <FormProvider {...methods}>
        <Flex flexDirection="column" gap={20} alignItems="stretch">
          <Components.Text size="sm">{t('addRateDialogDescription')}</Components.Text>
          <SelectField
            name="effectiveFrom"
            label={t('effectiveDateLabel')}
            placeholder={t('effectiveDatePlaceholder')}
            isRequired
            isDisabled={availableDates.length === 0}
            options={availableDates.map(date => ({
              value: date,
              label: dateFormatter.formatLongWithYear(date),
            }))}
          />
          {hasEditableFields ? (
            <RequirementFields requirements={templateSet?.requirements} setKey="fields" />
          ) : (
            <Components.Alert status="info" label={t('noEditableFieldsTitle')}>
              {t('noEditableFieldsDescription')}
            </Components.Alert>
          )}
        </Flex>
      </FormProvider>
    </Components.Dialog>
  )
}
