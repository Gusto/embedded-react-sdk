import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import type {
  Garnishment,
  GarnishmentType,
} from '@gusto/embedded-api/models/components/garnishment'
import { StandardDeductionForm } from './StandardDeductionForm'
import { ChildSupportFormView } from './ChildSupportFormView'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Grid } from '@/components/Common/Grid/Grid'
import { Flex } from '@/components/Common/Flex/Flex'
import { useI18n } from '@/i18n'

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
  onSaved: (deduction: Garnishment, mode: 'create' | 'update') => void
  onCancel: () => void
}

export function DeductionsForm({
  className,
  employeeId,
  deduction,
  onSaved,
  onCancel,
}: DeductionsFormProps) {
  useI18n('Employee.Deductions')
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  const isEdit = !!deduction
  const title = isEdit ? t('editDeductionTitle') : t('addDeductionTitle')

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
          <Components.Text variant="supporting">
            {t('externalPostTaxDeductionsDescription')}
          </Components.Text>
        </Flex>

        {!isEdit && (
          <>
            <Flex flexDirection="column" gap={20}>
              <Components.RadioGroup
                label={t('deductionTypeLabel')}
                description={t('deductionTypeRadioLabel')}
                options={[
                  { value: 'garnishment', label: t('garnishmentOption') },
                  { value: 'custom', label: t('customDeductionOption') },
                ]}
                defaultValue={variant?.kind === 'custom' ? 'custom' : undefined}
                onChange={handleSelectDeductionType}
                isRequired
              />

              {variant?.kind === 'garnishment' && (
                <Components.Select
                  label={t('garnishmentType')}
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
            onSaved={onSaved}
            onCancel={onCancel}
          />
        )}
      </Grid>
    </section>
  )
}

function garnishmentTypeLabel(
  t: ReturnType<typeof useTranslation<'Employee.Deductions'>>['t'],
  value: GarnishmentType,
): string {
  switch (value) {
    case 'child_support':
      return t('childSupportTitle')
    case 'federal_tax_lien':
      return t('federalTaxLien')
    case 'state_tax_lien':
      return t('stateTaxLien')
    case 'student_loan':
      return t('studentLoan')
    case 'creditor_garnishment':
      return t('creditorGarnishment')
    case 'federal_loan':
      return t('federalLoan')
    case 'other_garnishment':
      return t('otherGarnishment')
  }
}
