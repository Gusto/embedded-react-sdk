import { useMemo } from 'react'
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
import { nameValidation, SSN_REGEX } from '@/helpers/validations'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { normalizeEin } from '@/helpers/federalEin'

// Re-export the API types for convenience
export const WageType = ApiWageType
export const ContractorType = ApiContractorType

// Form-specific schema following codebase patterns
export const ContractorProfileSchema = z
  .object({
    // Self-onboarding toggle
    inviteContractor: z.boolean().default(false),
    email: z.string().email().optional(),

    // Required contractor fields
    contractorType: z.enum([ContractorType.Individual, ContractorType.Business]),
    wageType: z.enum([WageType.Hourly, WageType.Fixed]),
    startDate: z.date(),

    // Individual contractor fields
    firstName: nameValidation.optional(),
    middleInitial: z.string().optional(),
    lastName: nameValidation.optional(),
    ssn: z.string().optional(),

    // Business contractor fields
    businessName: z.string().optional(),
    ein: z.string().optional(),

    // Wage fields
    hourlyRate: z.number().min(0).optional(),
  })
  .refine(
    data => {
      // Email required when inviting contractor
      if (data.inviteContractor && !data.email) {
        return false
      }
      return true
    },
    {
      message: 'Email is required when inviting contractor',
      path: ['email'],
    },
  )
  .refine(
    data => {
      // Individual contractor field requirements
      if (data.contractorType === ContractorType.Individual) {
        if (!data.firstName) {
          return false
        }
      }
      return true
    },
    {
      message: 'First name is required for individual contractors',
      path: ['firstName'],
    },
  )
  .refine(
    data => {
      // Individual contractor last name requirement
      if (data.contractorType === ContractorType.Individual) {
        if (!data.lastName) {
          return false
        }
      }
      return true
    },
    {
      message: 'Last name is required for individual contractors',
      path: ['lastName'],
    },
  )
  .refine(
    data => {
      // Individual contractor SSN validation
      if (data.contractorType === ContractorType.Individual) {
        if (!data.ssn) {
          return false
        }
        // Validate SSN format
        const cleanSSN = removeNonDigits(data.ssn)
        if (!SSN_REGEX.test(cleanSSN)) {
          return false
        }
      }
      return true
    },
    {
      message: 'SSN is required and must be valid for individual contractors',
      path: ['ssn'],
    },
  )
  .refine(
    data => {
      // Business contractor name requirement
      if (data.contractorType === ContractorType.Business) {
        if (!data.businessName) {
          return false
        }
      }
      return true
    },
    {
      message: 'Business name is required for business contractors',
      path: ['businessName'],
    },
  )
  .refine(
    data => {
      // Business contractor EIN validation
      if (data.contractorType === ContractorType.Business) {
        if (!data.ein) {
          return false
        }
        // Validate EIN format after normalization (XX-XXXXXXX)
        const normalizedEin = normalizeEin(data.ein)
        if (!/^\d{2}-\d{7}$/.test(normalizedEin)) {
          return false
        }
      }
      return true
    },
    {
      message: 'EIN is required and must be valid for business contractors',
      path: ['ein'],
    },
  )
  .refine(
    data => {
      // Hourly rate required for hourly contractors
      if (
        data.wageType === WageType.Hourly &&
        (data.hourlyRate === undefined || data.hourlyRate < 0)
      ) {
        return false
      }
      return true
    },
    {
      message: 'Hourly rate is required for hourly contractors',
      path: ['hourlyRate'],
    },
  )

export type ContractorProfileFormData = z.infer<typeof ContractorProfileSchema>

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
  useI18n(null)
  const { onEvent, baseSubmitHandler } = useBase()

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
    resolver: zodResolver(ContractorProfileSchema),
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

  return {
    // Form methods
    formMethods,
    handleSubmit: handleSubmit(onSubmit),
    formState: {
      ...formState,
      isSubmitting,
    },

    // Watched values
    watchedType,
    watchedWageType,
    watchedInviteContractor,

    // Event handlers
    handleCancel,

    // Conditional rendering
    shouldShowEmailField,
    shouldShowBusinessFields,
    shouldShowIndividualFields,
    shouldShowHourlyRate,

    // Form options
    contractorTypeOptions,
    wageTypeOptions,

    // API state
    isCreating,
    isUpdating,
    isEditing: !!contractorId,
    existingContractor,

    // Enum values for easy access
    ContractorType,
    WageType,
  }
}
