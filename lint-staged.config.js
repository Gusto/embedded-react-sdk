export default {
  '*.ts*': ['npm run build . --', 'npm run format --', 'npm run lint --'],
  '*.md': ['npm run format --'],
  'src/components/Common/UI/**/*Types.ts': () => [
    'npm run adapter:docs:generate',
    'git add docs/component-adapter/component-inventory.md',
  ],
  'src/contexts/ComponentAdapter/componentAdapterTypes.ts': () => [
    'npm run adapter:docs:generate',
    'git add docs/component-adapter/component-inventory.md',
  ],
  'build/generateAdapterPropDocs.ts': () => [
    'npm run adapter:docs:generate',
    'git add docs/component-adapter/component-inventory.md',
  ],
}
