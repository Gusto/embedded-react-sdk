import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './index.module.css';

function WorkflowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <rect x="18" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <rect x="10" y="17" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10 7H18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M6 11V14C6 15.1 6.9 16 8 16H10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M22 11V14C22 15.1 21.1 16 20 16H18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="22" height="22" rx="3" stroke="currentColor" strokeWidth="1.75" />
      <rect x="7" y="7" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="16" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="7" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="16" width="5" height="5" rx="1" fill="currentColor" rx="1" />
    </svg>
  );
}

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8.5 8.5C6.8 10.2 5.75 12.5 5.75 14C5.75 15.5 6.8 17.8 8.5 19.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M19.5 8.5C21.2 10.2 22.25 12.5 22.25 14C22.25 15.5 21.2 17.8 19.5 19.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M5.5 5.5C2.85 8.15 2 11 2 14C2 17 2.85 19.85 5.5 22.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M22.5 5.5C25.15 8.15 26 11 26 14C26 17 25.15 19.85 22.5 22.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M14 2V5M14 23V26M2 14H5M23 14H26M5.1 5.1L7.2 7.2M20.8 20.8L22.9 22.9M22.9 5.1L20.8 7.2M7.2 20.8L5.1 22.9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

interface Feature {
  title: string;
  description: string;
  icon: (props: { className?: string }) => ReactNode;
}

const features: Feature[] = [
  {
    title: 'Pre-built Workflows',
    description:
      'Complete multi-step flows for employee onboarding, payroll, contractor management, and more — ready to drop into your app.',
    icon: WorkflowIcon,
  },
  {
    title: 'Full UI Control',
    description:
      'Use theming, component adapters, and composition to match your design system. Native React components, not iframes.',
    icon: PaletteIcon,
  },
  {
    title: 'Event-driven',
    description:
      'Every component emits typed events for user actions and API responses. Drive navigation, analytics, and side effects.',
    icon: SignalIcon,
  },
  {
    title: 'Built-in Business Logic',
    description:
      'API calls, form validation, error handling, and state transitions are managed internally with React Query, react-hook-form, and Zod.',
    icon: GearIcon,
  },
];

function HeroSection() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroBrand}>
          <img
            src="/img/gusto-logo-dark.svg"
            alt={siteConfig.title}
            className={clsx(styles.heroLogo, styles.heroLogoDark)}
          />
          <img
            src="/img/gusto-logo.svg"
            alt={siteConfig.title}
            className={clsx(styles.heroLogo, styles.heroLogoLight)}
          />
          <span className={styles.heroSdkLabel}>SDK</span>
        </div>
        <p className={styles.heroTagline}>
          A React component library for building embedded payroll experiences on
          top of the Gusto Embedded API.
        </p>
        <div className={styles.heroActions}>
          <Link className={styles.heroPrimary} to="/docs/getting-started/getting-started">
            Get Started
          </Link>
          <Link className={styles.heroSecondary} to="/docs/what-is-the-gep-react-sdk">
            Learn More
          </Link>
        </div>
        <div className={styles.heroInstall}>
          <code>npm install @gusto/embedded-react-sdk</code>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  return (
    <section className={styles.features}>
      <div className={styles.featuresInner}>
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <feature.icon className={styles.featureIcon} />
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinksSection() {
  return (
    <section className={styles.quickLinks}>
      <div className={styles.quickLinksInner}>
        <h2 className={styles.quickLinksTitle}>Explore the SDK</h2>
        <div className={styles.quickLinksGrid}>
          <Link to="/docs/workflows-overview/workflows-overview" className={styles.quickLinkCard}>
            <h3>Workflows</h3>
            <p>
              Employee onboarding, payroll, contractor payments, and more.
            </p>
          </Link>
          <Link to="/docs/integration-guide/integration-guide" className={styles.quickLinkCard}>
            <h3>Integration Guide</h3>
            <p>
              Events, composition, theming, routing, and error handling.
            </p>
          </Link>
          <Link to="/docs/api/companies" className={styles.quickLinkCard}>
            <h3>API Reference</h3>
            <p>
              Full OpenAPI documentation for the Gusto Embedded API.
            </p>
          </Link>
          <Link to="https://github.com/Gusto/embedded-react-sdk" className={styles.quickLinkCard}>
            <h3>GitHub</h3>
            <p>
              Source code, issues, and contributions.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HeroSection />
      <FeaturesSection />
      <QuickLinksSection />
    </Layout>
  );
}
