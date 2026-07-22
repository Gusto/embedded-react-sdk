import { useEffect, useMemo, useRef } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import type { TaxRequirementSet } from '@gusto/embedded-api/models/components/taxrequirementset'
import { Flex, SelectField } from '@/components/Common'
import { QuestionInput } from '@/components/Common/TaxInputs/TaxInputs'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ThemeContext } from '@/contexts/ThemeProvider/useTheme'
import { useDateFormatter } from '@/hooks/useDateFormatter'

export interface TaxRateSubmission {
  effectiveFrom: string
  values: Record<string, string | number | boolean>
}

interface AddTaxRateDialogProps {
  isOpen: boolean
  state: string
  availableEffectiveDates: string[]
  requirementTemplate: TaxRequirementSet | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (submission: TaxRateSubmission) => void | Promise<void>
}

const PIPE_PLACEHOLDER = '__PIPE__'
const toRhfKey = (key: string): string => key.replaceAll('|', PIPE_PLACEHOLDER)
const fromRhfKey = (key: string): string => key.replaceAll(PIPE_PLACEHOLDER, '|')

interface FormShape {
  effectiveFrom: string
  fields: Record<string, string | number | boolean | undefined>
}

function isRequirementApplicable(
  requirement: TaxRequirement,
  values: Record<string, string | number | boolean | undefined>,
): boolean {
  const constraints = requirement.applicableIf
  if (!constraints || constraints.length === 0) return true
  return constraints.every(({ key, value }) => {
    if (!key) return true
    return values[toRhfKey(key)] === value
  })
}

function DynamicFields({ requirements }: { requirements: TaxRequirement[] }) {
  const { control } = useFormContext<FormShape>()
  const watched = useWatch({ control, name: 'fields' })

  return (
    <>
      {requirements.flatMap(req => {
        if (!req.key || req.editable === false) return []
        if (!isRequirementApplicable(req, watched)) return []
        return [
          <QuestionInput
            key={req.key}
            requirement={{ ...req, key: `fields.${toRhfKey(req.key)}` }}
            questionType={req.metadata?.type ?? 'text'}
          />,
        ]
      })}
    </>
  )
}

export function AddTaxRateDialog({
  isOpen,
  state,
  availableEffectiveDates,
  requirementTemplate,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddTaxRateDialogProps) {
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()
  const dialogContainerRef = useRef<HTMLElement | null>(null)

  const editableRequirements = useMemo(
    () => (requirementTemplate?.requirements ?? []).filter(r => r.editable !== false && r.key),
    [requirementTemplate],
  )

  const defaultValues = useMemo<FormShape>(
    () => ({
      effectiveFrom: availableEffectiveDates[0] ?? '',
      fields: {},
    }),
    [availableEffectiveDates],
  )

  const methods = useForm<FormShape>({ defaultValues })

  useEffect(() => {
    if (isOpen) methods.reset(defaultValues)
  }, [isOpen, defaultValues, methods])

  const handleSubmit = methods.handleSubmit(async data => {
    const values: Record<string, string | number | boolean> = {}
    Object.entries(data.fields).forEach(([rhfKey, raw]) => {
      if (raw === undefined || raw === '') return
      values[fromRhfKey(rhfKey)] = raw
    })
    await onSubmit({ effectiveFrom: data.effectiveFrom, values })
  })

  return (
    <Components.Dialog
      isOpen={isOpen}
      onClose={onClose}
      onPrimaryActionClick={() => {
        void handleSubmit()
      }}
      isPrimaryActionLoading={isSubmitting}
      primaryActionLabel="Save tax rate"
      closeActionLabel="Cancel"
      title={`Add tax rate for ${state}`}
    >
      <ThemeContext.Provider value={{ container: dialogContainerRef }}>
        <div
          ref={el => {
            dialogContainerRef.current = el
          }}
        >
          <FormProvider {...methods}>
            <Flex flexDirection="column" gap={20} alignItems="stretch">
              <Components.Text size="sm">
                Schedule a new tax configuration to take effect on a future date.
              </Components.Text>

              <SelectField
                name="effectiveFrom"
                label="Effective date"
                placeholder="Select an effective date"
                isRequired
                isDisabled={availableEffectiveDates.length === 0}
                options={availableEffectiveDates.map(date => ({
                  value: date,
                  label: dateFormatter.formatLongWithYear(date),
                }))}
              />

              {editableRequirements.length > 0 ? (
                <DynamicFields requirements={editableRequirements} />
              ) : (
                <Components.Alert status="info" label="No editable fields">
                  This state does not expose editable effective-dated tax requirements.
                </Components.Alert>
              )}
            </Flex>
          </FormProvider>
        </div>
      </ThemeContext.Provider>
    </Components.Dialog>
  )
}
