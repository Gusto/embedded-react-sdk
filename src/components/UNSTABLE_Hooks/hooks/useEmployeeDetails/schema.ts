import { z } from 'zod'
import { nameValidation } from '@/helpers/validations'

export const employeeDetailsErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_NAME: 'INVALID_NAME',
  INVALID_EMAIL: 'INVALID_EMAIL',
} as const

export type EmployeeDetailsErrorCode =
  (typeof employeeDetailsErrorCodes)[keyof typeof employeeDetailsErrorCodes]

export const generateEmployeeDetailsSchema = () =>
  z.object({
    firstName: nameValidation.or(
      z.string().min(1, { message: employeeDetailsErrorCodes.REQUIRED }),
    ),
    middleInitial: z.string().optional(),
    lastName: nameValidation.or(z.string().min(1, { message: employeeDetailsErrorCodes.REQUIRED })),
    preferredFirstName: z.string().optional(),
    email: z
      .string()
      .email({ message: employeeDetailsErrorCodes.INVALID_EMAIL })
      .optional()
      .or(z.literal('')),
    dateOfBirth: z.date().nullable().optional(),
    selfOnboarding: z.boolean(),
  })

export type EmployeeDetailsSchema = ReturnType<typeof generateEmployeeDetailsSchema>
export type EmployeeDetailsFormData = z.infer<EmployeeDetailsSchema>
