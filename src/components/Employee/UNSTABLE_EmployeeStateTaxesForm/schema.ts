import { z } from 'zod'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'
import type { EmployeeStateTaxesList } from '@gusto/embedded-api/models/components/employeestatetaxeslist'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'

export const stateTaxErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

function buildFieldSchema(question: EmployeeStateTaxQuestion): z.ZodType {
  const questionType = question.inputQuestionFormat.type.toLowerCase()
  const options = question.inputQuestionFormat.options
  const requiredMessage = `${question.label} is required`

  switch (questionType) {
    case 'select':
    case 'radio': {
      if (!options || options.length === 0) {
        return z.unknown()
      }
      const stringValues = options.map(o => String(o.value))
      return z.enum(stringValues as [string, ...string[]], requiredMessage)
    }
    case 'number':
    case 'currency':
      return z.number({ error: () => requiredMessage })
    case 'date':
      return z.string({ error: () => requiredMessage }).min(1, { message: requiredMessage })
    case 'text':
    case 'account_number':
    case 'autocomplete':
      return z.string({ error: () => requiredMessage }).min(1, { message: requiredMessage })
    case 'checkbox':
      return z.boolean({ error: () => requiredMessage })
    case 'percent':
    case 'tax_rate':
      return z.number({ error: () => requiredMessage })
    default:
      return z.string({ error: () => requiredMessage })
  }
}

export function buildStateSchema(
  questions: EmployeeStateTaxQuestion[],
  isAdmin: boolean,
): z.ZodObject<z.ZodRawShape> {
  const shape: Record<string, z.ZodType> = {}

  for (const question of questions) {
    if (question.isQuestionForAdminOnly && !isAdmin) continue
    const fieldName = snakeCaseToCamelCase(question.key)
    shape[fieldName] = buildFieldSchema(question)
  }

  return z.object(shape)
}

export function buildCombinedSchema(
  stateTaxesList: EmployeeStateTaxesList[],
  isAdmin: boolean,
): z.ZodObject<z.ZodRawShape> {
  const stateSchemas: Record<string, z.ZodObject<z.ZodRawShape>> = {}

  for (const stateTax of stateTaxesList) {
    if (stateTax.state && stateTax.questions) {
      stateSchemas[stateTax.state] = buildStateSchema(stateTax.questions, isAdmin)
    }
  }

  return z.object({
    states: z.object(stateSchemas),
  })
}
