import { useState } from 'react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Modal',
}

export const BasicModal = () => {
  const Components = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Components.Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open Modal
      </Components.Button>
      <Components.Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        footer={
          <Components.Button
            onClick={() => {
              setIsOpen(false)
            }}
          >
            Close
          </Components.Button>
        }
      >
        <Components.Heading as="h2" styledAs="h3">
          Basic Modal
        </Components.Heading>
        <Components.Text>This is a simple modal with content and a footer.</Components.Text>
      </Components.Modal>
    </>
  )
}

export const CustomFooter = () => {
  const Components = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Components.Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open Modal with Custom Footer
      </Components.Button>
      <Components.Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Components.Button
              variant="secondary"
              onClick={() => {
                setIsOpen(false)
              }}
            >
              Cancel
            </Components.Button>
            <Components.Button
              variant="primary"
              onClick={() => {
                alert('Action confirmed!')
                setIsOpen(false)
              }}
            >
              Confirm
            </Components.Button>
          </div>
        }
      >
        <Components.Heading as="h2" styledAs="h3">
          Custom Footer
        </Components.Heading>
        <Components.Text>This modal has a custom footer with multiple buttons.</Components.Text>
      </Components.Modal>
    </>
  )
}

export const LongContent = () => {
  const Components = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Components.Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open Modal with Long Content
      </Components.Button>
      <Components.Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        footer={
          <Components.Button
            onClick={() => {
              setIsOpen(false)
            }}
          >
            Close
          </Components.Button>
        }
      >
        <Components.Heading as="h2" styledAs="h3">
          Modal with Scrolling Content
        </Components.Heading>
        <Components.Text>
          This modal contains a lot of content to demonstrate scrolling behavior when the content
          exceeds the viewport height.
        </Components.Text>
        <Components.Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Components.Text>
        <Components.Text>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </Components.Text>
        <Components.Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Components.Text>
        <Components.Text>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </Components.Text>
        <Components.Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Components.Text>
        <Components.Text>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </Components.Text>
      </Components.Modal>
    </>
  )
}

export const BackdropClick = () => {
  const Components = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Components.Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open Modal (Click Backdrop to Close)
      </Components.Button>
      <Components.Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        shouldCloseOnBackdropClick={true}
        footer={
          <Components.Button
            onClick={() => {
              setIsOpen(false)
            }}
          >
            Close
          </Components.Button>
        }
      >
        <Components.Heading as="h2" styledAs="h3">
          Click Backdrop to Close
        </Components.Heading>
        <Components.Text>
          This modal can be closed by clicking the backdrop area outside the modal content, or by
          pressing the Escape key.
        </Components.Text>
      </Components.Modal>
    </>
  )
}

export const NoFooter = () => {
  const Components = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Components.Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open Modal without Footer
      </Components.Button>
      <Components.Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        shouldCloseOnBackdropClick={true}
      >
        <Components.Heading as="h2" styledAs="h3">
          Modal without Footer
        </Components.Heading>
        <Components.Text>
          This modal has no footer. You can close it by clicking the backdrop or pressing Escape.
        </Components.Text>
      </Components.Modal>
    </>
  )
}
