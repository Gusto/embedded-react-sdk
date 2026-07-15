import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './index.module.css'

function WorkflowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <rect x="18" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <rect x="10" y="17" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10 7H18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M6 11V14C6 15.1 6.9 16 8 16H10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M22 11V14C22 15.1 21.1 16 20 16H18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8.5 8.5C6.8 10.2 5.75 12.5 5.75 14C5.75 15.5 6.8 17.8 8.5 19.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M19.5 8.5C21.2 10.2 22.25 12.5 22.25 14C22.25 15.5 21.2 17.8 19.5 19.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M5.5 5.5C2.85 8.15 2 11 2 14C2 17 2.85 19.85 5.5 22.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M22.5 5.5C25.15 8.15 26 11 26 14C26 17 25.15 19.85 22.5 22.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M14 2V5M14 23V26M2 14H5M23 14H26M5.1 5.1L7.2 7.2M20.8 20.8L22.9 22.9M22.9 5.1L20.8 7.2M7.2 20.8L5.1 22.9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

const INSTALL_COMMAND = 'npm install @gusto/embedded-react-sdk'

function InstallSnippet() {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable; leave state untouched
    }
  }, [])

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={styles.heroInstall}
      aria-label={copied ? 'Copied install command' : 'Copy install command'}
    >
      <code>{INSTALL_COMMAND}</code>
      <span className={clsx(styles.heroInstallIcon, copied && styles.heroInstallIconCopied)}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
    </button>
  )
}

interface BigFeature {
  title: string
  description: string
  to: string
  Icon: (props: { className?: string }) => ReactNode
}

interface SmallFeature {
  title: string
  description: string
  to: string
}

const bigFeatures: BigFeature[] = [
  {
    title: 'Pre-built Workflows',
    description:
      'Complete multi-step flows for employee onboarding, payroll, contractor management, and more — ready to drop into your app.',
    to: '/docs/guides/workflows-overview',
    Icon: WorkflowIcon,
  },
  {
    title: 'Event Handling',
    description:
      'Every component emits typed events for user actions and API responses. Drive navigation, analytics, and side effects.',
    to: '/docs/guides/integration-guide/event-handling',
    Icon: SignalIcon,
  },
  {
    title: 'Hooks',
    description:
      'Headless React hooks that manage API calls, validation, and state — wire them into your own UI when you need full control.',
    to: '/docs/reference/hooks',
    Icon: GearIcon,
  },
]

const smallFeatures: SmallFeature[] = [
  {
    title: 'Component Adapter',
    description:
      "Swap the SDK's default components for your own so every rendered control matches your design system.",
    to: '/docs/guides/component-adapter',
  },
  {
    title: 'Theming',
    description:
      'Re-skin every SDK component at once via theme tokens — colors, border radii, focus rings, fonts.',
    to: '/docs/guides/theming',
  },
  {
    title: 'Translations',
    description:
      'Override any SDK string — field labels, descriptions, validation messages — by passing a partial dictionary.',
    to: '/docs/guides/integration-guide/translation',
  },
  {
    title: 'Bring your own data',
    description:
      "Pre-fill SDK forms with values you already have so users don't re-type information you collected elsewhere.",
    to: '/docs/guides/integration-guide/providing-your-own-data',
  },
]

function HeroPreview() {
  return (
    <div className={styles.heroPreview} aria-hidden="true">
      <div className={styles.previewCardBack}>
        <div className={styles.previewBackLabel}>Pay run · Mar 14</div>
        <div className={styles.previewBackRow}>
          <span>Gross pay</span>
          <span>$4,250.00</span>
        </div>
        <div className={styles.previewBackRow}>
          <span>Federal tax</span>
          <span>−$680.00</span>
        </div>
        <div className={clsx(styles.previewBackRow, styles.previewBackRowTotal)}>
          <span>Net pay</span>
          <span>$3,420.00</span>
        </div>
      </div>
      <div className={styles.previewCardFront}>
        <div className={styles.previewHeader}>
          <span className={styles.previewTitle}>Add an employee</span>
          <div className={styles.previewSteps}>
            <span className={clsx(styles.previewStep, styles.previewStepDone)} />
            <span className={clsx(styles.previewStep, styles.previewStepActive)} />
            <span className={styles.previewStep} />
            <span className={styles.previewStep} />
          </div>
        </div>
        <div className={styles.previewFields}>
          <div className={styles.previewField}>
            <label>First name</label>
            <div className={styles.previewInput}>Maya</div>
          </div>
          <div className={styles.previewField}>
            <label>Last name</label>
            <div className={styles.previewInput}>Chen</div>
          </div>
          <div className={styles.previewField}>
            <label>Date of birth</label>
            <div className={styles.previewInput}>1991-04-22</div>
          </div>
        </div>
        <div className={styles.previewFooter}>
          <span className={styles.previewBack}>Back</span>
          <span className={styles.previewContinue}>Continue</span>
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.heroEffects} aria-hidden="true">
        <div className={styles.heroSpot1} />
        <div className={styles.heroSpot2} />
        <div className={styles.heroSpot3} />
        <div className={styles.heroGridOverlay} />
      </div>
      <div className={styles.heroInner}>
        <div className={styles.heroText}>
          <h1 className={styles.heroBrand}>
            <span className={styles.heroSdkLabel}>
              Bring <span className={styles.heroAccent}>payroll</span> to your product.
            </span>
          </h1>
          <p className={styles.heroTagline}>
            A React component library for building embedded payroll experiences on top of the Gusto
            Embedded API.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.heroPrimary} to="/docs/getting-started">
              Get Started
            </Link>
            <Link className={styles.heroSecondary} to="/docs/">
              Learn More
            </Link>
          </div>
          <InstallSnippet />
        </div>
        <HeroPreview />
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className={styles.features} aria-labelledby="features-heading">
      <div className={styles.featuresInner}>
        <header className={styles.featuresHeader}>
          <h2 id="features-heading" className={styles.featuresHeading}>
            Build it <span className={styles.heroAccent}>your way</span>.
          </h2>
          <p className={styles.featuresIntro}>Everything you need to ship.</p>
        </header>
        <div className={styles.featuresBigGrid}>
          {bigFeatures.map(({ title, description, to, Icon }) => (
            <Link key={title} to={to} className={styles.featureCard}>
              <div className={styles.featureIconBadge}>
                <Icon className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDescription}>{description}</p>
            </Link>
          ))}
        </div>
        <div className={styles.featuresSmallGrid}>
          {smallFeatures.map(({ title, description, to }) => (
            <Link key={title} to={to} className={styles.featureCardSmall}>
              <h3 className={styles.featureSmallTitle}>{title}</h3>
              <p className={styles.featureSmallDescription}>{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext()

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
    </Layout>
  )
}
