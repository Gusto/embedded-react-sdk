import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocationsUpdateMutation } from '@gusto/embedded-api/react-query/locationsUpdate'
import { useLocationsRetrieveSuspense } from '@gusto/embedded-api/react-query/locationsRetrieve'
import { useLocationsCreateMutation } from '@gusto/embedded-api/react-query/locationsCreate'
import { type Location } from '@gusto/embedded-api/models/components/location'
import { useQueryClient } from '@tanstack/react-query'
import { Head } from './Head'
import type { LocationFormInputs } from './Form'
import { Form, LocationFormSchema } from './Form'
import { Actions } from './Actions'
import { LocationsFormProvider } from './useLocationForm'
import { Form as HtmlForm } from '@/components/Common/Form'
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
  const { onEvent, baseSubmitHandler } = useBase()

  const queryClient = useQueryClient()
  const { mutateAsync: createLocation, isPending: isPendingCreate } = useLocationsCreateMutation()
  const { mutateAsync: updateLocation, isPending: isPendingUpdate } = useLocationsUpdateMutation()
  const addressType = ['mailingAddress', 'filingAddress'] as const
  const isMailingLocked = location?.mailingAddress === true
  const isFilingLocked = location?.filingAddress === true

  const { control, ...methods } = useForm<LocationFormInputs>({
    resolver: zodResolver(LocationFormSchema),
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
    await baseSubmitHandler(data, async innerData => {
      const { addressType, ...payload } = innerData

      // The PUT /v1/locations/:id endpoint treats mailing_address and filing_address
      // as set-only flags: once a location is the company's mailing/filing address,
      // sending false is silently ignored (a company must always have one of each).
      // We mirror this contract by omitting locked fields from the request body.
      const requestBody = {
        ...payload,
        ...(isMailingLocked ? {} : { mailingAddress: addressType?.includes('mailingAddress') }),
        ...(isFilingLocked ? {} : { filingAddress: addressType?.includes('filingAddress') }),
      }

      // Setting mailing_address or filing_address on one location silently
      // flips the previous holder's flag server-side, so cached data for every
      // location (and the list) is potentially stale. We must await refetches
      // of *inactive* queries too (refetchType: 'all') because the next form
      // mount initializes useForm defaults synchronously from cache; otherwise
      // useSuspenseQuery returns the stale cached value without re-suspending
      // and the form seeds with a stale addressType on first open.
      const refreshLocationsCache = () =>
        queryClient.invalidateQueries({
          queryKey: ['@gusto/embedded-api', 'Locations'],
          refetchType: 'all',
        })

      if (location && location.version !== undefined) {
        const { location: responseData } = await updateLocation({
          request: {
            locationId: location.uuid,
            requestBody: { ...requestBody, version: location.version },
          },
        })
        await refreshLocationsCache()
        onEvent(componentEvents.COMPANY_LOCATION_UPDATED, responseData)
      } else {
        const { location: responseData } = await createLocation({
          request: {
            companyId,
            companyLocationRequest: requestBody,
          },
        })
        await refreshLocationsCache()
        onEvent(componentEvents.COMPANY_LOCATION_CREATED, responseData)
      }
    })
  }

  return (
    <section className={className}>
      <FormProvider {...methods} control={control}>
        <HtmlForm onSubmit={methods.handleSubmit(onSubmit)}>
          <LocationsFormProvider
            value={{ handleCancel, isPending: isPendingCreate || isPendingUpdate }}
          >
            <Flex flexDirection="column" gap={32}>
              {children ? (
                children
              ) : (
                <>
                  <Head />
                  <Form isMailingLocked={isMailingLocked} isFilingLocked={isFilingLocked} />
                  <Actions />
                </>
              )}
            </Flex>
          </LocationsFormProvider>
        </HtmlForm>
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
