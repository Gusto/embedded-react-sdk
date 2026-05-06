import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'

/**
 * Lowercase post-mapping variant that decides which UI primitive renders
 * a given state-tax question. Mirrors the existing `QuestionInput` switch
 * in `src/components/Common/TaxInputs/TaxInputs.tsx`, narrowed to the
 * cases that apply to the employee state-tax endpoint.
 */
export type StateTaxQuestionVariant = 'select' | 'radio' | 'text' | 'number' | 'currency' | 'date'

/**
 * Per-key mapping rules that promote API `Select`s to other variants for
 * UX reasons.
 *
 * `file_new_hire_report` is internally a Radio per the canonical Ruby
 * helper (`FileNewHireReportHelper.display_field_for_file_new_hire_report`),
 * but the converter at
 * `convert_employee_state_field_to_gws_flow_questions.rb` emits it as
 * `Select` because there's no Radio output type. The existing component at
 * `src/components/Employee/StateTaxes/StateForm.tsx` intends to override
 * `questionType` to `'Radio'` for this question but the comparison checks
 * `'fileNewHireReport'` (camelCase) against an API `key` of
 * `'file_new_hire_report'` (snake_case), so the override never fires today.
 *
 * This map fixes that bug and surfaces it as a Radio in the new hook.
 */
const SELECT_TO_RADIO_PROMOTION_KEYS = new Set<string>(['file_new_hire_report'])

/**
 * Resolves a question's UI variant from its API shape and per-key promotion
 * rules. Unknown wire types fall through to `text` to mirror the existing
 * `QuestionInput` default branch.
 */
export function getQuestionVariant(question: EmployeeStateTaxQuestion): StateTaxQuestionVariant {
  if (SELECT_TO_RADIO_PROMOTION_KEYS.has(question.key)) {
    return 'radio'
  }

  switch (question.inputQuestionFormat.type.toLowerCase()) {
    case 'select':
      return 'select'
    case 'number':
      return 'number'
    case 'currency':
      return 'currency'
    case 'date':
      return 'date'
    case 'text':
      return 'text'
    default:
      return 'text'
  }
}
