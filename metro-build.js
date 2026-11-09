const Metro = require('metro')
Metro.loadConfig().then(async config => {
  Metro.runBuild(config, {
    entry: './src/index.tsx',
    out: './dist/entry.js',
  })
})
