const path = require('path')
const { lstatSync, readdirSync } = require('fs')
// get listing of packages in the mono repo
const basePath = path.resolve(__dirname, 'packages')
const packages = readdirSync(basePath).filter(name => {
  return lstatSync(path.join(basePath, name)).isDirectory()
})

module.exports = {
  verbose: true,
  projects: ['packages/*'],
  // testEnvironment: 'node',
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', 'packages'],
  collectCoverageFrom: [
    'packages/**/test/**/*.js'
  ],
  transform: {
    '\\.js$': ['babel-jest', { configFile: './babel.config.json' }]
  },
  moduleNameMapper: {
    '^@domql/element/(.*)$': '<rootDir>/../element/$1',
    '^@domql/(.*)$': '<rootDir>/../$1',
    ...packages.reduce(
      (acc, name) => ({
        ...acc,
        [`@symbo.ls/${name}(.*)$`]: `<rootDir>/packages/./${name}/$1`
      }),
      {}
    )
  }
}
