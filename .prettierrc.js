const config = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true, // default: false
  trailingComma: 'all', // default: 'es5'
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid', // default: 'always'
  rangeStart: 0,
  rangeEnd: Infinity,
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  overrides: [
    {
      files: 'docs/api/**/*.md',
      options: {
        plugins: ['prettier-plugin-compact-markdown-table'],
      },
    },
  ],
}
export default config
