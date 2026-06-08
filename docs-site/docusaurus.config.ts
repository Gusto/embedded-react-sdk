import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import { type TypeDocOptions } from 'typedoc'
import { type PluginOptions } from 'docusaurus-plugin-typedoc'
import { themes as prismThemes } from 'prism-react-renderer'
import { baseOptions } from './typedoc.config'

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

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        ...baseOptions,
        sidebar: {
          autoConfiguration: true,
          pretty: true,
          typescript: true,
          deprecatedItemClassName: 'typedoc-sidebar-item-deprecated',
        },
      } satisfies TypeDocOptions & PluginOptions,
    ],
  ],

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
      respectPrefersColorScheme: true,
    },
    navbar: {
      logo: {
        alt: 'Gusto Ember',
        src: 'img/gdev-logo-light.svg',
        srcDark: 'img/gdev-logo-dark.svg',
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
            { label: 'What is the SDK?', to: '/docs/what-is-the-gep-react-sdk' },
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
