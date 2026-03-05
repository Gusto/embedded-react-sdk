import stylelint from 'stylelint'

const ruleName = 'custom/no-manual-helpers-import'
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected:
    'Do not manually import @/styles/Helpers - it is globally available via Vite preprocessor configuration.',
})

const meta = {
  url: 'https://github.com/Gusto/embedded-react-sdk',
}

const ruleFunction = (primary, secondaryOptions, context) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: primary,
    })

    if (!validOptions) {
      return
    }

    root.walkAtRules('use', rule => {
      const params = rule.params.trim()

      if (params.includes('@/styles/Helpers')) {
        if (context.fix) {
          rule.remove()
          return
        }

        stylelint.utils.report({
          message: messages.rejected,
          node: rule,
          result,
          ruleName,
        })
      }
    })
  }
}

ruleFunction.ruleName = ruleName
ruleFunction.messages = messages
ruleFunction.meta = meta

export default stylelint.createPlugin(ruleName, ruleFunction)
