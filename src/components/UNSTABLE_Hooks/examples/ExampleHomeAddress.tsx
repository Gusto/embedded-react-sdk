import { useTranslation } from 'react-i18next'
import { Form } from '../Form'
import { useHomeAddressForm, HomeAddressFormProvider } from '../hooks/useHomeAddress'
import { ActionsLayout, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { useI18n } from '@/i18n'

const I18N_NS = 'UNSTABLE_HomeAddress' as const

const exampleHomeAddressEvents = {
  HOME_ADDRESS_CREATED: 'home_address_created',
  HOME_ADDRESS_UPDATED: 'home_address_updated',
} as const

type ExampleHomeAddressEvent =
  (typeof exampleHomeAddressEvents)[keyof typeof exampleHomeAddressEvents]

interface ExampleHomeAddressProps {
  employeeId: string
  onEvent?: (event: ExampleHomeAddressEvent, data?: unknown) => void
}

export function ExampleHomeAddress({ employeeId, onEvent }: ExampleHomeAddressProps) {
  return (
    <BaseBoundaries>
      <ExampleHomeAddressRoot employeeId={employeeId} onEvent={onEvent} />
    </BaseBoundaries>
  )
}

function ExampleHomeAddressRoot({ employeeId, onEvent }: ExampleHomeAddressProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const { t: tCommon } = useTranslation('common')
  const homeAddressForm = useHomeAddressForm({ employeeId })
  const Components = useComponentContext()

  if (homeAddressForm.isLoading) {
    return <BaseLayout isLoading />
  }

  const { Fields, onSubmit, isPending, errors } = homeAddressForm

  const handleSubmit = async () => {
    const result = await onSubmit()
    if (result) {
      const event =
        result.mode === 'create'
          ? exampleHomeAddressEvents.HOME_ADDRESS_CREATED
          : exampleHomeAddressEvents.HOME_ADDRESS_UPDATED
      onEvent?.(event, result.data)
    }
  }

  return (
    <BaseLayout error={errors.error} fieldErrors={errors.fieldErrors}>
      <HomeAddressFormProvider form={homeAddressForm}>
        <Form onSubmit={handleSubmit}>
          <Components.Heading as="h2">{t('formTitle')}</Components.Heading>
          <Components.Text>{t('description')}</Components.Text>
          <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
            <Fields.Street1
              label={t('street1')}
              validationMessages={{
                REQUIRED: t('fieldValidations.street1.REQUIRED'),
              }}
            />
            <Fields.Street2 label={t('street2')} />
            <Fields.City
              label={t('city')}
              validationMessages={{
                REQUIRED: t('fieldValidations.city.REQUIRED'),
              }}
            />
            <Fields.State
              label={t('state')}
              placeholder={t('statePlaceholder')}
              validationMessages={{
                REQUIRED: t('fieldValidations.state.REQUIRED'),
              }}
              getOptionLabel={value => tCommon(`statesHash.${value}`)}
            />
            <Fields.Zip
              label={t('zip')}
              validationMessages={{
                REQUIRED: t('fieldValidations.zip.REQUIRED'),
                INVALID_ZIP_FORMAT: t('fieldValidations.zip.INVALID_ZIP_FORMAT'),
              }}
            />
          </Grid>
          <Fields.CourtesyWithholding
            label={t('courtesyWithholdingLabel')}
            description={t('courtesyWithholdingDescription')}
          />
          <ActionsLayout>
            <Components.Button type="submit" isLoading={isPending}>
              {t('submit')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </HomeAddressFormProvider>
    </BaseLayout>
  )
}
