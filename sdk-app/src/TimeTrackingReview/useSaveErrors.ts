import { useState } from 'react'

export function useSaveErrors() {
  const [isShown, setIsShown] = useState(false)
  const fieldError = (message: string | undefined) =>
    isShown && message ? { isInvalid: true, errorMessage: message } : {}
  return {
    isShown,
    fieldError,
    attempt: (hasErrors: boolean, save: () => void) => {
      if (hasErrors) {
        setIsShown(true)
        return
      }
      save()
    },
  }
}
