import { Form as AriaForm } from 'react-aria-components'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useLocationsRetrieveSuspense } from '@gusto/embedded-api/react-query/locationsRetrieve'
import { Head } from './Head'
import { Form, LocationFormInputs, LocationFormSchema } from './Form'
import { Actions } from './Actions'
import { Flex } from '@/components/Common'
import {
  BaseComponent,
  BaseComponentInterface,
  CommonComponentInterface,
  createCompoundContext,
  useBase,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

interface LocationFormProps extends CommonComponentInterface {
  locationId: string
}

type LocationsFormContextType = {
  handleCancel: () => void
}

const [useLocationsForm, LocationsFormProvider] = createCompoundContext<LocationsFormContextType>(
  'CompanyDocumentFormContext',
)

export { useLocationsForm }

function Root({ locationId, className, children }: LocationFormProps) {
  useI18n('Company.Locations')
  const { onEvent } = useBase()
  const {
    data: { location },
  } = useLocationsRetrieveSuspense({ locationId: locationId })

  const addressType = ['mailingAddress', 'filingAddress'] as const

  const { control, ...methods } = useForm<LocationFormInputs>({
    resolver: valibotResolver(LocationFormSchema),
    defaultValues: {
      city: location?.city ?? '',
      phoneNumber: location?.phoneNumber ?? '',
      street1: location?.street1 ?? '',
      street2: location?.street2 ?? '',
      state: location?.state ?? '',
      zip: location?.zip ?? '',
      addressType: addressType.filter(key => location?.[key] ?? false),
    },
  })

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }
  const onSubmit = (data: LocationFormInputs) => {
    // console.log(data)
  }

  return (
    <section className={className}>
      <FormProvider {...methods} control={control}>
        <AriaForm onSubmit={methods.handleSubmit(onSubmit)}>
          <LocationsFormProvider value={{ handleCancel }}>
            <Flex flexDirection="column" gap={32}>
              {children ? (
                children
              ) : (
                <>
                  <Head />
                  <Form />
                  <Actions />
                </>
              )}
            </Flex>
          </LocationsFormProvider>
        </AriaForm>
      </FormProvider>
    </section>
  )
}

export function LocationForm({
  locationId,
  className,
  children,
  ...props
}: LocationFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root locationId={locationId} className={className}>
        {children}
      </Root>
    </BaseComponent>
  )
}

LocationForm.Head = Head
LocationForm.Form = Form
LocationForm.Actions = Actions
