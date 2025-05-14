module.exports = {
  plugins: [
    require('postcss-modules')({
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      getJSON: function (cssFileName, json, outputFileName) {
        const fs = require('fs')
        const path = require('path')

        // Get the output file path
        outputFileName = outputFileName || cssFileName

        // Create JSON filename with .module.scss.json extension if it's a module CSS file
        let jsonFileName = outputFileName
        if (outputFileName.includes('.module.css')) {
          jsonFileName = outputFileName.replace('.module.css', '.module.scss.json')
        } else {
          jsonFileName = outputFileName + '.json'
        }

        // Ensure the directory exists
        const dir = path.dirname(jsonFileName)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }

        // Write the JSON to a file
        fs.writeFileSync(jsonFileName, JSON.stringify(json))
      },
    }),
    css => {
      // Placeholder here, to fix aliasing and prefixing all sass files with mixins we
      // have access to the scss content as well as the destination file path here
      // We would need custom scripting to account for this.
      // Sass alias package could help mitigate that
      // https://www.npmjs.com/package/sass-alias
      // Alternatively we could just stop aliasing our sass files which is the approach
      // I took in this demo
    },
  ],
}
