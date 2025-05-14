import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import classNames from 'classnames'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { useSignatoriesCreateMutation } from '@gusto/embedded-api/react-query/signatoriesCreate'
import { useSignatoriesUpdateMutation } from '@gusto/embedded-api/react-query/signatoriesUpdate'
import { useSignatoriesDeleteMutation } from '@gusto/embedded-api/react-query/signatoriesDelete'
import { type CreateSignatoryInputs } from './CreateSignatoryForm'
import { CreateSignatoryForm } from './CreateSignatoryForm'
import { Actions } from './Actions'
import styles from './CreateSignatory.module.scss'
import type { CreateSignatoryDefaultValues } from './useCreateSignatory'
import { CreateSignatoryProvider } from './useCreateSignatory'
import { generateCreateSignatorySchema } from './Schema'
import { Form } from '@/components/Common/Form'
import { useI18n } from '@/i18n'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { commonMasks, useMaskedTransform } from '@/helpers/mask'

interface CreateSignatoryProps extends CommonComponentInterface {
  companyId: string
  signatoryId?: string
  defaultValues?: CreateSignatoryDefaultValues
}

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
  const transformPhone = useMaskedTransform(commonMasks.phoneMask)

  const {
    data: { signatoryList },
  } = useSignatoriesListSuspense({
    companyUuid: companyId,
  })
  const signatories = signatoryList!

  const currentSignatory = signatories.find(signatory => signatory.uuid === signatoryId)

  const createSignatoryMutation = useSignatoriesCreateMutation()
  const updateSignatoryMutation = useSignatoriesUpdateMutation()
  const deleteSignatoryMutation = useSignatoriesDeleteMutation()

  const defaultBirthday = currentSignatory?.birthday ?? defaultValues?.birthday

  const createSignatoryDefaultValues = {
    firstName: currentSignatory?.firstName ?? defaultValues?.firstName ?? '',
    lastName: currentSignatory?.lastName ?? defaultValues?.lastName ?? '',
    email: currentSignatory?.email ?? defaultValues?.email ?? '',
    title: currentSignatory?.title ?? defaultValues?.title ?? '',
    phone: transformPhone(currentSignatory?.phone ?? defaultValues?.phone ?? ''),
    ssn: currentSignatory?.hasSsn ? '' : defaultValues?.ssn,
    street1: currentSignatory?.homeAddress?.street1 ?? defaultValues?.street1,
    street2: currentSignatory?.homeAddress?.street2 ?? defaultValues?.street2,
    city: currentSignatory?.homeAddress?.city ?? defaultValues?.city,
    state: currentSignatory?.homeAddress?.state ?? defaultValues?.state,
    zip: currentSignatory?.homeAddress?.zip ?? defaultValues?.zip,
    ...(defaultBirthday ? { birthday: new Date(defaultBirthday) } : {}),
  }

  const formMethods = useForm<CreateSignatoryInputs>({
    resolver: valibotResolver(generateCreateSignatorySchema(currentSignatory?.hasSsn)),
    defaultValues: createSignatoryDefaultValues,
  })

  const onSubmit = async (data: CreateSignatoryInputs) => {
    await baseSubmitHandler(data, async payload => {
      const { street1, street2, city, state, zip, birthday, email, ssn, ...signatoryData } = payload

      const commonData = {
        ...signatoryData,
        birthday: formatDateToStringDate(birthday) || '',
        homeAddress: {
          street1,
          street2,
          city,
          state,
          zip,
        },
      }

      if (currentSignatory) {
        const updateSignatoryResponse = await updateSignatoryMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            signatoryUuid: currentSignatory.uuid,
            requestBody: {
              version: currentSignatory.version,
              ...(ssn ? { ssn } : {}),
              ...commonData,
            },
          },
        })

        onEvent(companyEvents.COMPANY_SIGNATORY_UPDATED, updateSignatoryResponse.signatory)
      } else {
        if (signatories[0]?.uuid) {
          await deleteSignatoryMutation.mutateAsync({
            request: {
              companyUuid: companyId,
              signatoryUuid: signatories[0].uuid,
            },
          })
        }
        const createSignatoryResponse = await createSignatoryMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            requestBody: {
              email,
              ssn: ssn || '',
              ...commonData,
            },
          },
        })
        onEvent(companyEvents.COMPANY_SIGNATORY_CREATED, createSignatoryResponse.signatory)
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
