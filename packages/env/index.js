'use strict'

export const ENV = process.env.NODE_ENV

export const isProduction = (env = process.env.NODE_ENV) => (env === 'production') || (env !== 'development' && env !== 'dev' && env !== 'test')
export const isTest = (env = process.env.NODE_ENV) => env === 'test'
export const isDevelopment = (env = process.env.NODE_ENV) => env === 'development' || env === 'dev'
