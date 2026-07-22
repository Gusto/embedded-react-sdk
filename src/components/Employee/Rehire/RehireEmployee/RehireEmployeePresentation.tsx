import { useTranslation } from 'react-i18next'
import z from 'zod'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Location } from '@gusto/embedded-api/models/components/location'
import type { RehireEmployeeFormData } from './RehireEmployee'
import {
  Flex,
  ActionsLayout,
  DatePickerField,
  SelectField,
  RadioGroupField,
} from '@/components/Common'
import { Form as HtmlForm } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

interface RehireEmployeePresentationProps {
  employeeName: string
  workLocations: Location[]
  onSubmit: (data: RehireEmployeeFormData) => void
  onCancel: () => void
  isLoading: boolean
}

const rehireEmployeeSchema = z.object({
  effectiveDate: z.date({ error: 'validation.startDateRequired' }),
  workLocationUuid: z
    .string({ error: 'validation.workAddressRequired' })
    .min(1, { error: 'validation.workAddressRequired' }),
  fileNewHireReport: z.enum(['yes', 'no'], { error: 'validation.fileNewHireReportRequired' }),
})

function locationLabel(location: Location): string {
  return [location.street1, location.city, location.state, location.zip].filter(Boolean).join(', ')
}

/** @internal */
export function RehireEmployeePresentation({
  employeeName,
  workLocations,
  onSubmit,
  onCancel,
  isLoading,
}: RehireEmployeePresentationProps) {
  const { Heading, Text, Button } = useComponentContext()
  useI18n('Employee.Management.Rehire')
  const { t } = useTranslation('Employee.Management.Rehire')

  const formMethods = useForm<RehireEmployeeFormData>({
    resolver: zodResolver(rehireEmployeeSchema),
    defaultValues: {
      effectiveDate: new Date(),
      workLocationUuid: workLocations[0]?.uuid ?? '',
      fileNewHireReport: 'yes',
    },
  })

  const workLocationOptions = workLocations.map(location => ({
    label: locationLabel(location),
    value: location.uuid,
  }))

  const fileNewHireReportOptions = [
    { label: t('form.fileNewHireReport.options.yes'), value: 'yes' as const },
    { label: t('form.fileNewHireReport.options.no'), value: 'no' as const },
  ]

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Heading as="h2">{t('title', { employeeName })}</Heading>
            <Text variant="supporting">{t('subtitle')}</Text>
          </Flex>

          <Flex flexDirection="column" gap={24}>
            <DatePickerField
              name="effectiveDate"
              label={t('form.startDate.label')}
              description={t('form.startDate.description')}
              isRequired
              errorMessage={t('validation.startDateRequired')}
            />

            <SelectField
              name="workLocationUuid"
              label={t('form.workAddress.label')}
              description={t('form.workAddress.description')}
              placeholder={t('form.workAddress.placeholder')}
              options={workLocationOptions}
              isRequired
              errorMessage={t('validation.workAddressRequired')}
            />

            <RadioGroupField<'yes' | 'no'>
              name="fileNewHireReport"
              label={t('form.fileNewHireReport.label')}
              description={t('form.fileNewHireReport.description')}
              options={fileNewHireReportOptions}
              isRequired
              errorMessage={t('validation.fileNewHireReportRequired')}
            />
          </Flex>

          <ActionsLayout>
            <Button variant="secondary" onClick={onCancel} isDisabled={isLoading}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isLoading ? t('actions.submitting') : t('actions.submit')}
            </Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}
