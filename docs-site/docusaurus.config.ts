import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import { themes as prismThemes } from 'prism-react-renderer'

const config: Config = {
  title: 'Gusto Embedded',
  tagline: 'Embedded Payroll React SDK Documentation',
  favicon: 'img/favicon.svg',

  // This repo is the source of truth for the docs. The publish-docs.yaml
  // workflow builds this site on each NPM release and pushes the output to
  // Gusto/embedded-sdk-docs, which serves it at sdk.gusto.com. The url
  // below is what gets baked into the sitemap, canonical links, and OG
  // tags, so it must match the production domain.
  url: 'https://sdk.gusto.com',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    format: 'detect',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        docsDir: '../docs',
        ignoreFiles: [/test-fests\//],
        searchBarShortcut: false,
        searchBarShortcutHint: false,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          breadcrumbs: true,
          exclude: ['test-fests/**'],
        },
        blog: false,
        theme: {
          customCss: ['./src/css/custom.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/og-default.png',
    metadata: [
      {
        name: 'description',
        content:
          'Documentation for the Gusto Embedded React SDK — pre-built workflows and primitives for embedding payroll.',
      },
      {
        name: 'keywords',
        content: 'gusto, embedded payroll, react sdk, payroll api, hr api, embedded finance',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Gusto Embedded SDK' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      logo: {
        alt: 'Gusto Embedded',
        src: 'img/gdev-logo-light.svg',
        srcDark: 'img/gdev-logo-dark.svg',
      },
      items: [
        {
          to: '/docs/',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/Gusto/embedded-react-sdk',
          label: 'GitHub',
          position: 'right',
          className: 'navbarGithub',
        },
      ],
    },
    footer: {
      logo: {
        alt: 'Gusto Embedded',
        src: 'img/gdev-logo-light.svg',
        srcDark: 'img/gdev-logo-dark.svg',
      },
      links: [
        {
          title: 'Build',
          items: [
            { label: 'Workflows', to: '/docs/workflows-overview' },
            { label: 'Event Handling', to: '/docs/integration-guide/event-handling' },
            { label: 'Hooks', to: '/docs/hooks' },
          ],
        },
        {
          title: 'Customize',
          items: [
            { label: 'Component Adapter', to: '/docs/component-adapter' },
            { label: 'Theming', to: '/docs/theming' },
            { label: 'Translations', to: '/docs/integration-guide/translation' },
            { label: 'Bring your own data', to: '/docs/integration-guide/providing-your-own-data' },
          ],
        },
        {
          title: 'Get Started',
          items: [
            { label: 'What is the SDK?', to: '/docs/' },
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'Authentication', to: '/docs/getting-started/authentication' },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Developer Portal',
              href: 'https://docs.gusto.com/embedded-payroll/docs/introduction',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Gusto/embedded-react-sdk',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Gusto, Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'ruby', 'python', 'java'],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
