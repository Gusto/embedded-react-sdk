import { Alert } from './Alert'
import styles from './Alert.module.scss'

export default {
  title: 'UI/Components/Alert',
}

export const Info = () => (
  <Alert variant="info" label="This is an info alert">
    <p>This is some additional information about the alert.</p>
  </Alert>
)

export const InfoWithoutChildren = () => (
  <Alert variant="info" label="This is an info alert without additional content" />
)

export const Success = () => (
  <Alert variant="success" label="This is a success alert">
    <p>Your action was completed successfully!</p>
    <p>You can now proceed with the next steps.</p>
  </Alert>
)

export const SuccessWithoutChildren = () => (
  <Alert variant="success" label="Success! Your action was completed." />
)

export const Warning = () => (
  <Alert variant="warning" label="This is a warning alert">
    <p>Please be careful with this action.</p>
    <ul>
      <li>This action cannot be undone</li>
      <li>It will affect multiple records</li>
      <li>Please review before proceeding</li>
    </ul>
  </Alert>
)

export const WarningWithoutChildren = () => (
  <Alert variant="warning" label="Warning: This action cannot be undone" />
)

export const Error = () => (
  <Alert variant="error" label="This is an error alert">
    <p>Something went wrong. Please try again.</p>
    <p>If the problem persists, contact support.</p>
  </Alert>
)

export const ErrorWithoutChildren = () => (
  <Alert variant="error" label="Error: Something went wrong" />
)

export const WithCustomIcon = () => (
  <Alert
    variant="info"
    label="This is an alert with a custom icon"
    icon={() => (
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
    )}
  >
    <p>This alert uses a custom icon instead of the default one.</p>
  </Alert>
)

export const AllVariants = () => (
  <div className={styles.grid}>
    <div className={styles.variantGroup}>
      <h3>Info Alerts</h3>
      <Alert variant="info" label="Info Alert with content">
        <p>This is an info alert with additional content.</p>
      </Alert>
      <Alert variant="info" label="Info Alert without content" />
    </div>

    <div className={styles.variantGroup}>
      <h3>Success Alerts</h3>
      <Alert variant="success" label="Success Alert with content">
        <p>This is a success alert with additional content.</p>
      </Alert>
      <Alert variant="success" label="Success Alert without content" />
    </div>

    <div className={styles.variantGroup}>
      <h3>Warning Alerts</h3>
      <Alert variant="warning" label="Warning Alert with content">
        <p>This is a warning alert with additional content.</p>
      </Alert>
      <Alert variant="warning" label="Warning Alert without content" />
    </div>

    <div className={styles.variantGroup}>
      <h3>Error Alerts</h3>
      <Alert variant="error" label="Error Alert with content">
        <p>This is an error alert with additional content.</p>
      </Alert>
      <Alert variant="error" label="Error Alert without content" />
    </div>
  </div>
)
