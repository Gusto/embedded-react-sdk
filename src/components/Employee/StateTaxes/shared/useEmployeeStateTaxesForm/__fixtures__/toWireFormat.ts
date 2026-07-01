import type { EmployeeStateTaxesList } from '@gusto/embedded-api-v-2026-02-01/models/components/employeestatetaxeslist'

interface WireAnswer {
  value: unknown
  valid_from: string | undefined
  valid_up_to: string | null
}

interface WireOption {
  value?: unknown
  label: string
}

interface WireQuestion {
  is_question_for_admin_only: boolean
  label: string
  description: string | null
  key: string
  input_question_format: { type: string; options?: WireOption[] }
  answers: WireAnswer[]
}

interface WireState {
  employee_uuid: string | undefined
  state: string | undefined
  file_new_hire_report: boolean | null | undefined
  is_work_state: boolean | undefined
  questions: WireQuestion[]
}

/**
 * Converts a camelCase typed `EmployeeStateTaxesList[]` fixture back to the
 * snake_case wire shape MSW handlers serve. Mirrors the SDK's outbound→
 * inbound transformation so the same fixture drives both unit tests and
 * MSW-backed component tests.
 */
export function toWireStateTaxes(taxes: EmployeeStateTaxesList[]): WireState[] {
  return taxes.map(state => ({
    employee_uuid: state.employeeUuid,
    state: state.state,
    file_new_hire_report: state.fileNewHireReport,
    is_work_state: state.isWorkState,
    questions: (state.questions ?? []).map(question => ({
      is_question_for_admin_only: question.isQuestionForAdminOnly,
      label: question.label,
      description: question.description,
      key: question.key,
      input_question_format: question.inputQuestionFormat,
      answers: question.answers.map(answer => ({
        value: answer.value,
        valid_from: answer.validFrom,
        valid_up_to: answer.validUpTo ?? null,
      })),
    })),
  }))
}
