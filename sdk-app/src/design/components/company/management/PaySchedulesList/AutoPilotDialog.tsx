import { useEffect, useState } from 'react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

export interface AutoPilotDialogProps {
  isOpen: boolean
  scheduleName: string
  autoPilotEnabled: boolean
  onClose: () => void
  onSave: (enabled: boolean) => void
}

export function AutoPilotDialog({
  isOpen,
  scheduleName,
  autoPilotEnabled,
  onClose,
  onSave,
}: AutoPilotDialogProps) {
  const Components = useComponentContext()
  const [nextEnabled, setNextEnabled] = useState(autoPilotEnabled)

  useEffect(() => {
    if (isOpen) {
      setNextEnabled(autoPilotEnabled)
    }
  }, [isOpen, autoPilotEnabled])

  return (
    <Components.Dialog
      isOpen={isOpen}
      onClose={onClose}
      onPrimaryActionClick={() => {
        onSave(nextEnabled)
      }}
      title={`AutoPilot — ${scheduleName}`}
      primaryActionLabel="Save"
      closeActionLabel="Cancel"
    >
      <Flex flexDirection="column" gap={16}>
        <Components.Text>
          AutoPilot takes care of payroll for you. Payrolls are editable until 1 day before your pay
          deadline and funds are debited on your pay deadline.
        </Components.Text>
        <Components.Switch label="Enable AutoPilot" value={nextEnabled} onChange={setNextEnabled} />
      </Flex>
    </Components.Dialog>
  )
}
