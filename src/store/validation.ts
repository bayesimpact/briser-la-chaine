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

// Validate a French mobile phone number, either in local or international format.
// Also capture the international suffix.
// e.g. 0612345678 (-> 612345678) or +33798765432 (-> 798765432).
const phoneRegexp = new RegExp('^(?:0|\\+33)([67]\\d{8})$')
const phoneNoiseRegexp = new RegExp('[^\\d+]+', 'g')

function validatePhone(value?: string): value is string {
  return !!value && phoneRegexp.test(value.replace(phoneNoiseRegexp, ''))
}

// Make sure this is understandable with our SMS operator.
function normalizePhone(value: string): string {
  const validPhoneMatch = phoneRegexp.exec(value.replace(phoneNoiseRegexp, ''))
  if (!validPhoneMatch) {
    return value
  }
  return '+33' + validPhoneMatch[1]
}

function beautifyPhone(value: string): string {
  const validPhoneMatch = phoneRegexp.exec(value.replace(phoneNoiseRegexp, ''))
  if (!validPhoneMatch) {
    return value
  }
  const zeroPrefix = '0' + validPhoneMatch[1]
  return (zeroPrefix.match(/.{2}/g) || []).join(' ')
}

export {beautifyPhone, validateEmail, validatePhone, normalizeEmail, normalizePhone}
