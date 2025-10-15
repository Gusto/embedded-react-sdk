import styles from './Alert.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Alert',
}

export const Info = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Alert variant="alert" status="info" label="This is an info alert">
          <Components.Text>This is additional content for the info alert.</Components.Text>
        </Components.Alert>
        <Components.Alert variant="banner" status="info" label="This is an info banner">
          <Components.Text>This is additional content for the info banner.</Components.Text>
        </Components.Alert>
      </div>
    </div>
  )
}

export const InfoWithoutChildren = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Alert
          variant="alert"
          status="info"
          label="This is an info alert without additional content"
        />
        <Components.Alert
          variant="banner"
          status="info"
          label="This is an info banner without additional content"
        />
      </div>
    </div>
  )
}

export const Success = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Alert variant="alert" status="success" label="This is a success alert">
          <Components.Text>This is additional content for the success alert.</Components.Text>
        </Components.Alert>
        <Components.Alert variant="banner" status="success" label="This is a success banner">
          <Components.Text>This is additional content for the success banner.</Components.Text>
        </Components.Alert>
      </div>
    </div>
  )
}

export const SuccessWithoutChildren = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Alert
          variant="alert"
          status="success"
          label="Success! Your action was completed."
        />
        <Components.Alert
          variant="banner"
          status="success"
          label="Success! Your action was completed."
        />
      </div>
    </div>
  )
}

export const Warning = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Alert variant="alert" status="warning" label="This is a warning alert">
          <Components.Text>This is additional content for the warning alert.</Components.Text>
        </Components.Alert>
        <Components.Alert variant="banner" status="warning" label="This is a warning banner">
          <Components.Text>This is additional content for the warning banner.</Components.Text>
        </Components.Alert>
      </div>
    </div>
  )
}

export const WarningWithoutChildren = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Alert
          variant="alert"
          status="warning"
          label="Warning: This action cannot be undone"
        />
        <Components.Alert
          variant="banner"
          status="warning"
          label="Warning: This action cannot be undone"
        />
      </div>
    </div>
  )
}

export const Error = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Alert variant="alert" status="error" label="This is an error alert">
          <Components.Text>This is additional content for the error alert.</Components.Text>
        </Components.Alert>
        <Components.Alert variant="banner" status="error" label="This is an error banner">
          <Components.Text>This is additional content for the error banner.</Components.Text>
        </Components.Alert>
      </div>
    </div>
  )
}

export const ErrorWithoutChildren = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Alert variant="alert" status="error" label="Error: Something went wrong" />
        <Components.Alert variant="banner" status="error" label="Error: Something went wrong" />
      </div>
    </div>
  )
}

export const WithCustomIcon = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Alert
          variant="alert"
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
          <Components.Text>
            This alert uses a custom icon instead of the default one.
          </Components.Text>
        </Components.Alert>
        <Components.Alert
          variant="banner"
          status="info"
          label="This is a banner with a custom icon"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_11779_43690)">
                <path
                  d="M10.0003 13.3333V9.99999M10.0003 6.66666H10.0087M1.66699 7.10227V12.8977C1.66699 13.1015 1.66699 13.2034 1.69002 13.2993C1.71043 13.3844 1.7441 13.4657 1.78979 13.5402C1.84133 13.6243 1.91339 13.6964 2.05752 13.8405L6.1598 17.9428C6.30393 18.0869 6.37599 18.159 6.46009 18.2105C6.53465 18.2562 6.61594 18.2899 6.70097 18.3103C6.79687 18.3333 6.89878 18.3333 7.10261 18.3333H12.898C13.1019 18.3333 13.2038 18.3333 13.2997 18.3103C13.3847 18.2899 13.466 18.2562 13.5406 18.2105C13.6247 18.159 13.6967 18.0869 13.8408 17.9428L17.9431 13.8405C18.0873 13.6964 18.1593 13.6243 18.2109 13.5402C18.2565 13.4657 18.2902 13.3844 18.3106 13.2993C18.3337 13.2034 18.3337 13.1015 18.3337 12.8977V7.10227C18.3337 6.89845 18.3337 6.79654 18.3106 6.70063C18.2902 6.6156 18.2565 6.53431 18.2109 6.45975C18.1593 6.37566 18.0873 6.30359 17.9431 6.15947L13.8408 2.05718C13.6967 1.91305 13.6247 1.84099 13.5406 1.78946C13.466 1.74377 13.3847 1.7101 13.2997 1.68968C13.2038 1.66666 13.1019 1.66666 12.898 1.66666H7.10261C6.89878 1.66666 6.79687 1.66666 6.70097 1.68968C6.61594 1.7101 6.53465 1.74377 6.46009 1.78946C6.37599 1.84099 6.30393 1.91305 6.1598 2.05718L2.05752 6.15947C1.91339 6.30359 1.84133 6.37566 1.78979 6.45975C1.7441 6.53431 1.71043 6.6156 1.69002 6.70063C1.66699 6.79654 1.66699 6.89845 1.66699 7.10227Z"
                  stroke="white"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_11779_43690">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          }
        />
      </div>
    </div>
  )
}

