export default {
  '*.ts*': ['npm run build . --', 'npm run format --', 'npm run lint --'],
  'src/components/Common/UI/**/*Types.ts': () => [
    'npm run adapter:docs:generate',
    'prettier docs/component-adapter/component-inventory.md --write --log-level error',
    'git add docs/component-adapter/component-inventory.md',
  ],
}
