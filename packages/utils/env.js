'use strict'

export const NODE_ENV = process.env.NODE_ENV

export const isProduction = (env = NODE_ENV) =>
  env === 'production' ||
  (env !== 'development' && env !== 'dev' && env !== 'testing')
export const isTest = (env = NODE_ENV) => env === 'testing'
export const isDevelopment = (env = NODE_ENV) =>
  env === 'development' || env === 'dev'

export const getNev = (key, env = NODE_ENV) => env[key]
