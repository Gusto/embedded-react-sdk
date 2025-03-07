import * as v from 'valibot'
import { FormProvider, useForm, type UseFormProps } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Form } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { Flex, Grid, TextField } from '@/components/Common'
import { phoneValidation, zipValidation } from '@/helpers/validations'

export const LocationFormSchema = v.object({
  phone_number: phoneValidation,
  street_1: v.pipe(v.string(), v.nonEmpty()),
  street_2: v.optional(v.string()),
  city: v.pipe(v.string(), v.nonEmpty()),
  state: v.pipe(v.string(), v.nonEmpty()),
  zip: zipValidation,
})

export const locationFormDefaultValues = {}

export type LocationFormInputs = v.InferInput<typeof LocationFormSchema>

interface LocationFormProps {
  onSubmit?: (data: LocationFormInputs) => void | Promise<void>
  formProps?: Partial<UseFormProps<LocationFormInputs>>
}

export function LocationForm({ onSubmit = () => {}, formProps }: LocationFormProps) {
  const { t } = useTranslation('Company.Locations')
  const { control, ...methods } = useForm<LocationFormInputs>({
    resolver: valibotResolver(LocationFormSchema),
    defaultValues: locationFormDefaultValues,
    ...formProps,
  })

  return (
    <FormProvider {...methods} control={control}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={20}>
          <Grid
            gap={{ base: 20, small: 8 }}
            gridTemplateColumns={{ base: '1fr', small: ['1fr', 200] }}
          >
            <TextField
              control={control}
              name="street_1"
              isRequired
              label={t('street1Label')}
              //  errorMessage={t('validations.firstName')}
            />
            <TextField control={control} name="street_2" label={t('street2Label')} />
          </Grid>
        </Flex>
      </Form>
    </FormProvider>
  )
}
