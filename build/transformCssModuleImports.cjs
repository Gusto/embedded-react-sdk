/**
 * A Babel plugin to transform CSS module imports in compiled JS files:
 * - Changes `import styles from './Component.module.scss'` to:
 *   - `import styles from './Component.module.scss.json'`
 *   - `import './Component.module.css'`
 */
module.exports = function () {
  return {
    name: 'transform-css-module-imports',
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source.value
        // Preserve the original quote type (single or double)
        const raw = path.node.source.extra?.raw
        const isDoubleQuoted = raw ? raw.startsWith('"') : false

        // Only process .module.scss imports
        if (!source.endsWith('.module.scss')) {
          return
        }

        // Get the default import name (styles)
        const defaultImport = path.node.specifiers.find(
          specifier => specifier.type === 'ImportDefaultSpecifier',
        )

        if (!defaultImport) {
          return
        }

        // Create a new import for the JSON file
        const jsonImport = {
          type: 'ImportDeclaration',
          specifiers: [
            {
              type: 'ImportDefaultSpecifier',
              local: defaultImport.local,
            },
          ],
          source: {
            type: 'StringLiteral',
            value: `${source}.json`,
            extra: {
              raw: isDoubleQuoted ? `"${source}.json"` : `'${source}.json'`,
            },
          },
        }

        // Create a new import for the CSS file
        const cssImport = {
          type: 'ImportDeclaration',
          specifiers: [],
          source: {
            type: 'StringLiteral',
            value: source.replace('.scss', '.css'),
            extra: {
              raw: isDoubleQuoted
                ? `"${source.replace('.scss', '.css')}"`
                : `'${source.replace('.scss', '.css')}'`,
            },
          },
        }

        // Replace the original import with the two new ones
        path.replaceWithMultiple([jsonImport, cssImport])
      },
    },
  }
}
