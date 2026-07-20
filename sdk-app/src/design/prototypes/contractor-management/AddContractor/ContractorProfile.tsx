import { useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsCreateMutation } from '@gusto/embedded-api/react-query/contractorsCreate'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import {
  ContractorWageType as WageType,
  ContractorType,
  type Contractor,
} from '@gusto/embedded-api/models/components/contractor'
import type { ContractorCreateRequestBody } from '@gusto/embedded-api/models/components/contractorcreaterequestbody'
import type { ContractorUpdateRequestBody } from '@gusto/embedded-api/models/components/contractorupdaterequestbody'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { Grid } from '@/components/Common/Grid/Grid'
import { Flex } from '@/components/Common/Flex'
import { TextInputField } from '@/components/Common/Fields/TextInputField'
import { NumberInputField } from '@/components/Common/Fields/NumberInputField'
import { RadioGroupField } from '@/components/Common/Fields/RadioGroupField'
import { SwitchField } from '@/components/Common/Fields/SwitchField'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField'
import { normalizeSSN } from '@/helpers/ssn'
import { normalizeEin } from '@/helpers/federalEin'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { SSN_REGEX, NAME_REGEX } from '@/helpers/validations'
import {
  componentEvents,
  ContractorOnboardingStatus,
  ContractorSelfOnboardingStatuses,
} from '@/shared/constants'

const ContractorProfileSchema = z.object({
  selfOnboarding: z.boolean(),
  email: z.string().email().optional(),
  contractorType: z.enum([ContractorType.Individual, ContractorType.Business]),
  wageType: z.enum([WageType.Hourly, WageType.Fixed]),
  startDate: z.date(),
  firstName: z.string().min(1).regex(NAME_REGEX).optional(),
  middleInitial: z.string().optional(),
  lastName: z.string().min(1).regex(NAME_REGEX).optional(),
  ssn: z.string().optional(),
  businessName: z.string().optional(),
  ein: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
})

type ContractorProfileFormData = z.infer<typeof ContractorProfileSchema>

function createValidationSchema(hasSsn: boolean, hasEin: boolean) {
  return ContractorProfileSchema.superRefine((data, ctx) => {
    if (data.selfOnboarding && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Email is required when inviting a contractor',
      })
    }

    if (data.contractorType === ContractorType.Individual) {
      if (!data.firstName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['firstName'],
          message: 'First name is required',
        })
      }
      if (!data.lastName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lastName'],
          message: 'Last name is required',
        })
      }
      if (!data.ssn) {
        if (!hasSsn && !data.selfOnboarding) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ssn'],
            message: 'Social security number is required',
          })
        }
      } else {
        const cleanSSN = removeNonDigits(data.ssn)
        if (!SSN_REGEX.test(cleanSSN)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ssn'],
            message: 'SSN must be 9 digits',
          })
        }
      }
    }

    if (data.contractorType === ContractorType.Business) {
      if (!data.businessName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['businessName'],
          message: 'Business name is required',
        })
      }
      if (!data.ein) {
        if (!hasEin && !data.selfOnboarding) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ein'],
            message: 'EIN is required',
          })
        }
      } else {
        const normalizedEin = normalizeEin(data.ein)
        if (!/^\d{2}-\d{7}$/.test(normalizedEin)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ein'],
            message: 'EIN must be 9 digits',
          })
        }
      }
    }

    if (data.wageType === WageType.Hourly) {
      if (data.hourlyRate === undefined || data.hourlyRate < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hourlyRate'],
          message: 'Hourly rate is required',
        })
      }
    }
  })
}

interface ContractorProfileProps {
  companyId: string
  contractorId?: string
  onEvent: (eventType: string, data?: unknown) => void
}

export function ContractorProfile(props: ContractorProfileProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      {props.contractorId ? (
        <RootWithContractor companyId={props.companyId} contractorId={props.contractorId} />
      ) : (
        <Root companyId={props.companyId} />
      )}
    </BaseComponent>
  )
}

function RootWithContractor({
  companyId,
  contractorId,
}: {
  companyId: string
  contractorId: string
}) {
  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })
  return <Root companyId={companyId} contractorId={contractorId} existingContractor={contractor} />
}

