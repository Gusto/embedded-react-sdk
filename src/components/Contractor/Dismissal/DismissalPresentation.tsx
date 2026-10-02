import { useTranslation } from 'react-i18next'
import z from 'zod'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { getContractorDisplayName } from '../shared/helpers'
import { Flex, ActionsLayout, DatePickerField } from '@/components/Common'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { normalizeToDate, addDays } from '@/helpers/dateFormatting'

interface DismissalPresentationProps {
  contractor: Contractor
  isPending: boolean
  onSubmit: (data: DismissalFormData) => void
  onCancel: () => void
  /** CSS class name applied to the root element. */
  className?: string
}

/** @internal */
export interface DismissalFormData {
  /** The effective date of the dismissal — the contractor's last day. */
  endDate: Date
}

const dismissalSchema = z.object({
  endDate: z.date({ error: 'validation.endDateRequired' }),
})

/** @internal */
export function DismissalPresentation({
  contractor,
  isPending,
  onSubmit,
  onCancel,
  className,
}: DismissalPresentationProps) {
  const { Alert, Heading, Text, Button } = useComponentContext()
  useI18n('Contractor.Dismissal')
  const { t } = useTranslation('Contractor.Dismissal')

  const formMethods = useForm<DismissalFormData>({
    resolver: zodResolver(dismissalSchema),
    defaultValues: {},
  })

  const name = getContractorDisplayName(contractor)
  const minDate = contractor.startDate
    ? addDays(normalizeToDate(contractor.startDate)!, 1)
    : undefined

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex className={className} flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Heading as="h2">{t('title', { name })}</Heading>
            <Text variant="supporting">{t('subtitle')}</Text>
          </Flex>

          <Flex flexDirection="column" gap={24}>
            <DatePickerField
              name="endDate"
              label={t('form.endDate.label')}
              isRequired
              minDate={minDate}
              errorMessage={t('validation.endDateRequired')}
            />
            <Alert status="info" label={t('alert.label')}>
              <Text>{t('alert.text')}</Text>
            </Alert>
          </Flex>

          <ActionsLayout>
            <Button variant="secondary" onClick={onCancel} isDisabled={isPending}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending}>
              {t('actions.submit')}
            </Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}
