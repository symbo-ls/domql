'use strict'

// @preserve-env
export const NODE_ENV = process.env.NODE_ENV

export const isProduction = (env = NODE_ENV) => env === 'production'
export const isTest = (env = NODE_ENV) => env === 'testing' || env === 'test'
export const isTesting = isTest
export const isStaging = (env = NODE_ENV) => env === 'staging'
export const isDevelopment = (env = NODE_ENV) =>
  env === 'development' || env === 'dev' || env === 'local'
export const getNev = (key, env = NODE_ENV) => env[key]
export const isNotProduction = (env = NODE_ENV) => !isProduction(env)
