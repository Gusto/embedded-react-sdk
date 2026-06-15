export default {
  '*.{ts,tsx,js,json}': filenames => [
    'npm run build',
    `npm run format:staged -- ${filenames.join(' ')}`,
    `npm run lint:staged -- ${filenames.join(' ')}`,
  ],
  '*.md': filenames => [
    `npm run format:staged -- ${filenames.join(' ')}`,
    `npx cspell lint --no-progress --no-must-find-files --no-summary ${filenames.map(f => `"${f}"`).join(' ')}`,
  ],
  'src/components/Common/UI/**/*Types.ts': () => [
    'npm run adapter:docs:generate',
    'npm run format:staged -- docs/component-adapter/component-inventory.md',
    'git add docs/component-adapter/component-inventory.md',
  ],
  'src/contexts/ComponentAdapter/componentAdapterTypes.ts': () => [
    'npm run adapter:docs:generate',
    'npm run format:staged -- docs/component-adapter/component-inventory.md',
    'git add docs/component-adapter/component-inventory.md',
  ],
  'build/generateAdapterPropDocs.ts': () => [
    'npm run adapter:docs:generate',
    'npm run format:staged -- docs/component-adapter/component-inventory.md',
    'git add docs/component-adapter/component-inventory.md',
  ],
}
