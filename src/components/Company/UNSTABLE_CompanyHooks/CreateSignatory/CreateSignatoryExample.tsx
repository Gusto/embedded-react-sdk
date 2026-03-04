import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateSignatoryForm } from './useCreateSignatoryForm'
import type { CreateSignatoryFormData } from './schema'
import { SubmitOperation } from '@/hooks/UNSTABLE/types'
import {
  Flex,
  Grid,
  TextInputField,
  SelectField,
  DatePickerField,
  ActionsLayout,
} from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { commonMasks, useMaskedTransform } from '@/helpers/mask'
import { companyEvents } from '@/shared/constants'
import { useBase, BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useI18n } from '@/i18n'

interface CreateSignatoryExampleProps {
  companyId: string
  signatoryId?: string
}

export function CreateSignatoryExample(
  props: CreateSignatoryExampleProps & BaseComponentInterface,
) {
  return (
    <BaseComponent {...props}>
      <CreateSignatoryExampleRoot {...props} />
    </BaseComponent>
  )
}

function CreateSignatoryExampleRoot({ companyId, signatoryId }: CreateSignatoryExampleProps) {
  useI18n('Company.AssignSignatory')
  const { t } = useTranslation('Company.AssignSignatory')

  const { schema, fields, defaultValues, onSubmit, isPending } = useCreateSignatoryForm({
    companyId,
    signatoryId,
  })

  const { onEvent, baseSubmitHandler } = useBase()

  const formMethods = useForm<CreateSignatoryFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  const { errors } = formMethods.formState

  const transformPhone = useMaskedTransform(commonMasks.phoneMask)
  const placeholderSSN = usePlaceholderSSN(fields.ssn.hasRedactedValue)
  const Components = useComponentContext()

  const handleSubmit = async (formData: CreateSignatoryFormData) => {
    await baseSubmitHandler(formData, async payload => {
      const result = await onSubmit(payload)
      switch (result.operation) {
        case SubmitOperation.Created:
          onEvent(companyEvents.COMPANY_SIGNATORY_CREATED, result.data)
          break
        case SubmitOperation.Updated:
          onEvent(companyEvents.COMPANY_SIGNATORY_UPDATED, result.data)
          break
      }
      onEvent(companyEvents.COMPANY_CREATE_SIGNATORY_DONE)
    })
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Flex flexDirection="column" gap={32}>
          <Flex flexDirection="column" gap={12}>
            <header>
              <Components.Heading as="h2">{t('signatoryDetails.title')}</Components.Heading>
              <Components.Text>{t('signatoryDetails.description')}</Components.Text>
            </header>

            <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
              <TextInputField
                name="firstName"
                label={t('signatoryDetails.firstName')}
                isRequired={fields.firstName.isRequired}
                errorMessage={fields.firstName.resolveError(errors.firstName?.message, {
                  required: t('validations.firstName'),
                  nameInvalidCharacters: t('validations.firstName'),
                })}
              />
              <TextInputField
                name="lastName"
                label={t('signatoryDetails.lastName')}
                isRequired={fields.lastName.isRequired}
                errorMessage={fields.lastName.resolveError(errors.lastName?.message, {
                  required: t('validations.lastName'),
                  nameInvalidCharacters: t('validations.lastName'),
                })}
              />
              <TextInputField
                name="email"
                label={t('signatoryDetails.email')}
                isRequired={fields.email.isRequired}
                isDisabled={fields.email.isReadOnly}
                errorMessage={fields.email.resolveError(errors.email?.message, {
                  required: t('validations.email'),
                  emailInvalidFormat: t('validations.email'),
                })}
              />
              <SelectField
                name="title"
                label={t('signatoryDetails.titleSelect.label')}
                isRequired={fields.title.isRequired}
                options={fields.title.options}
                errorMessage={fields.title.resolveError(errors.title?.message, {
                  required: t('validations.title'),
                })}
              />
              <TextInputField
                name="phone"
                label={t('signatoryDetails.phone')}
                isRequired={fields.phone.isRequired}
                errorMessage={fields.phone.resolveError(errors.phone?.message, {
                  phoneInvalidFormat: t('validations.phone'),
                })}
                transform={transformPhone}
              />
              <TextInputField
                name="ssn"
                label={t('signatoryDetails.ssn')}
                isRequired={fields.ssn.isRequired}
                errorMessage={fields.ssn.resolveError(errors.ssn?.message, {
                  required: t('validations.ssn', { ns: 'common' }),
                  ssnInvalidFormat: t('validations.ssn', { ns: 'common' }),
                })}
                transform={normalizeSSN}
                placeholder={placeholderSSN}
              />
              <DatePickerField
                name="birthday"
                label={t('signatoryDetails.birthday')}
                isRequired={fields.birthday.isRequired}
                errorMessage={fields.birthday.resolveError(errors.birthday?.message, {
                  required: t('validations.dob'),
                })}
              />
            </Grid>
          </Flex>

          <Flex flexDirection="column" gap={12}>
            <header>
              <Components.Heading as="h2">{t('address.title')}</Components.Heading>
              <Components.Text>{t('address.description')}</Components.Text>
            </header>

            <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
              <TextInputField
                name="street1"
                label={t('address.street1')}
                isRequired={fields.street1.isRequired}
                errorMessage={fields.street1.resolveError(errors.street1?.message, {
                  required: t('validations.address.street1'),
                })}
              />
              <TextInputField
                name="street2"
                label={t('address.street2')}
                isRequired={fields.street2.isRequired}
              />
              <TextInputField
                name="city"
                label={t('address.city')}
                isRequired={fields.city.isRequired}
                errorMessage={fields.city.resolveError(errors.city?.message, {
                  required: t('validations.address.city'),
                })}
              />
              <SelectField
                name="state"
                label={t('address.state')}
                isRequired={fields.state.isRequired}
                options={fields.state.options}
                placeholder={t('address.statePlaceholder')}
                errorMessage={fields.state.resolveError(errors.state?.message, {
                  required: t('validations.address.state'),
                })}
              />
              <TextInputField
                name="zip"
                label={t('address.zip')}
                isRequired={fields.zip.isRequired}
                errorMessage={fields.zip.resolveError(errors.zip?.message, {
                  zipInvalidFormat: t('validations.address.zip'),
                })}
              />
            </Grid>
          </Flex>

          <ActionsLayout>
            <Components.Button type="submit" isLoading={isPending}>
              {t('buttons.signDocuments')}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
