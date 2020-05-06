// @ts-ignore
'use strict'
require('@babel/polyfill')

// TODO(cyrille): Add a translations_test to check that all plural strings have "translations" in
// French.

// Add support for all files in the test directory.
const testsContext = require.context('.', true, /_(test|helper)\.[jt]sx?$/)
testsContext.keys().forEach(testsContext)
