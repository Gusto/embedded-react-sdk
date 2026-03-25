import { useTranslation } from 'react-i18next'
import { SDKFormProvider } from '../../form/SDKFormProvider'
import { useWorkAddressForm } from './useWorkAddressForm'
import type { UseWorkAddressFormProps } from './useWorkAddressForm'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { addressInline } from '@/helpers/formattedStrings'

export interface WorkAddressFormProps
  extends UseWorkAddressFormProps, Omit<BaseComponentInterface, 'defaultValues'> {}

function WorkAddressFormRoot({ onEvent, dictionary, ...hookProps }: WorkAddressFormProps) {
  useI18n('UNSTABLE.WorkAddressForm')
  useComponentDictionary('UNSTABLE.WorkAddressForm', dictionary)
  const { t } = useTranslation('UNSTABLE.WorkAddressForm')
  const Components = useComponentContext()
  const workAddress = useWorkAddressForm(hookProps)

  if (workAddress.isLoading) {
    return <BaseLayout isLoading error={workAddress.errorHandling.errors} />
  }

  const { Fields } = workAddress.form

  const handleSubmit = async () => {
    const result = await workAddress.actions.onSubmit({
      onWorkAddressCreated: wa => {
        onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED, wa)
      },
      onWorkAddressUpdated: wa => {
        onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_UPDATED, wa)
      },
    })
    if (result) {
      onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS, result.data)
    }
  }

  return (
    <BaseLayout error={workAddress.errorHandling.errors}>
      <SDKFormProvider formHookResult={workAddress}>
        <Form
          onSubmit={e => {
            e.preventDefault()
            void handleSubmit()
          }}
        >
          <Components.Heading as="h2">
            {workAddress.status.mode === 'create' ? t('addTitle') : t('editTitle')}
          </Components.Heading>

          <Fields.Location
            label={t('locationLabel')}
            description={t('locationDescription')}
            getOptionLabel={location => addressInline(location)}
            validationMessages={{
              REQUIRED: t('fieldValidations.locationUuid.REQUIRED'),
            }}
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
            <Components.Button type="submit" isLoading={workAddress.status.isPending}>
              {workAddress.status.mode === 'create' ? t('createCta') : t('updateCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}

export function WorkAddressForm({ FallbackComponent, ...props }: WorkAddressFormProps) {
  return (
    <BaseBoundaries componentName="UNSTABLE.WorkAddressForm" FallbackComponent={FallbackComponent}>
      <WorkAddressFormRoot {...props} />
    </BaseBoundaries>
  )
}
