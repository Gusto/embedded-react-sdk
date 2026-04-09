import { useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { PolicyType, PolicyTypeSelectorPresentationProps } from './PolicyTypeSelectorTypes'
import { Flex, ActionsLayout, RadioGroupField } from '@/components/Common'
import { Form as HtmlForm } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

interface PolicyTypeSelectorFormData {
  policyType: PolicyType
}

export function PolicyTypeSelectorPresentation({
  onContinue,
  onCancel,
  defaultPolicyType,
}: PolicyTypeSelectorPresentationProps) {
  useI18n('Company.TimeOff.SelectPolicyType')
  const { t } = useTranslation('Company.TimeOff.SelectPolicyType')
  const { Heading, Text, Button } = useComponentContext()

  const formMethods = useForm<PolicyTypeSelectorFormData>({
    defaultValues: {
      policyType: defaultPolicyType as PolicyType,
    },
  })

  const policyTypeOptions = useMemo(
    () => [
      {
        value: 'holiday' as PolicyType,
        label: t('holidayLabel'),
        description: t('holidayHint'),
      },
      {
        value: 'vacation' as PolicyType,
        label: t('timeOffLabel'),
        description: t('timeOffHint'),
      },
      {
        value: 'sick' as PolicyType,
        label: t('sickLeaveLabel'),
        description: t('sickLeaveHint'),
      },
    ],
    [t],
  )

  const handleSubmit = (data: PolicyTypeSelectorFormData) => {
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

          <RadioGroupField<PolicyType>
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
