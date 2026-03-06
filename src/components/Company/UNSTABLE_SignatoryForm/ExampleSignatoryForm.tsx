import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignatoryForm } from './useSignatoryForm'
import type { SignatoryFormData } from './schema'
import { Form } from '@/components/Common/Form'
import {
  TextInputField,
  DatePickerField,
  Grid,
  Flex,
  SelectField,
  ActionsLayout,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { companyEvents } from '@/shared/constants'
import { useI18n } from '@/i18n'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { commonMasks, useMaskedTransform } from '@/helpers/mask'

const I18N_NS = 'Company.UNSTABLE_SignatoryForm' as const

interface ExampleSignatoryFormProps extends CommonComponentInterface {
  companyId: string
  signatoryId?: string
}

export function ExampleSignatoryForm(props: ExampleSignatoryFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ companyId, signatoryId }: ExampleSignatoryFormProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const { t: tCommon } = useTranslation('common')
  const transformPhone = useMaskedTransform(commonMasks.phoneMask)
  const { schema, fields, defaultValues, onSubmit, isPending } = useSignatoryForm({
    companyId,
    signatoryId,
  })

  const placeholderSSN = usePlaceholderSSN(fields.ssn.hasRedactedValue)

  const Components = useComponentContext()
  const { onEvent } = useBase()

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      phone: transformPhone(defaultValues.phone),
    },
  })

  const { errors } = formMethods.formState

  const v: Record<string, string> = {
    REQUIRED: t('validations.REQUIRED'),
    INVALID_NAME_FORMAT: t('validations.INVALID_NAME_FORMAT'),
    INVALID_EMAIL_FORMAT: t('validations.INVALID_EMAIL_FORMAT'),
    INVALID_SSN_FORMAT: t('validations.INVALID_SSN_FORMAT'),
    INVALID_DATE_FORMAT: t('validations.INVALID_DATE_FORMAT'),
  }

  const handleSubmit = async (data: SignatoryFormData) => {
    const result = await onSubmit(data)

    if (result.mode === 'create') {
      onEvent(companyEvents.COMPANY_SIGNATORY_CREATED, result.data)
    } else {
      onEvent(companyEvents.COMPANY_SIGNATORY_UPDATED, result.data)
    }

    onEvent(companyEvents.COMPANY_CREATE_SIGNATORY_DONE)
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
                errorMessage={errors.firstName?.message && v[errors.firstName.message]}
              />
              <TextInputField
                name="lastName"
                label={t('signatoryDetails.lastName')}
                isRequired={fields.lastName.isRequired}
                errorMessage={errors.lastName?.message && v[errors.lastName.message]}
              />
              <TextInputField
                name="email"
                label={t('signatoryDetails.email')}
                isRequired={fields.email.isRequired}
                errorMessage={errors.email?.message && v[errors.email.message]}
              />
              <SelectField
                name="title"
                label={t('signatoryDetails.titleSelect.label')}
                isRequired={fields.title.isRequired}
                options={fields.title.options.map(value => ({
                  value,
                  label: tCommon(`signatoryTitles.${value}`),
                }))}
                errorMessage={errors.title?.message && v[errors.title.message]}
              />
              <TextInputField
                name="phone"
                label={t('signatoryDetails.phone')}
                isRequired={fields.phone.isRequired}
                transform={transformPhone}
                errorMessage={errors.phone?.message && v[errors.phone.message]}
              />
              <TextInputField
                name="ssn"
                label={t('signatoryDetails.ssn')}
                isRequired={fields.ssn.isRequired}
                transform={normalizeSSN}
                placeholder={placeholderSSN}
                errorMessage={errors.ssn?.message && v[errors.ssn.message]}
              />
              <DatePickerField
                name="birthday"
                label={t('signatoryDetails.birthday')}
                isRequired={fields.birthday.isRequired}
                errorMessage={errors.birthday?.message && v[errors.birthday.message]}
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
                errorMessage={errors.street1?.message && v[errors.street1.message]}
              />
              <TextInputField name="street2" label={t('address.street2')} />
              <TextInputField
                name="city"
                label={t('address.city')}
                isRequired={fields.city.isRequired}
                errorMessage={errors.city?.message && v[errors.city.message]}
              />
              <SelectField
                name="state"
                label={t('address.state')}
                placeholder={t('address.statePlaceholder')}
                isRequired={fields.state.isRequired}
                options={fields.state.options.map(value => ({
                  value,
                  label: value,
                }))}
                errorMessage={errors.state?.message && v[errors.state.message]}
              />
              <TextInputField
                name="zip"
                label={t('address.zip')}
                isRequired={fields.zip.isRequired}
                errorMessage={errors.zip?.message && v[errors.zip.message]}
              />
            </Grid>
          </Flex>

          <ActionsLayout>
            <Components.Button type="submit" isLoading={isPending}>
              {t('buttons.save')}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
