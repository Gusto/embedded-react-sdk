import { z } from 'zod'
import {
  AuthorizationStatus,
  I9AuthorizationDocumentType,
} from '@gusto/embedded-api/models/components/i9authorization'

const isValidUscisNumber = (value: string) => /^[Aa]?\d{7,9}$/.test(value)
const isValidI94Number = (value: string) => /^\d{9} ?[A-Za-z\d]\d$/.test(value)

export const USCIS_NUMBER_MAX_LENGTH = 10
export const I94_NUMBER_MAX_LENGTH = 11

export const generateEmploymentEligibilitySchema = (hasDocumentNumber?: boolean | null) =>
  z
    .object({
      authorizationStatus: z.nativeEnum(AuthorizationStatus).optional(),
      documentType: z.nativeEnum(I9AuthorizationDocumentType).optional(),
      documentNumber: z.string().optional(),
      expirationDate: z
        .date()
        .transform(date => date.toISOString().split('T')[0])
        .optional(),
      country: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.authorizationStatus) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Authorization status is required',
          path: ['authorizationStatus'],
        })
        return
      }
      if (data.authorizationStatus === 'permanent_resident') {
        if (!data.documentNumber) {
          if (!hasDocumentNumber) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Document number is required',
              path: ['documentNumber'],
            })
          }
        } else if (data.documentNumber.length > USCIS_NUMBER_MAX_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Must be ${USCIS_NUMBER_MAX_LENGTH} characters or fewer`,
            path: ['documentNumber'],
          })
        } else if (!isValidUscisNumber(data.documentNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Enter a 7-9 digit USCIS number or A-Number (e.g. A123456789)',
            path: ['documentNumber'],
          })
        }
      }
      if (data.authorizationStatus === 'alien') {
        if (!data.documentType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Authorization document is required',
            path: ['documentType'],
          })
        }
        if (!data.documentNumber) {
          if (!hasDocumentNumber) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Document number is required',
              path: ['documentNumber'],
            })
          }
        } else if (data.documentType === 'uscis_alien_registration_number') {
          if (data.documentNumber.length > USCIS_NUMBER_MAX_LENGTH) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Must be ${USCIS_NUMBER_MAX_LENGTH} characters or fewer`,
              path: ['documentNumber'],
            })
          } else if (!isValidUscisNumber(data.documentNumber)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Enter a 7-9 digit USCIS number or A-Number (e.g. A123456789)',
              path: ['documentNumber'],
            })
          }
        } else if (data.documentType === 'form_i94') {
          if (data.documentNumber.length > I94_NUMBER_MAX_LENGTH) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Must be ${I94_NUMBER_MAX_LENGTH} characters or fewer`,
              path: ['documentNumber'],
            })
          } else if (!isValidI94Number(data.documentNumber)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Enter a valid 11-character Form I-94 admission number',
              path: ['documentNumber'],
            })
          }
        }
        if (data.documentType === 'foreign_passport' && !data.country) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Country of issuance is required',
            path: ['country'],
          })
        }
      }
    })

export type EmploymentEligibilityInputs = z.input<
  ReturnType<typeof generateEmploymentEligibilitySchema>
>
export type EmploymentEligibilityPayload = z.infer<
  ReturnType<typeof generateEmploymentEligibilitySchema>
>
