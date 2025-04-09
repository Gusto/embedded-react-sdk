import { action } from '@ladle/react'
import type React from 'react'
import { useEffect } from 'react'
import type { DefaultValues } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'

// Use unknown instead of any for better type safety
type FormWrapperProps<T extends Record<string, unknown>> = {
  children: React.ReactNode
  defaultValues?: Partial<T>
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all'
  actionName?: string
}

export const FormWrapper = <T extends Record<string, unknown> = Record<string, unknown>>({
  children,
  defaultValues = {} as Partial<T>,
  mode = 'onTouched',
  actionName = 'Form State Changed',
}: FormWrapperProps<T>) => {
  const methods = useForm<T>({
    defaultValues: defaultValues as DefaultValues<T>,
    mode,
  })

  // Log form state changes using Ladle action
  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      action(actionName)({
        values: value,
        name,
        type,
        errors: methods.formState.errors,
        touchedFields: methods.formState.touchedFields,
        dirtyFields: methods.formState.dirtyFields,
        isDirty: methods.formState.isDirty,
        isValid: methods.formState.isValid,
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [methods, actionName])

  return (
    <FormProvider {...methods}>
      <div>{children}</div>
    </FormProvider>
  )
}
