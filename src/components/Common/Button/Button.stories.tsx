import type { Story } from '@ladle/react'
import { Button } from '@/components/Common/UI/Button/Button'

// Adding a meta object for title
export default {
  title: 'UI/Components/Button', // Creates nesting structure for UI components
}

// Primary button stories
export const Primary: Story = () => (
  <Button variant="primary" onClick={() => {}}>
    Primary Button
  </Button>
)

// Secondary button stories
export const Secondary: Story = () => (
  <Button variant="secondary" onClick={() => {}}>
    Secondary Button
  </Button>
)

// Tertiary button stories
export const Tertiary: Story = () => (
  <Button variant="tertiary" onClick={() => {}}>
    Tertiary Button
  </Button>
)

// Link button stories
export const Link: Story = () => (
  <Button variant="link" onClick={() => {}}>
    Link Button
  </Button>
)

// Icon button stories
export const Icon: Story = () => (
  <Button variant="icon" onClick={() => {}}>
    Icon
  </Button>
)

// Loading state stories
export const PrimaryLoading: Story = () => (
  <Button variant="primary" isLoading={true} onClick={() => {}}>
    Loading...
  </Button>
)

// Error state stories
export const PrimaryError: Story = () => (
  <Button variant="primary" isError={true} onClick={() => {}}>
    Error
  </Button>
)

// Disabled state stories
export const PrimaryDisabled: Story = () => (
  <Button variant="primary" isDisabled={true} onClick={() => {}}>
    Disabled
  </Button>
)

// Secondary loading state
export const SecondaryLoading: Story = () => (
  <Button variant="secondary" isLoading={true} onClick={() => {}}>
    Loading...
  </Button>
)

// Secondary error state
export const SecondaryError: Story = () => (
  <Button variant="secondary" isError={true} onClick={() => {}}>
    Error
  </Button>
)

// Secondary disabled state
export const SecondaryDisabled: Story = () => (
  <Button variant="secondary" isDisabled={true} onClick={() => {}}>
    Disabled
  </Button>
)

// Tertiary loading state
export const TertiaryLoading: Story = () => (
  <Button variant="tertiary" isLoading={true} onClick={() => {}}>
    Loading...
  </Button>
)

// Tertiary error state
export const TertiaryError: Story = () => (
  <Button variant="tertiary" isError={true} onClick={() => {}}>
    Error
  </Button>
)

// Tertiary disabled state
export const TertiaryDisabled: Story = () => (
  <Button variant="tertiary" isDisabled={true} onClick={() => {}}>
    Disabled
  </Button>
)

// Link loading state
export const LinkLoading: Story = () => (
  <Button variant="link" isLoading={true} onClick={() => {}}>
    Loading...
  </Button>
)

// Link error state
export const LinkError: Story = () => (
  <Button variant="link" isError={true} onClick={() => {}}>
    Error
  </Button>
)

// Link disabled state
export const LinkDisabled: Story = () => (
  <Button variant="link" isDisabled={true} onClick={() => {}}>
    Disabled
  </Button>
)
