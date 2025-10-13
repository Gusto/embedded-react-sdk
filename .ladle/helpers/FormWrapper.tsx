import { action } from '@ladle/react'
import type React from 'react'
import { useEffect } from 'react'
import type { DefaultValues } from 'react-hook-form'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import styles from './FormWrapper.module.scss'

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

  // Use useWatch hook instead of methods.watch for React Compiler compatibility
  const watchedValues = useWatch({ control: methods.control })

  // Log form state changes using Ladle action
  useEffect(() => {
    action(actionName)({
      values: watchedValues,
      errors: methods.formState.errors,
      touchedFields: methods.formState.touchedFields,
      dirtyFields: methods.formState.dirtyFields,
      isDirty: methods.formState.isDirty,
      isValid: methods.formState.isValid,
    })
  }, [
    watchedValues,
    methods.formState.errors,
    methods.formState.touchedFields,
    methods.formState.dirtyFields,
    methods.formState.isDirty,
    methods.formState.isValid,
    actionName,
  ])

  const handleSubmit = (data: T) => {
    action('Form submitted')(data)
  }

  return (
    <FormProvider {...methods}>
      <form className={styles.form} onSubmit={methods.handleSubmit(handleSubmit)}>
        {children}
      </form>
    </FormProvider>
  )
}
