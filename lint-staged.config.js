export default {
  '*.{ts,tsx,js,json}': filenames => [
    'npm run build',
    `npm run format:staged -- ${filenames.join(' ')}`,
    `npm run lint:staged -- ${filenames.join(' ')}`,
  ],
  '*.md': filenames => [`npm run format:staged -- ${filenames.join(' ')}`],
}
