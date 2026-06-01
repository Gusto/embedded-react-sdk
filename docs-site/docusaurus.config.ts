import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import { themes as prismThemes } from 'prism-react-renderer'

const config: Config = {
  title: 'Gusto Embedded',
  tagline: 'Embedded Payroll React SDK Documentation',
  favicon: 'img/favicon.svg',

  // docs-site/ in this repo is a local-dev preview of the current docs
  // only. The public site (with version history) lives in
  // Gusto/embedded-sdk-docs and owns its own production URL.
  url: 'http://localhost',
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

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        docsDir: '../docs',
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
        },
        blog: false,
        theme: {
          customCss: ['./src/css/custom.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'SDK',
      logo: {
        alt: 'Gusto Embedded SDK',
        src: 'img/gusto-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/Gusto/embedded-react-sdk',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Get Started',
          items: [
            { label: 'What is the SDK?', to: '/docs/what-is-the-gep-react-sdk' },
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'Workflows Overview', to: '/docs/workflows-overview' },
          ],
        },
        {
          title: 'Guides',
          items: [
            { label: 'Theming', to: '/docs/theming' },
            { label: 'Component Adapter', to: '/docs/component-adapter' },
            { label: 'Integration Guide', to: '/docs/integration-guide' },
            { label: 'Hooks (Experimental)', to: '/docs/hooks' },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Gusto/embedded-react-sdk',
            },
            {
              label: 'Gusto Developer Portal',
              href: 'https://docs.gusto.com/embedded-payroll/docs/introduction',
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
