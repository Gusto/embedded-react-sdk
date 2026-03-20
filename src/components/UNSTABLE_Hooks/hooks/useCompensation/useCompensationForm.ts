import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import type { HookLoadingResult, HookSubmitResult, BaseFormHookReady } from '../../types'

export interface UseCompensationFormParams {
  employeeId?: string
  startDate?: string
}

export interface UseCompensationFormReady extends BaseFormHookReady {
  data: { compensation: Compensation }
  actions: { onSubmit: () => Promise<HookSubmitResult<Compensation> | undefined> }
}

export type UseCompensationFormResult = HookLoadingResult | UseCompensationFormReady

export function useCompensationForm(_params: UseCompensationFormParams): UseCompensationFormResult {
  throw new Error('useCompensationForm is not yet implemented')
}
