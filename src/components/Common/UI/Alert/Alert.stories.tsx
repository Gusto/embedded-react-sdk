import styles from './Alert.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Alert',
}

export const Info = () => {
  const Components = useComponentContext()
  return (
    <Components.Alert status="info" label="This is an info alert">
      <p>This is additional content for the info alert.</p>
    </Components.Alert>
  )
}

export const InfoWithoutChildren = () => {
  const Components = useComponentContext()
  return <Components.Alert status="info" label="This is an info alert without additional content" />
}

export const Success = () => {
  const Components = useComponentContext()
  return (
    <Components.Alert status="success" label="This is a success alert">
      <p>This is additional content for the success alert.</p>
      <p>You can add multiple paragraphs of content.</p>
    </Components.Alert>
  )
}

export const SuccessWithoutChildren = () => {
  const Components = useComponentContext()
  return <Components.Alert status="success" label="Success! Your action was completed." />
}

export const Warning = () => {
  const Components = useComponentContext()
  return (
    <Components.Alert status="warning" label="This is a warning alert">
      <p>This is additional content for the warning alert.</p>
      <p>You can add multiple paragraphs of content.</p>
    </Components.Alert>
  )
}

export const WarningWithoutChildren = () => {
  const Components = useComponentContext()
  return <Components.Alert status="warning" label="Warning: This action cannot be undone" />
}

export const Error = () => {
  const Components = useComponentContext()
  return (
    <Components.Alert status="error" label="This is an error alert">
      <p>This is additional content for the error alert.</p>
      <p>You can add multiple paragraphs of content.</p>
    </Components.Alert>
  )
}

export const ErrorWithoutChildren = () => {
  const Components = useComponentContext()
  return <Components.Alert status="error" label="Error: Something went wrong" />
}

export const WithCustomIcon = () => {
  const Components = useComponentContext()
  return (
    <Components.Alert
      status="info"
      label="This is an alert with a custom icon"
      icon={
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
            fill="currentColor"
          />
        </svg>
      }
    >
      <p>This alert uses a custom icon instead of the default one.</p>
    </Components.Alert>
  )
}

export const AllVariants = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <h3>Info Alerts</h3>
        <Components.Alert status="info" label="Info Alert with content">
          <p>This is additional content for the info alert.</p>
        </Components.Alert>
        <Components.Alert status="info" label="Info Alert without content" />
      </div>

      <div className={styles.variantGroup}>
        <h3>Success Alerts</h3>
        <Components.Alert status="success" label="Success Alert with content">
          <p>This is additional content for the success alert.</p>
        </Components.Alert>
        <Components.Alert status="success" label="Success Alert without content" />
      </div>

      <div className={styles.variantGroup}>
        <h3>Warning Alerts</h3>
        <Components.Alert status="warning" label="Warning Alert with content">
          <p>This is additional content for the warning alert.</p>
        </Components.Alert>
        <Components.Alert status="warning" label="Warning Alert without content" />
      </div>

      <div className={styles.variantGroup}>
        <h3>Error Alerts</h3>
        <Components.Alert status="error" label="Error Alert with content">
          <p>This is additional content for the error alert.</p>
        </Components.Alert>
        <Components.Alert status="error" label="Error Alert without content" />
      </div>
    </div>
  )
}