function Root({
  companyId,
  contractorId,
  existingContractor,
}: {
  companyId: string
  contractorId?: string
  existingContractor?: Contractor
}) {
  const { onEvent, baseSubmitHandler } = useBase()
  const Components = useComponentContext()

  const validationSchema = createValidationSchema(
    existingContractor?.hasSsn ?? false,
    existingContractor?.hasEin ?? false,
  )

  const { mutateAsync: createContractor, isPending: isCreating } = useContractorsCreateMutation()
  const { mutateAsync: updateContractor, isPending: isUpdating } = useContractorsUpdateMutation()

  const formDefaultValues = useMemo(
    () => ({
      selfOnboarding: false,
      contractorType: ContractorType.Business,
      wageType: WageType.Fixed,
      startDate: new Date(),
      ...(existingContractor && {
        selfOnboarding: existingContractor.onboardingStatus
          ? // @ts-expect-error: onboarding_status during runtime can be one of self onboarding statuses
            ContractorSelfOnboardingStatuses.has(existingContractor.onboardingStatus)
          : false,
        contractorType: existingContractor.type || ContractorType.Business,
        wageType: existingContractor.wageType || WageType.Fixed,
        startDate: existingContractor.startDate
          ? new Date(existingContractor.startDate)
          : new Date(),
        firstName: existingContractor.firstName || undefined,
        middleInitial: existingContractor.middleInitial || undefined,
        lastName: existingContractor.lastName || undefined,
        businessName: existingContractor.businessName || undefined,
        email: existingContractor.email || undefined,
        hourlyRate: existingContractor.hourlyRate
          ? (() => {
              const parsed = parseFloat(existingContractor.hourlyRate)
              return isNaN(parsed) ? undefined : parsed
            })()
          : undefined,
      }),
    }),
    [existingContractor],
  )

  const formMethods = useForm<ContractorProfileFormData, unknown, ContractorProfileFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: formDefaultValues,
    ...(existingContractor && { values: formDefaultValues }),
    resetOptions: { keepDirtyValues: true },
  })

  const { handleSubmit } = formMethods

  const watchedType = useWatch({ control: formMethods.control, name: 'contractorType' })
  const watchedWageType = useWatch({ control: formMethods.control, name: 'wageType' })
  const watchedSelfOnboarding = useWatch({ control: formMethods.control, name: 'selfOnboarding' })

  const shouldShowEmailField = watchedSelfOnboarding
  const shouldShowIndividualFields = watchedType === ContractorType.Individual
  const shouldShowBusinessFields = watchedType === ContractorType.Business
  const shouldShowHourlyRate = watchedWageType === WageType.Hourly
  const shouldShowSsnField = watchedType === ContractorType.Individual && !watchedSelfOnboarding
  const shouldShowEinField = watchedType === ContractorType.Business && !watchedSelfOnboarding

  const ssnPlaceholder = existingContractor?.hasSsn ? '***-**-****' : ''
  const einPlaceholder = existingContractor?.hasEin ? '**-*******' : ''

  const isEditing = !!contractorId
  const isSubmitting = isCreating || isUpdating

  const transformFormDataToCreatePayload = (
    data: ContractorProfileFormData,
  ): ContractorCreateRequestBody => {
    const basePayload = {
      type: data.contractorType,
      wageType: data.wageType,
      startDate: formatDateToStringDate(data.startDate) || '',
      selfOnboarding: data.selfOnboarding,
      email: data.selfOnboarding ? data.email : undefined,
      hourlyRate: data.wageType === WageType.Hourly ? String(data.hourlyRate) : undefined,
      isActive: true,
    }

    if (data.contractorType === ContractorType.Individual) {
      return {
        ...basePayload,
        firstName: data.firstName,
        middleInitial: data.middleInitial || undefined,
        lastName: data.lastName,
        ssn: data.ssn,
        fileNewHireReport: false,
      }
    } else {
      return {
        ...basePayload,
        fileNewHireReport: false,
        businessName: data.businessName,
        ein: data.ein?.replace(/-/g, ''),
      }
    }
  }

  const transformFormDataToUpdatePayload = (
    data: ContractorProfileFormData,
    version: string,
  ): ContractorUpdateRequestBody => {
    const createPayload = transformFormDataToCreatePayload(data)
    return {
      ...createPayload,
      version,
    }
  }

  const onSubmit = async (data: ContractorProfileFormData) => {
    await baseSubmitHandler(data, async payload => {
      let newContractorId = existingContractor?.uuid

      if (existingContractor) {
        const version = existingContractor.version!
        const apiPayload = transformFormDataToUpdatePayload(payload, version)

        const updateResponse = await updateContractor({
          request: {
            contractorUuid: newContractorId!,
            contractorUpdateRequestBody: apiPayload,
          },
        })

        onEvent(componentEvents.CONTRACTOR_UPDATED, updateResponse.contractor)
      } else {
        const apiPayload = transformFormDataToCreatePayload(payload)

        const createResponse = await createContractor({
          request: {
            companyUuid: companyId,
            contractorCreateRequestBody: apiPayload,
          },
        })

        newContractorId = createResponse.contractor?.uuid
        onEvent(componentEvents.CONTRACTOR_CREATED, createResponse.contractor)
      }

      onEvent(componentEvents.CONTRACTOR_PROFILE_DONE, {
        selfOnboarding:
          payload.selfOnboarding &&
          existingContractor?.onboardingStatus !==
            ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW,
        contractorId: newContractorId,
      })
    })
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Grid gridTemplateColumns="1fr" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Contractor profile</Components.Heading>
            <Components.Text variant="supporting">
              This information will be used for payments and on tax documents.
            </Components.Text>
          </Flex>

          <Components.Box>
            <Grid gap={16}>
              <SwitchField
                name="selfOnboarding"
                label="Invite this contractor to enter their own details"
                description="The contractor will receive an email to complete their own onboarding."
                isDisabled={
                  existingContractor
                    ? existingContractor.onboardingStatus !==
                      ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE
                    : false
                }
              />
              {shouldShowEmailField && (
                <TextInputField name="email" label="Email address" isRequired type="email" />
              )}
            </Grid>
          </Components.Box>

          <Flex flexDirection="column" gap={20}>
            <RadioGroupField
              name="contractorType"
              isRequired
              label="Contractor type"
              options={[
                { label: 'Individual', value: ContractorType.Individual },
                { label: 'Business', value: ContractorType.Business },
              ]}
            />

            {shouldShowIndividualFields && (
              <>
                <Grid gridTemplateColumns={{ base: '1fr', medium: '1fr 1fr' }} gap={16}>
                  <TextInputField name="firstName" label="First name" isRequired />
                  <TextInputField name="middleInitial" label="Middle initial" />
                </Grid>
                <TextInputField name="lastName" label="Last name" isRequired />
                {shouldShowSsnField && (
                  <TextInputField
                    name="ssn"
                    label="Social security number"
                    placeholder={ssnPlaceholder}
                    transform={normalizeSSN}
                    isRequired
                  />
                )}
              </>
            )}

            {shouldShowBusinessFields && (
              <>
                <TextInputField name="businessName" label="Business name" isRequired />
                {shouldShowEinField && (
                  <TextInputField
                    name="ein"
                    label="Employer Identification Number (EIN)"
                    placeholder={einPlaceholder}
                    transform={normalizeEin}
                    isRequired
                  />
                )}
              </>
            )}

            <RadioGroupField
              name="wageType"
              isRequired
              label="Wage type"
              options={[
                { label: 'Hourly', value: WageType.Hourly },
                { label: 'Fixed', value: WageType.Fixed },
              ]}
            />

            {shouldShowHourlyRate && (
              <NumberInputField
                name="hourlyRate"
                label="Hourly rate"
                min={0}
                isRequired
                format="currency"
              />
            )}

            <DatePickerField
              name="startDate"
              label="Start date"
              description="When does this contractor begin working?"
              isRequired
            />
          </Flex>
        </Grid>

        <Flex gap={12} justifyContent="flex-end">
          <Components.Button type="submit" variant="primary" isDisabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
                ? 'Update contractor'
                : 'Create contractor'}
          </Components.Button>
        </Flex>
      </Form>
    </FormProvider>
  )
}
