import { useId } from 'react'

interface UseFieldIdsProps {
  inputId?: string
  errorMessage?: string
  errorMessageId?: string
  description?: React.ReactNode
  descriptionId?: string
  ariaDescribedBy?: string
}

export function useFieldIds({
  inputId: providedInputId,
  errorMessage,
  errorMessageId: providedErrorMessageId,
  description,
  descriptionId: providedDescriptionId,
  ariaDescribedBy: providedAriaDescribedBy,
}: UseFieldIdsProps) {
  const generatedInputId = useId()
  const generatedErrorMessageId = useId()
  const generatedDescriptionId = useId()

  const inputId = providedInputId || `input-${generatedInputId}`
  const errorMessageId = providedErrorMessageId || `error-message-${generatedErrorMessageId}`
  const descriptionId = providedDescriptionId || `description-${generatedDescriptionId}`

  return {
    inputId,
    errorMessageId,
    descriptionId,
    ariaDescribedBy: [
      description ? descriptionId : null,
      errorMessage ? errorMessageId : null,
      providedAriaDescribedBy,
    ]
      .filter(Boolean)
      .join(' '),
  }
}
