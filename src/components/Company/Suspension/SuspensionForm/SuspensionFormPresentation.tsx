import { useEffect, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  Reason,
  LeavingFor,
  ReconcileTaxMethod,
} from '@gusto/embedded-api/models/operations/postcompaniescompanyuuidsuspensions'
import { LEAVING_FOR_GROUPS, REASON_ORDER } from './SuspensionFormSchema'
import type { SuspensionFormData, SuspensionFormPresentationProps } from './SuspensionFormTypes'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  Flex,
  SelectField,
  ComboBoxField,
  RadioGroupField,
  CheckboxField,
} from '@/components/Common'
import { TextAreaField } from '@/components/Common/Fields/TextAreaField'

/** @internal */
export function SuspensionFormPresentation({ isPending }: SuspensionFormPresentationProps) {
  useI18n('Company.Suspension.Form')
  const { t } = useTranslation('Company.Suspension.Form')
  const { Heading, Text, Button, Alert } = useComponentContext()
  const { control, setValue } = useFormContext<SuspensionFormData>()

  const reason = useWatch<SuspensionFormData>({ control, name: 'reason' }) as Reason | undefined
  const leavingFor = useWatch<SuspensionFormData>({ control, name: 'leavingFor' }) as
    LeavingFor | undefined
  const reconcileTaxMethod = useWatch<SuspensionFormData>({
    control,
    name: 'reconcileTaxMethod',
  }) as ReconcileTaxMethod | undefined

  const isSwitchingProvider = reason === Reason.SwitchingProvider
  const isPayTaxes = reconcileTaxMethod === ReconcileTaxMethod.PayTaxes
  const isRefundTaxes = reconcileTaxMethod === ReconcileTaxMethod.RefundTaxes

  // Clear leavingFor when the reason no longer calls for it so it isn't submitted (matches gws-flows).
  useEffect(() => {
    if (!isSwitchingProvider) {
      setValue('leavingFor', undefined)
    }
  }, [isSwitchingProvider, setValue])

  // Clear the file-forms checkboxes when refunding taxes so a hidden value isn't submitted.
  useEffect(() => {
    if (isRefundTaxes) {
      setValue('fileQuarterlyForms', false)
      setValue('fileYearlyForms', false)
    }
  }, [isRefundTaxes, setValue])

  const reasonOptions = useMemo(
    () => REASON_ORDER.map(value => ({ value, label: t(`reason.${value}`) })),
    [t],
  )

  const leavingForOptions = useMemo(
    () =>
      LEAVING_FOR_GROUPS.flatMap(group =>
        group.values.map(value => ({ value, label: t(`leavingFor.${value}`) })),
      ),
    [t],
  )

  const reconcileTaxMethodOptions = useMemo(
    () => [
      { value: ReconcileTaxMethod.PayTaxes, label: t('reconcileTaxMethod.payTaxes') },
      { value: ReconcileTaxMethod.RefundTaxes, label: t('reconcileTaxMethod.refundTaxes') },
    ],
    [t],
  )

  const isCommentsRequired = isSwitchingProvider && leavingFor === LeavingFor.Other
  const commentsLabel = isCommentsRequired
    ? t('comments.labelLeavingForOther')
    : t('comments.label')

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('title')}</Heading>
        <Text variant="supporting">{t('helpUsImprove')}</Text>
      </Flex>

      <Flex flexDirection="column" gap={20}>
        <SelectField<Reason>
          name="reason"
          label={t('reason.label')}
          placeholder={t('reason.placeholder')}
          options={reasonOptions}
          isRequired
        />

        {isSwitchingProvider && (
          <ComboBoxField<LeavingFor>
            name="leavingFor"
            label={t('leavingFor.label')}
            options={leavingForOptions}
            isRequired
          />
        )}

        {reason === Reason.ChangingEinOrEntityType && (
          <Alert status="warning" label={t('einChangeWarning')} />
        )}

        {isSwitchingProvider && leavingFor === LeavingFor.GustoCom && (
          <Alert status="warning" label={t('leavingForGustoWarning')} />
        )}

        <TextAreaField name="comments" label={commentsLabel} isRequired={isCommentsRequired} />
      </Flex>

      <Flex flexDirection="column" gap={20}>
        <Heading as="h3">{t('howToHandleTaxes')}</Heading>
        <RadioGroupField<ReconcileTaxMethod>
          name="reconcileTaxMethod"
          label={t('reconcileTaxMethod.label')}
          options={reconcileTaxMethodOptions}
          isRequired
        />

        {isPayTaxes && (
          <Flex flexDirection="column" gap={12}>
            <Heading as="h4">{t('whatTaxesToFile')}</Heading>
            <CheckboxField name="fileQuarterlyForms" label={t('fileQuarterlyForms')} />
            <CheckboxField name="fileYearlyForms" label={t('fileYearlyForms')} />
            <Text variant="supporting">{t('responsibleForFilingsWarning')}</Text>
          </Flex>
        )}

        {isRefundTaxes && <Alert status="warning" label={t('refundTaxesWarning')} />}
      </Flex>

      <Flex justifyContent="flex-end" gap={12}>
        <Button type="submit" isLoading={isPending} isDisabled={isPending}>
          {t('submitCta')}
        </Button>
      </Flex>
    </Flex>
  )
}
