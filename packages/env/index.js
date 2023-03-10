'use strict'

export const ENV = process.env.NODE_ENV

export const isProduction = (ENV === 'production') || (ENV !== 'development' && ENV !== 'test')
export const isTest = ENV === 'test'
export const isDevelopment = ENV === 'development'
