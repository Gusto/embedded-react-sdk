import { Badge } from '../Badge/Badge'
import styles from './BannerStories.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import IconFast from '@/assets/icons/icon-zap-fast.svg?react'

export default {
  title: 'UI/Components/Banner',
}

export const Error = () => {
  const Components = useComponentContext()
  return (
    <Components.Banner
      status="error"
      title="Submission failed: You have exceeded the limit at which you can process 2-day payroll."
    >
      <Components.Text>
        Payroll can still be funded by selecting one of the options below. The selected funding
        method will only be used for this cycle and will not apply to future payroll.
      </Components.Text>
      <div className={styles.actions}>
        <Components.Button variant="secondary">Learn more</Components.Button>
        <Components.Button>View changes</Components.Button>
      </div>
    </Components.Banner>
  )
}

export const ErrorWithOptions = () => {
  const Components = useComponentContext()
  return (
    <Components.Banner
      status="error"
      title="Submission failed: You have exceeded the limit at which you can process 2-day payroll."
    >
      <Components.Text>
        Payroll can still be funded by selecting one of the options below. The selected funding
        method will only be used for this cycle and will not apply to future payroll.
      </Components.Text>
      <div className={styles.options}>
        <Components.RadioGroup
          label="Funding options"
          shouldVisuallyHideLabel
          options={[
            {
              label: (
                <span className={styles.optionLabel}>
                  Wire funds{' '}
                  <Badge status="success">
                    <IconFast aria-hidden /> Fastest
                  </Badge>
                  <Badge status="info" className={styles.transparentBadge}>
                    Employee Pay Date: Aug 13, 2025
                  </Badge>
                </span>
              ),
              value: 'wire',
              description:
                'Pay your employees on time by sending a wire transfer. We will provide instructions on the next step.',
            },
            {
              label: (
                <span className={styles.optionLabel}>
                  Switch to 4-day direct deposit
                  <Badge status="info" className={styles.transparentBadge}>
                    Employee Pay Date: Aug 13, 2025
                  </Badge>
                </span>
              ),
              value: 'direct-deposit',
              description:
                'Delay your employees pay date by four days and process using regular debits.',
            },
          ]}
          value="wire"
          onChange={() => {}}
        />
      </div>
    </Components.Banner>
  )
}

export const Warning = () => {
  const Components = useComponentContext()
  return (
    <Components.Banner
      status="warning"
      title="Submission failed: You have exceeded the limit at which you can process 2-day payroll."
    >
      <Components.Text>
        Payroll can still be funded by selecting one of the options below. The selected funding
        method will only be used for this cycle and will not apply to future payroll.
      </Components.Text>
      <div className={styles.actions}>
        <Components.Button variant="secondary">Learn more</Components.Button>
        <Components.Button>View changes</Components.Button>
      </div>
    </Components.Banner>
  )
}

export const WarningWithOptions = () => {
  const Components = useComponentContext()
  return (
    <Components.Banner
      status="warning"
      title="Submission failed: You have exceeded the limit at which you can process 2-day payroll."
    >
      <Components.Text>
        Payroll can still be funded by selecting one of the options below. The selected funding
        method will only be used for this cycle and will not apply to future payroll.
      </Components.Text>
      <div className={styles.options}>
        <Components.RadioGroup
          label="Funding options"
          shouldVisuallyHideLabel
          options={[
            {
              label: (
                <span className={styles.optionLabel}>
                  Wire funds{' '}
                  <Badge status="success">
                    <IconFast aria-hidden /> Fastest
                  </Badge>
                  <Badge status="info" className={styles.transparentBadge}>
                    Employee Pay Date: Aug 13, 2025
                  </Badge>
                </span>
              ),
              value: 'wire',
              description:
                'Pay your employees on time by sending a wire transfer. We will provide instructions on the next step.',
            },
            {
              label: (
                <span className={styles.optionLabel}>
                  Switch to 4-day direct deposit
                  <Badge status="info" className={styles.transparentBadge}>
                    Employee Pay Date: Aug 13, 2025
                  </Badge>
                </span>
              ),
              value: 'direct-deposit',
              description:
                'Delay your employees pay date by four days and process using regular debits.',
            },
          ]}
          value="wire"
          onChange={() => {}}
        />
      </div>
      <div className={styles.actions}>
        <Components.Button variant="secondary">Learn more</Components.Button>
        <Components.Button>View changes</Components.Button>
      </div>
    </Components.Banner>
  )
}

export const AllVariants = () => {
  const Components = useComponentContext()
  return (
    <div className={styles.grid}>
      <div className={styles.variantGroup}>
        <Components.Heading as="h3" styledAs="h3">
          Error Banners
        </Components.Heading>
        <Components.Banner
          status="error"
          title="Submission failed: You have exceeded the limit at which you can process 2-day payroll."
        >
          <Components.Text>
            Payroll can still be funded by selecting one of the options below.
          </Components.Text>
        </Components.Banner>
      </div>

      <div className={styles.variantGroup}>
        <Components.Heading as="h3" styledAs="h3">
          Warning Banners
        </Components.Heading>
        <Components.Banner status="warning" title="Action required">
          <Components.Text>Please complete your profile to continue.</Components.Text>
        </Components.Banner>
      </div>
    </div>
  )
}
