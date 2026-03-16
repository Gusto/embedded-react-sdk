interface ComposableFormMethods {
  trigger(): Promise<boolean>
  setFocus(name: string): void
  getValues(): Record<string, unknown>
  getFieldState(name: string): { invalid: boolean }
}

interface ComposableForm {
  hookFormInternals: {
    formMethods: ComposableFormMethods
  }
}

export function composeSubmitHandler(forms: ComposableForm[], onAllValid: () => Promise<void>) {
  return async () => {
    const validationResults = await Promise.all(
      forms.map(form => form.hookFormInternals.formMethods.trigger()),
    )

    if (!validationResults.every(Boolean)) {
      for (const form of forms) {
        const fieldNames = Object.keys(form.hookFormInternals.formMethods.getValues())
        for (const fieldName of fieldNames) {
          const { invalid } = form.hookFormInternals.formMethods.getFieldState(fieldName)
          if (invalid) {
            form.hookFormInternals.formMethods.setFocus(fieldName)
            return
          }
        }
      }
      return
    }

    await onAllValid()
  }
}
