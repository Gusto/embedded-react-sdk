export default {
  '*.{ts,tsx,js,json}': filenames => [
    'npm run build',
    `npm run format:staged -- ${filenames.join(' ')}`,
    `npm run lint:staged -- ${filenames.join(' ')}`,
  ],
  '*.md': filenames => [
    `npm run format:staged -- ${filenames.join(' ')}`,
    `npx markdownlint-cli2 ${filenames.map(f => `"${f}"`).join(' ')}`,
    `npx cspell lint --no-progress --no-must-find-files --no-summary ${filenames.map(f => `"${f}"`).join(' ')}`,
  ],
}
