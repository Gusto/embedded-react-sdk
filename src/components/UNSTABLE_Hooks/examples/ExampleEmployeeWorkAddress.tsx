import { useTranslation } from 'react-i18next'
import { Form } from '../Form'
import { useWorkAddressForm, WorkAddressFormProvider } from '../hooks/useWorkAddress'
import { ActionsLayout, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { useI18n } from '@/i18n'
import { addressInline } from '@/helpers/formattedStrings'

const I18N_NS = 'UNSTABLE_WorkAddress' as const

const exampleWorkAddressEvents = {
  WORK_ADDRESS_CREATED: 'work_address_created',
  WORK_ADDRESS_UPDATED: 'work_address_updated',
} as const

type ExampleWorkAddressEvent =
  (typeof exampleWorkAddressEvents)[keyof typeof exampleWorkAddressEvents]

interface ExampleEmployeeWorkAddressProps {
  employeeId: string
  companyId: string
  onEvent?: (event: ExampleWorkAddressEvent, data?: unknown) => void
}

export function ExampleEmployeeWorkAddress({
  employeeId,
  companyId,
  onEvent,
}: ExampleEmployeeWorkAddressProps) {
  return (
    <BaseBoundaries>
      <ExampleEmployeeWorkAddressRoot
        employeeId={employeeId}
        companyId={companyId}
        onEvent={onEvent}
      />
    </BaseBoundaries>
  )
}

function ExampleEmployeeWorkAddressRoot({
  employeeId,
  companyId,
  onEvent,
}: ExampleEmployeeWorkAddressProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const workAddressForm = useWorkAddressForm({ employeeId, companyId })
  const Components = useComponentContext()

  if (workAddressForm.isLoading) {
    return <BaseLayout isLoading />
  }

  const { Fields, companyLocations, onSubmit, isPending, errors } = workAddressForm

  const locationOptions = companyLocations.map(location => ({
    label: addressInline(location),
    value: location.uuid,
  }))

  const handleSubmit = async () => {
    const result = await onSubmit()
    if (result) {
      const event =
        result.mode === 'create'
          ? exampleWorkAddressEvents.WORK_ADDRESS_CREATED
          : exampleWorkAddressEvents.WORK_ADDRESS_UPDATED
      onEvent?.(event, result.data)
    }
  }

  return (
    <BaseLayout error={errors.error} fieldErrors={errors.fieldErrors}>
      <WorkAddressFormProvider form={workAddressForm}>
        <Form onSubmit={handleSubmit}>
          <Components.Heading as="h2">{t('formTitle')}</Components.Heading>
          <Components.Text>{t('description')}</Components.Text>
          <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
            <Fields.Location
              label={t('location')}
              placeholder={t('locationPlaceholder')}
              options={locationOptions}
              validationMessages={{
                REQUIRED: t('fieldValidations.location.REQUIRED'),
              }}
            />
            <Fields.EffectiveDate
              label={t('effectiveDate')}
              description={t('effectiveDateDescription')}
              validationMessages={{
                REQUIRED: t('fieldValidations.effectiveDate.REQUIRED'),
              }}
            />
          </Grid>
          <ActionsLayout>
            <Components.Button type="submit" isLoading={isPending}>
              {t('submit')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </WorkAddressFormProvider>
    </BaseLayout>
  )
}
