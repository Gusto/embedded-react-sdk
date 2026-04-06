import { useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { SelectPolicyType, SelectPolicyTypePresentationProps } from './SelectPolicyTypeTypes'
import { Flex, ActionsLayout, RadioGroupField } from '@/components/Common'
import { Form as HtmlForm } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

interface SelectPolicyTypeFormData {
  policyType: SelectPolicyType
}

export function SelectPolicyTypePresentation({
  onContinue,
  onCancel,
  defaultPolicyType,
}: SelectPolicyTypePresentationProps) {
  useI18n('Company.TimeOff.SelectPolicyType')
  const { t } = useTranslation('Company.TimeOff.SelectPolicyType')
  const { Heading, Text, Button } = useComponentContext()

  const formMethods = useForm<SelectPolicyTypeFormData>({
    defaultValues: {
      policyType: defaultPolicyType as SelectPolicyType,
    },
  })

  const policyTypeOptions = useMemo(
    () => [
      {
        value: 'holiday' as SelectPolicyType,
        label: t('holidayLabel'),
        description: t('holidayHint'),
      },
      {
        value: 'vacation' as SelectPolicyType,
        label: t('timeOffLabel'),
        description: t('timeOffHint'),
      },
      {
        value: 'sick' as SelectPolicyType,
        label: t('sickLeaveLabel'),
        description: t('sickLeaveHint'),
      },
    ],
    [t],
  )

  const handleSubmit = (data: SelectPolicyTypeFormData) => {
    onContinue(data.policyType)
  }

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Heading as="h2">{t('title')}</Heading>
            <Text variant="supporting">{t('policyTypeHint')}</Text>
          </Flex>

          <RadioGroupField<SelectPolicyType>
            name="policyType"
            label={t('policyTypeLabel')}
            options={policyTypeOptions}
            isRequired
          />

          <ActionsLayout>
            <Button variant="secondary" onClick={onCancel}>
              {t('cancelCta')}
            </Button>
            <Button variant="primary" type="submit">
              {t('continueCta')}
            </Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}
