import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { useMemo } from 'react'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import type { HookError, HookFieldError } from './types'

const DEFAULT_TITLE = 'There was a problem with your submission'
const UNKNOWN_DESCRIPTION = 'Unknown Error'

function toFieldErrors(fieldErrors: EntityErrorObject[] | null): HookFieldError[] {
  if (!fieldErrors?.length) return []
  return fieldErrors.map(fe => ({
    field: fe.errorKey,
    message: fe.message ?? '',
  }))
}

function toDescription(error: Error): string {
  if (error instanceof SDKValidationError) return error.pretty()
  return error.message || UNKNOWN_DESCRIPTION
}

function toRawErrors(error: Error | null): unknown[] {
  if (!error) return []
  if (error instanceof UnprocessableEntityErrorObject && Array.isArray(error.errors)) {
    return [error, ...error.errors]
  }
  return [error]
}

function normalizeHookErrors(
  submitError: Error | null,
  fieldErrors: EntityErrorObject[] | null,
  queryError: Error | null,
): HookError | null {
  if (!submitError && !queryError && !fieldErrors?.length) return null

  const normalizedFieldErrors = toFieldErrors(fieldErrors)
  const errors = [...toRawErrors(submitError), ...toRawErrors(queryError)]

  if (submitError) {
    return {
      title: DEFAULT_TITLE,
      description: normalizedFieldErrors.length > 0 ? '' : toDescription(submitError),
      fieldErrors: normalizedFieldErrors,
      errors,
    }
  }

  if (normalizedFieldErrors.length > 0) {
    return {
      title: DEFAULT_TITLE,
      description: '',
      fieldErrors: normalizedFieldErrors,
      errors,
    }
  }

  if (queryError) {
    return {
      title: DEFAULT_TITLE,
      description: toDescription(queryError),
      fieldErrors: [],
      errors,
    }
  }

  return null
}

export function useHookError(
  submitError: Error | null,
  fieldErrors: EntityErrorObject[] | null,
  queryError: Error | null,
): HookError | null {
  return useMemo(
    () => normalizeHookErrors(submitError, fieldErrors, queryError),
    [submitError, fieldErrors, queryError],
  )
}
