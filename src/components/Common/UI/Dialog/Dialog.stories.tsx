import { useState } from 'react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Dialog',
}

export const Default = () => {
  const Components = useComponentContext()
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <Components.Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open Dialog
      </Components.Button>
      <Components.Dialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        onPrimaryActionClick={() => {
          alert('Primary action clicked!')
          setIsOpen(false)
        }}
        primaryActionLabel="Continue"
        closeActionLabel="Cancel"
        title="Confirm Action"
      >
        <Components.Text>Are you sure you want to continue with this action?</Components.Text>
      </Components.Dialog>
    </>
  )
}

export const Destructive = () => {
  const Components = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Components.Button
        variant="error"
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Delete Item
      </Components.Button>
      <Components.Dialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        onPrimaryActionClick={() => {
          alert('Item deleted!')
          setIsOpen(false)
        }}
        isDestructive
        primaryActionLabel="Delete"
        closeActionLabel="Cancel"
        title="Delete Item"
      >
        <Components.Text>
          Are you sure you want to delete this item? This action cannot be undone.
        </Components.Text>
      </Components.Dialog>
    </>
  )
}

export const CustomButtonLabels = () => {
  const Components = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Components.Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Save Changes
      </Components.Button>
      <Components.Dialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        onPrimaryActionClick={() => {
          alert('Changes saved!')
          setIsOpen(false)
        }}
        primaryActionLabel="Save Now"
        closeActionLabel="Discard Changes"
        title="Unsaved Changes"
      >
        <Components.Text>
          You have unsaved changes. Would you like to save them before continuing?
        </Components.Text>
      </Components.Dialog>
    </>
  )
}

export const BackdropClickEnabled = () => {
  const Components = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Components.Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Dialog with Backdrop Close
      </Components.Button>
      <Components.Dialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        onPrimaryActionClick={() => {
          alert('Action completed!')
          setIsOpen(false)
        }}
        shouldCloseOnBackdropClick={true}
        primaryActionLabel="OK"
        closeActionLabel="Cancel"
        title="Click backdrop to close"
      >
        <Components.Text>
          This dialog can be closed by clicking the backdrop area outside the dialog content.
        </Components.Text>
      </Components.Dialog>
    </>
  )
}
