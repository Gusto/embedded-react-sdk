import { ActionsLayout, Button } from '@/components/Common'

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
  return (
    <ActionsLayout>
      {onBack && (
        <Button variant="secondary" type="button" onPress={onBack}>
          {backLabel}
        </Button>
      )}
      <Button type="submit" isLoading={isLoading}>
        {submitLabel}
      </Button>
    </ActionsLayout>
  )
}