export const WithDismiss = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Alert
          variant="alert"
          status="success"
          label="This alert can be dismissed"
          onDismiss={() => {
            alert('Alert dismissed!')
          }}
        >
          <Components.Text>
            Click the X button in the top right to dismiss this alert.
          </Components.Text>
        </Components.Alert>
        <Components.Alert
          variant="banner"
          status="success"
          label="This alert can be dismissed"
          onDismiss={() => {
            alert('Alert dismissed!')
          }}
        >
          <Components.Text>
            Click the X button in the top right to dismiss this alert.
          </Components.Text>
        </Components.Alert>
      </div>
    </div>
  )
}

export const AllVariants = () => {
  const Components = useComponentContext()
  return (
    <>
      <div className={styles.grid}>
        <div className={styles.variantGroup}>
          <h3>Info Alerts</h3>
          <Components.Alert variant="alert" status="info" label="Info Alert with content">
            <Components.Text>This is additional content for the info alert.</Components.Text>
          </Components.Alert>
          <Components.Alert variant="alert" status="info" label="Info Alert without content" />
        </div>

        <div className={styles.variantGroup}>
          <h3>Success Alerts</h3>
          <Components.Alert variant="alert" status="success" label="Success Alert with content">
            <Components.Text>This is additional content for the success alert.</Components.Text>
          </Components.Alert>
          <Components.Alert
            variant="alert"
            status="success"
            label="Success Alert without content"
          />
          <Components.Alert
            variant="alert"
            status="success"
            label="Dismissible Success Alert"
            onDismiss={() => {
              alert('Success alert dismissed!')
            }}
          >
            <Components.Text>
              This success alert can be dismissed by clicking the X button.
            </Components.Text>
          </Components.Alert>
        </div>

        <div className={styles.variantGroup}>
          <h3>Warning Alerts</h3>
          <Components.Alert variant="alert" status="warning" label="Warning Alert with content">
            <Components.Text>This is additional content for the warning alert.</Components.Text>
          </Components.Alert>
          <Components.Alert
            variant="alert"
            status="warning"
            label="Warning Alert without content"
          />
        </div>

        <div className={styles.variantGroup}>
          <h3>Error Alerts</h3>
          <Components.Alert variant="alert" status="error" label="Error Alert with content">
            <Components.Text>This is additional content for the error alert.</Components.Text>
          </Components.Alert>
          <Components.Alert variant="alert" status="error" label="Error Alert without content" />
        </div>
      </div>
      <div className={styles.grid}>
        <div className={styles.variantGroup}>
          <h3>Info Banners</h3>
          <Components.Alert
            variant="banner"
            status="info"
            label="Info Banner with content"
            description="This is a description for the warning alert"
          >
            <Components.Text>This is additional content for the warning alert.</Components.Text>
          </Components.Alert>
          <Components.Alert variant="banner" status="info" label="Info Banner without content" />
        </div>

        <div className={styles.variantGroup}>
          <h3>Success Banners</h3>
          <Components.Alert
            variant="banner"
            status="success"
            label="Success Banner with content"
            description="This is a description for the warning alert"
          >
            <Components.Text>This is additional content for the warning alert.</Components.Text>
          </Components.Alert>
          <Components.Alert
            variant="banner"
            status="success"
            label="Success Banner without content"
          ></Components.Alert>
          <Components.Alert
            variant="banner"
            status="success"
            label="Dismissible Success Banner"
            onDismiss={() => {
              alert('Success banner dismissed!')
            }}
          >
            <Components.Text>
              This success banner can be dismissed by clicking the X button.
            </Components.Text>
          </Components.Alert>
        </div>

        <div className={styles.variantGroup}>
          <h3>Warning Banners</h3>
          <Components.Alert
            variant="banner"
            status="warning"
            label="Warning Banner with content"
            description="This is a description for the warning alert"
          />
          <Components.Alert
            variant="banner"
            status="warning"
            label="Warning Banner without content"
          />
        </div>

        <div className={styles.variantGroup}>
          <h3>Error Banners</h3>
          <Components.Alert
            variant="banner"
            status="error"
            label="Error Banner with content"
            description="This is a description for the error alert"
          />
          <Components.Alert variant="banner" status="error" label="Error Banner without content" />
        </div>
      </div>
    </>
  )
}
