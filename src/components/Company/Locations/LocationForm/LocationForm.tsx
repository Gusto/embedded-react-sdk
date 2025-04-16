import { Form as AriaForm } from 'react-aria-components'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useLocationsUpdateMutation } from '@gusto/embedded-api/react-query/locationsUpdate'
import { useLocationsRetrieveSuspense } from '@gusto/embedded-api/react-query/locationsRetrieve'
import { invalidateAllLocationsGet } from '@gusto/embedded-api/react-query/locationsGet'
import { useLocationsCreateMutation } from '@gusto/embedded-api/react-query/locationsCreate'
import { type Location } from '@gusto/embedded-api/models/components/location'
import { useQueryClient } from '@gusto/embedded-api/ReactSDKProvider'
import { Head } from './Head'
import type { LocationFormInputs } from './Form'
import { Form, LocationFormSchema } from './Form'
import { Actions } from './Actions'
import { LocationsFormProvider } from './useLocationForm'
import { Flex } from '@/components/Common'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import type { WithRequired } from '@/types/Helpers'

interface LocationFormProps extends CommonComponentInterface {
  companyId: string
  locationId?: string
}

/**Accounting for conditional logic where location data needs to be fetched only if locationId is present */
function RootWithLocation(props: WithRequired<LocationFormProps, 'locationId'>) {
  const {
    data: { location },
  } = useLocationsRetrieveSuspense({ locationId: props.locationId })
  return <Root {...props} location={location} />
}

function Root({
  companyId,
  location,
  className,
  children,
}: LocationFormProps & { location?: Location }) {
  useI18n('Company.Locations')
  const { onEvent } = useBase()

  const { mutateAsync: createLocation, isPending: isPendingCreate } = useLocationsCreateMutation()
  const { mutateAsync: updateLocation, isPending: isPendingUpdate } = useLocationsUpdateMutation()
  const queryClient = useQueryClient()
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
  const onSubmit = async (data: LocationFormInputs) => {
    const { addressType, ...payload } = data

    const requestBody = {
      ...payload,
      mailingAddress: addressType?.includes('mailingAddress'),
      filingAddress: addressType?.includes('filingAddress'),
    }

    if (location && location.version !== undefined) {
      // Edit existing location
      const { location: responseData } = await updateLocation({
        request: {
          locationId: location.uuid,
          requestBody: { ...requestBody, version: location.version },
        },
      })
      onEvent(componentEvents.COMPANY_LOCATION_UPDATED, responseData)
    } else {
      // Add new location
      const { location: responseData } = await createLocation({
        request: {
          companyId,
          requestBody,
        },
      })
      onEvent(componentEvents.COMPANY_LOCATION_CREATED, responseData)
    }

    // Invalidate cache after mutation
    await invalidateAllLocationsGet(queryClient)
  }

  return (
    <section className={className}>
      <FormProvider {...methods} control={control}>
        <AriaForm onSubmit={methods.handleSubmit(onSubmit)}>
          <LocationsFormProvider
            value={{ handleCancel, isPending: isPendingCreate || isPendingUpdate }}
          >
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
  companyId,
  locationId,
  className,
  children,
  ...props
}: LocationFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      {locationId ? (
        <RootWithLocation companyId={companyId} locationId={locationId} className={className}>
          {children}
        </RootWithLocation>
      ) : (
        <Root companyId={companyId} className={className}>
          {children}
        </Root>
      )}
    </BaseComponent>
  )
}

LocationForm.Head = Head
LocationForm.Form = Form
LocationForm.Actions = Actions
