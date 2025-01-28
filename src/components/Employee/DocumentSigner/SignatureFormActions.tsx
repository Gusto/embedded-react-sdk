import { useTranslation } from 'react-i18next'

import { ActionsLayout, Button } from '@/components/Common'
import { useDocumentSigner } from '@/components/Employee/DocumentSigner/DocumentSigner'

export function SignatureFormActions() {
  const { handleBack, isPending } = useDocumentSigner()
  const { t } = useTranslation('Employee.DocumentSigner')

  return (
    <ActionsLayout>
      <Button variant="secondary" type="button" onPress={handleBack}>
        {t('backCta')}
      </Button>
      <Button type="submit" isLoading={isPending}>
        {t('signFormCta')}
      </Button>
    </ActionsLayout>
  )
}
