import { useTranslation } from 'react-i18next'
import { SDKFormProvider } from '../../form/SDKFormProvider'
import { useHomeAddressForm } from './useHomeAddressForm'
import type { UseHomeAddressFormProps } from './useHomeAddressForm'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { Grid } from '@/components/Common/Grid/Grid'
import { ActionsLayout } from '@/components/Common'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

export interface HomeAddressFormProps
  extends UseHomeAddressFormProps, Omit<BaseComponentInterface, 'defaultValues'> {}

function HomeAddressFormRoot({ onEvent, dictionary, ...hookProps }: HomeAddressFormProps) {
  useI18n('UNSTABLE.HomeAddressForm')
  useComponentDictionary('UNSTABLE.HomeAddressForm', dictionary)
  const { t } = useTranslation('UNSTABLE.HomeAddressForm')
  const Components = useComponentContext()
  const homeAddress = useHomeAddressForm(hookProps)

  if (homeAddress.isLoading) {
    return <BaseLayout isLoading error={homeAddress.errorHandling.errors} />
  }

  const { Fields } = homeAddress.form

  const handleSubmit = async () => {
    const result = await homeAddress.actions.onSubmit()
    if (result) {
      onEvent(
        result.mode === 'create'
          ? componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED
          : componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED,
        result.data,
      )
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS, result.data)
    }
  }

  return (
    <BaseLayout error={homeAddress.errorHandling.errors}>
      <SDKFormProvider formHookResult={homeAddress}>
        <Form
          onSubmit={e => {
            e.preventDefault()
            void handleSubmit()
          }}
        >
          <Components.Heading as="h2">
            {homeAddress.status.mode === 'create' ? t('addTitle') : t('editTitle')}
          </Components.Heading>
          <Components.Text>{t('desc')}</Components.Text>

          <Grid
            gridTemplateColumns={{
              base: '1fr',
              small: ['1fr', '1fr'],
            }}
            gap={20}
          >
            <Fields.Street1
              label={t('street1Label')}
              validationMessages={{
                REQUIRED: t('fieldValidations.street1.REQUIRED'),
              }}
            />
            <Fields.Street2
              label={t('street2Label')}
              validationMessages={{
                REQUIRED: t('fieldValidations.street2.REQUIRED'),
              }}
            />
            <Fields.City
              label={t('cityLabel')}
              validationMessages={{
                REQUIRED: t('fieldValidations.city.REQUIRED'),
              }}
            />
            <Fields.State
              label={t('stateLabel')}
              validationMessages={{
                REQUIRED: t('fieldValidations.state.REQUIRED'),
              }}
            />
            <Fields.Zip
              label={t('zipLabel')}
              validationMessages={{
                REQUIRED: t('fieldValidations.zip.REQUIRED'),
                INVALID_ZIP: t('fieldValidations.zip.INVALID_ZIP'),
              }}
            />
          </Grid>

          <Fields.CourtesyWithholding
            label={t('courtesyWithholdingLabel')}
            description={t('courtesyWithholdingDescription')}
          />

          {Fields.EffectiveDate && (
            <Fields.EffectiveDate
              label={t('effectiveDateLabel')}
              description={t('effectiveDateDescription')}
              validationMessages={{
                REQUIRED: t('fieldValidations.effectiveDate.REQUIRED'),
              }}
            />
          )}

          <ActionsLayout>
            <Components.Button type="submit" isLoading={homeAddress.status.isPending}>
              {homeAddress.status.mode === 'create' ? t('createCta') : t('updateCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}

export function HomeAddressForm({ FallbackComponent, ...props }: HomeAddressFormProps) {
  return (
    <BaseBoundaries componentName="UNSTABLE.HomeAddressForm" FallbackComponent={FallbackComponent}>
      <HomeAddressFormRoot {...props} />
    </BaseBoundaries>
  )
}
