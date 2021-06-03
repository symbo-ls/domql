module.exports = {
  extends: 'standard',
  plugins: ['jest'],
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true
  },
  overrides: [{
    files: ['test/**/*.test.js'],
    env: { jest: true },
    plugins: ['jest']
  }]
}
