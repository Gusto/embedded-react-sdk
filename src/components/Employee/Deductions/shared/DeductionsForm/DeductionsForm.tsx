import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import type {
  Garnishment,
  GarnishmentType,
} from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import { StandardDeductionForm } from './StandardDeductionForm'
import { ChildSupportFormView } from './ChildSupportFormView'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Grid } from '@/components/Common/Grid/Grid'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentDictionary, useI18n } from '@/i18n'
import type { ResourceDictionary } from '@/types/Helpers'

export type DeductionsFormDictionary = ResourceDictionary<'Employee.DeductionsForm'>

// Garnishment types the form supports (mirrors the legacy SUPPORTED_GARNISHMENT_TYPES).
const SUPPORTED_GARNISHMENT_TYPES: readonly GarnishmentType[] = [
  'child_support',
  'federal_tax_lien',
  'state_tax_lien',
  'student_loan',
  'creditor_garnishment',
  'federal_loan',
  'other_garnishment',
] as const

type Variant = { kind: 'custom' } | { kind: 'garnishment'; type: GarnishmentType }

function deductionToVariant(deduction: Garnishment): Variant {
  const type = deduction.garnishmentType
  if (!deduction.courtOrdered) return { kind: 'custom' }
  return {
    kind: 'garnishment',
    type: type && SUPPORTED_GARNISHMENT_TYPES.includes(type) ? type : 'child_support',
  }
}

export interface DeductionsFormProps {
  className?: string
  employeeId: string
  /** When provided, the form is in edit mode and the deduction's existing
   *  garnishment type selects the inline form variant. Omit for add mode. */
  deduction?: Garnishment | null
  /**
   * Translation overrides for the form's strings. Each consuming block
   * passes the dictionary it resolved from its own namespace so partner
   * overrides on that namespace flow into the form text.
   */
  dictionary?: DeductionsFormDictionary
  onSaved: (deduction: Garnishment, mode: 'create' | 'update') => void
  onCancel: () => void
}

export function DeductionsForm({
  className,
  employeeId,
  deduction,
  dictionary,
  onSaved,
  onCancel,
}: DeductionsFormProps) {
  useI18n('Employee.DeductionsForm')
  useComponentDictionary('Employee.DeductionsForm', dictionary)
  const { t } = useTranslation('Employee.DeductionsForm')
  const Components = useComponentContext()

  const isEdit = !!deduction
  const title = isEdit ? t('editTitle') : t('addTitle')

  // Pre-select the variant in edit mode; let the user pick in add mode.
  const initialVariant = useMemo<Variant | null>(
    () => (deduction ? deductionToVariant(deduction) : null),
    [deduction],
  )
  const [variant, setVariant] = useState<Variant | null>(initialVariant)

  const garnishmentTypeOptions = useMemo(
    () =>
      SUPPORTED_GARNISHMENT_TYPES.map(value => ({
        value,
        label: garnishmentTypeLabel(t, value),
      })),
    [t],
  )

  const handleSelectDeductionType = (selection: string) => {
    if (selection === 'custom') {
      setVariant({ kind: 'custom' })
    } else {
      setVariant({ kind: 'garnishment', type: 'child_support' })
    }
  }

  const handleSelectGarnishmentType = (value: string) => {
    setVariant({ kind: 'garnishment', type: value as GarnishmentType })
  }

  return (
    <section className={className}>
      <Grid gap={32}>
        <Flex flexDirection="column" gap={2}>
          <Components.Heading as="h2">{title}</Components.Heading>
          <Components.Text variant="supporting">{t('description')}</Components.Text>
        </Flex>

        {!isEdit && (
          <>
            <Flex flexDirection="column" gap={20}>
              <Components.RadioGroup
                label={t('variantLabel')}
                description={t('variantDescription')}
                options={[
                  { value: 'garnishment', label: t('garnishmentOption') },
                  { value: 'custom', label: t('customOption') },
                ]}
                defaultValue={variant?.kind === 'custom' ? 'custom' : undefined}
                onChange={handleSelectDeductionType}
                isRequired
              />

              {variant?.kind === 'garnishment' && (
                <Components.Select
                  label={t('garnishmentTypeLabel')}
                  options={garnishmentTypeOptions}
                  value={variant.type}
                  onChange={handleSelectGarnishmentType}
                  isRequired
                />
              )}
            </Flex>

            {variant !== null && <hr />}
          </>
        )}

        {variant?.kind === 'custom' && (
          <StandardDeductionForm
            employeeId={employeeId}
            deduction={deduction ?? null}
            courtOrdered={false}
            title={t('types.custom')}
            onSaved={onSaved}
            onCancel={onCancel}
          />
        )}
        {variant?.kind === 'garnishment' && variant.type === 'child_support' && (
          <ChildSupportFormView
            employeeId={employeeId}
            deduction={deduction ?? null}
            onSaved={onSaved}
            onCancel={onCancel}
          />
        )}
        {variant?.kind === 'garnishment' && variant.type !== 'child_support' && (
          <StandardDeductionForm
            employeeId={employeeId}
            deduction={deduction ?? null}
            courtOrdered={true}
            garnishmentType={variant.type}
            title={garnishmentTypeLabel(t, variant.type)}
            onSaved={onSaved}
            onCancel={onCancel}
          />
        )}
      </Grid>
    </section>
  )
}

function garnishmentTypeLabel(
  t: ReturnType<typeof useTranslation<'Employee.DeductionsForm'>>['t'],
  value: GarnishmentType,
): string {
  switch (value) {
    case 'child_support':
      return t('types.childSupport')
    case 'federal_tax_lien':
      return t('types.federalTaxLien')
    case 'state_tax_lien':
      return t('types.stateTaxLien')
    case 'student_loan':
      return t('types.studentLoan')
    case 'creditor_garnishment':
      return t('types.creditorGarnishment')
    case 'federal_loan':
      return t('types.federalLoan')
    case 'other_garnishment':
      return t('types.otherGarnishment')
  }
}
