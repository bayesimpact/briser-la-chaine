// TODO(cyrille): Test this file.
// Regex from https://stackoverflow.com/a/1373724/4482064
const emailRegexp = new RegExp(
  '^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)' +
  '*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')


function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

// Returns true for a string containing a valid email. false otherwise.
function validateEmail(value?: string): value is string {
  return !!value && emailRegexp.test(normalizeEmail(value))
}
const phoneNoiseRegexp = new RegExp('[^\\d+]+', 'g')

function validatePhone(value?: string): value is string {
  return !!value
}

// Make sure this is understandable with our SMS operator.
function normalizePhone(value: string): string {
  return value.replace(phoneNoiseRegexp, '')
}

export {validateEmail, validatePhone, normalizeEmail, normalizePhone}
