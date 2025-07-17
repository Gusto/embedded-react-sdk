import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SubmitHandler } from 'react-hook-form'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { useContractorsCreateMutation } from '@gusto/embedded-api/react-query/contractorsCreate'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import type { PostV1CompaniesCompanyUuidContractorsRequestBody } from '@gusto/embedded-api/models/operations/postv1companiescompanyuuidcontractors'
import type { PutV1ContractorsContractorUuidRequestBody } from '@gusto/embedded-api/models/operations/putv1contractorscontractoruuid'
import {
  WageType as ApiWageType,
  ContractorType as ApiContractorType,
} from '@gusto/embedded-api/models/components/contractor'
import { useBase } from '@/components/Base'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { SSN_REGEX, NAME_REGEX } from '@/helpers/validations'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { normalizeEin } from '@/helpers/federalEin'

// Re-export the API types for convenience
export const WageType = ApiWageType
export const ContractorType = ApiContractorType

// Form schema definition - exported for use in stories and tests
const ContractorProfileSchema = z.object({
  // Self-onboarding toggle
  inviteContractor: z.boolean().default(false),
  email: z.string().email().optional(),

  // Required contractor fields
  contractorType: z.enum([ContractorType.Individual, ContractorType.Business]),
  wageType: z.enum([WageType.Hourly, WageType.Fixed]),
  startDate: z.date(),

  // Individual contractor fields
  firstName: z.string().min(1).regex(NAME_REGEX).optional(),
  middleInitial: z.string().optional(),
  lastName: z.string().min(1).regex(NAME_REGEX).optional(),
  ssn: z.string().optional(),

  // Business contractor fields
  businessName: z.string().optional(),
  ein: z.string().optional(),

  // Wage fields
  hourlyRate: z.number().min(0).optional(),
})

export type ContractorProfileFormData = z.infer<typeof ContractorProfileSchema>

// Create validation schema - exported for stories
export const createContractorProfileValidationSchema = (t: (key: string) => string) => {
  return ContractorProfileSchema.superRefine(
    (data: ContractorProfileFormData, ctx: z.RefinementCtx) => {
      // Email validation for contractor invitation
      if (data.inviteContractor && !data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: t('validations.email'),
        })
      }

      // Individual contractor validations
      if (data.contractorType === ContractorType.Individual) {
        if (!data.firstName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['firstName'],
            message: t('validations.firstName'),
          })
        }

        if (!data.lastName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lastName'],
            message: t('validations.lastName'),
          })
        }

        if (!data.ssn) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ssn'],
            message: t('validations.ssn'),
          })
        } else {
          // Validate SSN format
          const cleanSSN = removeNonDigits(data.ssn)
          if (!SSN_REGEX.test(cleanSSN)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['ssn'],
              message: t('validations.ssnFormat'),
            })
          }
        }
      }

      // Business contractor validations
      if (data.contractorType === ContractorType.Business) {
        if (!data.businessName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['businessName'],
            message: t('validations.businessName'),
          })
        }

        if (!data.ein) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ein'],
            message: t('validations.ein'),
          })
        } else {
          // Validate EIN format after normalization (XX-XXXXXXX)
          const normalizedEin = normalizeEin(data.ein)
          if (!/^\d{2}-\d{7}$/.test(normalizedEin)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['ein'],
              message: t('validations.einFormat'),
            })
          }
        }
      }

      // Hourly rate validation for hourly contractors
      if (data.wageType === WageType.Hourly) {
        if (data.hourlyRate === undefined || data.hourlyRate < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['hourlyRate'],
            message: t('validations.hourlyRate'),
          })
        }
      }
    },
  )
}

export interface UseContractorProfileProps {
  companyId: string
  contractorId?: string
  defaultValues?: Partial<ContractorProfileFormData>
}

