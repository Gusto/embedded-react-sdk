/**
 * ESLint rule to prevent setting default values on UI components.
 *
 * This rule prevents developers from setting default prop values directly in UI components
 * and instead encourages them to use the centralized default values registry.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent setting default values on UI components',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noUIComponentPropDefaults:
        'Default values are not allowed in UI components. Please set default values in the component Types file (e.g., ButtonDefaults) instead. UI components should receive their defaults through the component adapter system.',
    },
  },

  create(context) {
    /**
     * Check if we're in a UI component file
     */
    function isUIComponentFile(filename) {
      return (
        filename.includes('/components/Common/UI/') &&
        (filename.endsWith('.tsx') || filename.endsWith('.ts')) &&
        !filename.includes('Types.ts') &&
        !filename.includes('.test.') &&
        !filename.includes('.stories.')
      )
    }

    /**
     * Check if a function parameter has a default value
     */
    function hasDefaultValue(param) {
      return param.type === 'AssignmentPattern'
    }

    /**
     * Check if this is a React component (function that returns JSX or has JSX-like patterns)
     */
    function isReactComponent(node) {
      // Check function name starts with capital letter (React component convention)
      const functionName = node.id?.name || node.key?.name
      if (!functionName || !/^[A-Z]/.test(functionName)) {
        return false
      }

      // Additional check: look for JSX return or React patterns in the function body
      let hasJSXOrReactPattern = false

      if (node.body && node.body.type === 'BlockStatement') {
        // Look for JSX elements, React.createElement, or return statements with JSX
        const hasJSX =
          context.getSourceCode().getText(node.body).includes('<') ||
          context.getSourceCode().getText(node.body).includes('React.createElement') ||
          context.getSourceCode().getText(node.body).includes('jsx')

        if (hasJSX) {
          hasJSXOrReactPattern = true
        }
      }

      return hasJSXOrReactPattern
    }

    /**
     * Check if this parameter is a destructured prop parameter (first parameter of React component)
     */
    function isPropsParameter(param, paramIndex) {
      return paramIndex === 0 && param.type === 'ObjectPattern'
    }

    return {
      FunctionDeclaration(node) {
        const filename = context.getFilename()

        if (!isUIComponentFile(filename)) {
          return
        }

        if (!isReactComponent(node)) {
          return
        }

        // Check function parameters for default values
        if (node.params && node.params.length > 0) {
          node.params.forEach((param, paramIndex) => {
            if (isPropsParameter(param, paramIndex) && param.properties) {
              // Check each property in the destructured props for default values
              param.properties.forEach(property => {
                if (property.type === 'Property' && hasDefaultValue(property.value)) {
                  context.report({
                    node: property.value,
                    messageId: 'noUIComponentPropDefaults',
                  })
                }
              })
            } else if (hasDefaultValue(param)) {
              // Direct parameter with default value
              context.report({
                node: param,
                messageId: 'noUIComponentPropDefaults',
              })
            }
          })
        }
      },

      ArrowFunctionExpression(node) {
        const filename = context.getFilename()

        if (!isUIComponentFile(filename)) {
          return
        }

        // For arrow functions, we need to check if they're assigned to a const with capital letter
        // or if they're exported
        let isComponent = false

        if (node.parent) {
          if (
            node.parent.type === 'VariableDeclarator' &&
            node.parent.id.name &&
            /^[A-Z]/.test(node.parent.id.name)
          ) {
            isComponent = true
          } else if (
            node.parent.type === 'ExportDefaultDeclaration' ||
            (node.parent.type === 'ExportNamedDeclaration' && node.parent.declaration)
          ) {
            isComponent = true
          }
        }

        if (!isComponent) {
          return
        }

        // Check if the function body suggests it's a React component
        if (node.body) {
          const bodyText = context.getSourceCode().getText(node.body)
          const hasReactPatterns =
            bodyText.includes('<') ||
            bodyText.includes('React.createElement') ||
            bodyText.includes('jsx')

          if (!hasReactPatterns) {
            return
          }
        }

        // Check arrow function parameters for default values
        if (node.params && node.params.length > 0) {
          node.params.forEach((param, paramIndex) => {
            if (isPropsParameter(param, paramIndex) && param.properties) {
              // Check each property in the destructured props for default values
              param.properties.forEach(property => {
                if (property.type === 'Property' && hasDefaultValue(property.value)) {
                  context.report({
                    node: property.value,
                    messageId: 'noUIComponentPropDefaults',
                  })
                }
              })
            } else if (hasDefaultValue(param)) {
              // Direct parameter with default value
              context.report({
                node: param,
                messageId: 'noUIComponentPropDefaults',
              })
            }
          })
        }
      },
    }
  },
}
