import { Form } from 'react-aria-components'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import classNames from 'classnames'
import { parseDate } from '@internationalized/date'
import { useI18n } from '@/i18n'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { Flex } from '@/components/Common'
import {
  useGetAllSignatories,
  useCreateSignatory as useCreateSignatoryMutation,
  useUpdateSignatory,
  useDeleteSignatory,
} from '@/api/queries/company'
import { Schemas } from '@/types/schema'
import { companyEvents } from '@/shared/constants'
import { RequireAtLeastOne } from '@/types/Helpers'
import { normalizePhone } from '@/helpers/phone'
import { type CreateSignatoryInputs, generateCreateSignatorySchema } from './CreateSignatoryForm'
import { CreateSignatoryForm } from './CreateSignatoryForm'
import { Actions } from './Actions'

import styles from './CreateSignatory.module.scss'

export const SignatoryAssignmentMode = {
  create_signatory: 'create_signatory',
  invite_signatory: 'invite_signatory',
} as const

export type CreateSignatoryDefaultValues = RequireAtLeastOne<
  Pick<
    Schemas['Signatory'],
    'first_name' | 'last_name' | 'email' | 'title' | 'phone' | 'birthday'
  > &
    Pick<
      NonNullable<Schemas['Signatory']['home_address']>,
      'street_1' | 'street_2' | 'city' | 'state' | 'zip'
    > & {
      ssn?: string
    }
>

interface CreateSignatoryProps extends CommonComponentInterface {
  companyId: string
  signatoryId?: string
  defaultValues?: CreateSignatoryDefaultValues
}

type CreateSignatoryContextType = {
  isPending: boolean
  currentSignatory?: Schemas['Signatory']
}

const [useCreateSignatory, CreateSignatoryProvider] =
  createCompoundContext<CreateSignatoryContextType>('CreateSignatoryContext')

export { useCreateSignatory }

export function CreateSignatory(props: CreateSignatoryProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({
  companyId,
  signatoryId,
  defaultValues,
  className,
  children,
}: CreateSignatoryProps) {
  useI18n('Company.AssignSignatory')
  const { onEvent, baseSubmitHandler } = useBase()

  const { data: signatories } = useGetAllSignatories(companyId)
  const currentSignatory = signatories.find(signatory => signatory.uuid === signatoryId)

  const createSignatoryMutation = useCreateSignatoryMutation(companyId)
  const updateSignatoryMutation = useUpdateSignatory(companyId)
  const deleteSignatoryMutation = useDeleteSignatory(companyId)

  const defaultBirthday = currentSignatory?.birthday ?? defaultValues?.birthday

  const createSignatoryDefaultValues = {
    first_name: currentSignatory?.first_name ?? defaultValues?.first_name ?? '',
    last_name: currentSignatory?.last_name ?? defaultValues?.last_name ?? '',
    email: currentSignatory?.email ?? defaultValues?.email ?? '',
    title: currentSignatory?.title ?? defaultValues?.title ?? '',
    phone: normalizePhone(currentSignatory?.phone ?? defaultValues?.phone ?? ''),
    ssn: currentSignatory?.has_ssn ? '' : defaultValues?.ssn,
    street_1: currentSignatory?.home_address?.street_1 ?? defaultValues?.street_1,
    street_2: currentSignatory?.home_address?.street_2 ?? defaultValues?.street_2,
    city: currentSignatory?.home_address?.city ?? defaultValues?.city,
    state: currentSignatory?.home_address?.state ?? defaultValues?.state,
    zip: currentSignatory?.home_address?.zip ?? defaultValues?.zip,
    ...(defaultBirthday ? { birthday: parseDate(defaultBirthday) } : {}),
  }

  const formMethods = useForm<CreateSignatoryInputs>({
    resolver: valibotResolver(generateCreateSignatorySchema(currentSignatory)),
    defaultValues: createSignatoryDefaultValues,
  })

  const onSubmit = async (data: CreateSignatoryInputs) => {
    await baseSubmitHandler(data, async payload => {
      const { street_1, street_2, city, state, zip, birthday, email, ssn, ...signatoryData } =
        payload

      const commonData = {
        ...signatoryData,
        birthday: birthday.toString(),
        home_address: {
          street_1,
          street_2,
          city,
          state,
          zip,
        },
      }

      if (currentSignatory) {
        const updateSignatoryResponse = await updateSignatoryMutation.mutateAsync({
          signatory_id: currentSignatory.uuid,
          body: {
            version: currentSignatory.version,
            ...(ssn ? { ssn } : {}),
            ...commonData,
          },
        })

        onEvent(companyEvents.COMPANY_SIGNATORY_UPDATED, updateSignatoryResponse)
      } else {
        if (signatories[0]?.uuid) {
          await deleteSignatoryMutation.mutateAsync(signatories[0].uuid)
        }
        const createSignatoryResponse = await createSignatoryMutation.mutateAsync({
          email,
          ssn,
          ...commonData,
        })
        onEvent(companyEvents.COMPANY_SIGNATORY_CREATED, createSignatoryResponse)
      }
      onEvent(companyEvents.COMPANY_CREATE_SIGNATORY_DONE)
    })
  }

  return (
    <section className={classNames(styles.container, className)}>
      <CreateSignatoryProvider
        value={{
          isPending:
            createSignatoryMutation.isPending ||
            deleteSignatoryMutation.isPending ||
            updateSignatoryMutation.isPending,
          currentSignatory,
        }}
      >
        <FormProvider {...formMethods}>
          <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Flex flexDirection="column" gap={32}>
              {children ? (
                children
              ) : (
                <>
                  <CreateSignatoryForm />
                  <Actions />
                </>
              )}
            </Flex>
          </Form>
        </FormProvider>
      </CreateSignatoryProvider>
    </section>
  )
}

CreateSignatory.Form = CreateSignatoryForm
CreateSignatory.Actions = Actions
