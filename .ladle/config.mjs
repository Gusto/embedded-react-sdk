/** @type {import('@ladle/react').UserConfig} */
export default {
  // eslint-disable-next-line no-undef
  viteConfig: process.cwd() + '/.ladle/ladle-vite.config.ts',
  // Set the Welcome page as the default story that opens first
  defaultStory: 'welcome--introduction',
  // Specify story locations
  stories: ['.ladle/**/*.stories.{js,jsx,ts,tsx}', 'src/**/*.stories.{js,jsx,ts,tsx}'],
  // Other Ladle configuration options
  addons: {
    a11y: {
      enabled: true,
    },
  },
}
