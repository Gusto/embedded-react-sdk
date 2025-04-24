import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

interface SignatureFormActionsProps {
  onBack?: () => void
  backLabel: string
  submitLabel: string
  isLoading?: boolean
}

export function SignatureFormActions({
  onBack,
  backLabel,
  submitLabel,
  isLoading = false,
}: SignatureFormActionsProps) {
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      {onBack && (
        <Components.Button variant="secondary" type="button" onClick={onBack}>
          {backLabel}
        </Components.Button>
      )}
      <Components.Button type="submit" isLoading={isLoading}>
        {submitLabel}
      </Components.Button>
    </ActionsLayout>
  )
}