export function useContractorProfile({
  companyId,
  contractorId,
  defaultValues,
}: UseContractorProfileProps) {
  useI18n('Contractor.Profile')
  const { t } = useTranslation('Contractor.Profile')
  const { onEvent, baseSubmitHandler } = useBase()

  // Create validation schema with translations
  const validationSchema = createContractorProfileValidationSchema(t as (key: string) => string)

  // API mutations
  const { mutateAsync: createContractor, isPending: isCreating } = useContractorsCreateMutation()
  const { mutateAsync: updateContractor, isPending: isUpdating } = useContractorsUpdateMutation()

  // Fetch existing contractor data if editing
  const existingContractorQuery = useContractorsGet(
    { contractorUuid: contractorId || '' },
    { enabled: !!contractorId },
  )

  const existingContractor = existingContractorQuery.data?.contractor

  // Prepare default values from existing contractor or provided defaults
  const formDefaultValues = useMemo(
    () => ({
      inviteContractor: false,
      contractorType: ContractorType.Business,
      wageType: WageType.Fixed,
      startDate: new Date(),
      ...defaultValues,
      // Override with existing contractor data if available
      ...(existingContractor && {
        contractorType: existingContractor.type || ContractorType.Business,
        wageType: existingContractor.wageType || WageType.Fixed,
        startDate: existingContractor.startDate
          ? new Date(existingContractor.startDate)
          : new Date(),
        firstName: existingContractor.firstName || undefined,
        middleInitial: existingContractor.middleInitial || undefined,
        lastName: existingContractor.lastName || undefined,
        businessName: existingContractor.businessName || undefined,
        ein: existingContractor.ein || undefined,
        email: existingContractor.email || undefined,
        hourlyRate: existingContractor.hourlyRate
          ? (() => {
              const parsed = parseFloat(existingContractor.hourlyRate)
              return isNaN(parsed) ? undefined : parsed
            })()
          : undefined,
      }),
    }),
    [existingContractor, defaultValues],
  )

  // Form setup
  const formMethods = useForm<ContractorProfileFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: formDefaultValues,
  })

  const { handleSubmit, formState } = formMethods

  // Watch form values for conditional rendering
  const watchedType = useWatch({ control: formMethods.control, name: 'contractorType' })
  const watchedWageType = useWatch({ control: formMethods.control, name: 'wageType' })
  const watchedInviteContractor = useWatch({
    control: formMethods.control,
    name: 'inviteContractor',
  })

  // Helper function to transform form data to API payload
  const transformFormDataToCreatePayload = (
    data: ContractorProfileFormData,
  ): PostV1CompaniesCompanyUuidContractorsRequestBody => {
    const basePayload = {
      type: data.contractorType,
      wageType: data.wageType,
      startDate: formatDateToStringDate(data.startDate) || '',
      selfOnboarding: data.inviteContractor,
      email: data.inviteContractor ? data.email : undefined,
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
        fileNewHireReport: false, // Default value
      }
    } else {
      return {
        ...basePayload,
        businessName: data.businessName,
        ein: data.ein,
      }
    }
  }

  const transformFormDataToUpdatePayload = (
    data: ContractorProfileFormData,
    version: string,
  ): PutV1ContractorsContractorUuidRequestBody => {
    const createPayload = transformFormDataToCreatePayload(data)
    return {
      ...createPayload,
      version,
    }
  }

  // Event handlers
  const onSubmit: SubmitHandler<ContractorProfileFormData> = async data => {
    await baseSubmitHandler(data, async payload => {
      if (contractorId && existingContractor) {
        // Update existing contractor
        if (!existingContractor.version) {
          throw new Error('Contractor version is required for updates')
        }
        const version = String(existingContractor.version)
        const apiPayload = transformFormDataToUpdatePayload(payload, version)

        const updateResponse = await updateContractor({
          request: {
            contractorUuid: contractorId,
            requestBody: apiPayload,
          },
        })

        onEvent(componentEvents.CONTRACTOR_UPDATED, updateResponse.contractor)
      } else {
        // Create new contractor
        const apiPayload = transformFormDataToCreatePayload(payload)

        const createResponse = await createContractor({
          request: {
            companyUuid: companyId,
            requestBody: apiPayload,
          },
        })

        onEvent(componentEvents.CONTRACTOR_CREATED, createResponse.contractor)
      }

      onEvent(componentEvents.CONTRACTOR_PROFILE_SUBMITTED, payload)
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  // Conditional rendering helpers
  const shouldShowEmailField = watchedInviteContractor
  const shouldShowBusinessFields = watchedType === ContractorType.Business
  const shouldShowIndividualFields = watchedType === ContractorType.Individual
  const shouldShowHourlyRate = watchedWageType === WageType.Hourly

  // Form field options
  const contractorTypeOptions = [
    { label: 'Individual', value: ContractorType.Individual },
    { label: 'Business', value: ContractorType.Business },
  ]

  const wageTypeOptions = [
    { label: 'Hourly', value: WageType.Hourly },
    { label: 'Fixed', value: WageType.Fixed },
  ]

  // Determine if we're currently submitting (creating or updating)
  const isSubmitting = isCreating || isUpdating

  // Return only what the component actually needs
  return {
    // Form methods and submission
    formMethods,
    handleSubmit: handleSubmit(onSubmit),
    formState: {
      ...formState,
      isSubmitting,
    },
    handleCancel,

    // Conditional rendering flags
    shouldShowEmailField,
    shouldShowBusinessFields,
    shouldShowIndividualFields,
    shouldShowHourlyRate,

    // Form options
    contractorTypeOptions,
    wageTypeOptions,

    // Component state
    isEditing: !!contractorId,
  }
}
