module.exports = {
  extends: [
    'standard',
    'plugin:jest/all'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      configFile: './babel.config.json',
      presets: ['@babel/preset-env']
    }
  },
  plugins: ['jest', '@babel'],
  env: {
    browser: true,
    es2021: true,
    node: true,
    'jest/globals': true
  },
  overrides: [{
    files: ['packages/**/*.test.js']
  }]
}
