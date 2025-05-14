module.exports = {
  syntax: 'postcss-scss',
  plugins: [
    require('postcss-modules')({
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      getJSON: function (cssFileName, json, outputFileName) {
        const fs = require('fs')
        const path = require('path')

        // Get the output file path and replace 'src' with 'dist'
        outputFileName = outputFileName || cssFileName.replace(/\.scss$/, '.css')
        const jsonFileName = outputFileName.replace(/^src/, 'dist') + '.json'

        // Ensure the directory exists
        const dir = path.dirname(jsonFileName)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }

        // Write the JSON to a file
        fs.writeFileSync(jsonFileName, JSON.stringify(json))
      },
    }),
  ],
}
