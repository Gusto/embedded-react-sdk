import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type * as Plugin from '@docusaurus/types/src/plugin';
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'Gusto Embedded',
  tagline: 'Embedded Payroll React SDK Documentation',
  favicon: 'img/favicon.svg',

  url: 'http://localhost',
  baseUrl: '/',

  onBrokenLinks: 'warn',

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
    'docusaurus-theme-openapi-docs',
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
          docItemComponent: '@theme/ApiItem',
        },
        blog: false,
        theme: {
          customCss: ['./src/css/custom.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    function webpackPolyfills() {
      return {
        name: 'webpack-node-polyfills',
        configureWebpack() {
          return {
            resolve: {
              fallback: {
                path: require.resolve('path-browserify'),
              },
            },
          };
        },
      };
    },
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api',
        docsPluginId: 'classic',
        config: {
          gustoEmbedded: {
            specPath: './openapi/gusto-embedded.yaml',
            outputDir: '../docs/api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          } satisfies OpenApiPlugin.Options,
        } satisfies Plugin.PluginOptions,
      },
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
          label: 'Guides',
        },
        {
          type: 'docSidebar',
          sidebarId: 'api',
          position: 'left',
          label: 'API Reference',
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
          title: 'Guides',
          items: [
            { label: 'What is the SDK?', to: '/docs/what-is-the-gep-react-sdk' },
            { label: 'Getting Started', to: '/docs/getting-started/getting-started' },
            { label: 'Integration Guide', to: '/docs/integration-guide/integration-guide' },
            { label: 'Workflows', to: '/docs/workflows-overview/workflows-overview' },
          ],
        },
        {
          title: 'Customization',
          items: [
            { label: 'Theming', to: '/docs/theming/theming' },
            { label: 'Component Adapter', to: '/docs/component-adapter/component-adapter' },
            { label: 'Hooks (Experimental)', to: '/docs/hooks/hooks' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'API Reference', to: '/docs/api/companies' },
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
};

export default config;
