import { Flex } from '@/components/Common'

import {
  BaseComponent,
  BaseComponentInterface,
  CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import { Head } from './Head'
import { Form } from './Form'

interface LocationFormProps extends CommonComponentInterface {
  locationId: string
}

type LocationsFormContextType = {}

const [useLocationsForm, LocationsFormProvider] = createCompoundContext<LocationsFormContextType>(
  'CompanyDocumentFormContext',
)

export { useLocationsForm }

function Root({ locationId, className, children }: LocationFormProps) {
  useI18n('Company.Locations')

  // const { data } = useLocationsGetSuspense({ companyId })
  // const { locationList } = data

  return (
    <section className={className}>
      <LocationsFormProvider value={{}}>
        <Flex flexDirection="column" gap={32}>
          {children ? (
            children
          ) : (
            <>
              <Head />
              <Form />
              {/* <Actions /> */}
            </>
          )}
        </Flex>
      </LocationsFormProvider>
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
// LocationsForm.Actions = Actions
