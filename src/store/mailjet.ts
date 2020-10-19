import {format as dateFormat} from 'date-fns'
import {TFunction} from 'i18next'

import {LocaleOption} from 'store/i18n'


function sendAnonymousEmail(emailAddress: string, t: TFunction): void {
  fetch(`${config.mailjetProxyUrl}/email/${t('mailjetEmailTemplateId')}`, {
    // TODO(cyrille): Drop the risk in mail template.
    body: JSON.stringify({To: [{Email: emailAddress}], Variables: {risk: 'high'}}),
    credentials: 'omit',
    method: 'post',
    mode: 'no-cors',
  })
}


function sendEmailOnBehalf(
  emailAddress: string, userName: string,
  contagiousStartDate: Date, contagiousEndDate: Date, t: TFunction, dateOptions: LocaleOption,
): void {
  fetch(`${config.mailjetProxyUrl}/email/${t('mailjetEmailOnBehalfTemplateId')}`, {
    // TODO(cyrille): Drop the risk in mail template.
    body: JSON.stringify({To: [{Email: emailAddress}], Variables: {
      contagiousEndDate: dateFormat(contagiousEndDate, 'd MMM', dateOptions),
      contagiousStartDate: dateFormat(contagiousStartDate, 'd MMM', dateOptions),
      risk: 'high',
      userName,
    }}),
    credentials: 'omit',
    method: 'post',
    mode: 'no-cors',
  })
}

function makeIntlPhoneNumber(number: string, t: TFunction): string {
  if (number.startsWith('+')) {
    return number
  }
  const phoneSuffix = number.replace(new RegExp(`^${t('phoneTrunkPrefix')}`), '')
  return `+${t('phoneInternationalPrefix')}${phoneSuffix}`
}

function sendAnonymousSMS(phoneNumber: string, t: TFunction): void {
  const internationalPhoneNumber = makeIntlPhoneNumber(phoneNumber, t)
  const mailjetSmsTemplateId = t('mailjetSmsTemplateId')
  fetch(`${config.mailjetProxyUrl}/sms/${mailjetSmsTemplateId}`, {
    body: JSON.stringify({To: internationalPhoneNumber}),
    credentials: 'omit',
    method: 'post',
    mode: 'no-cors',
  })
}


function sendSMSOnBehalf(phoneNumber: string, userName: string, t: TFunction): void {
  const internationalPhoneNumber = makeIntlPhoneNumber(phoneNumber, t)
  const mailjetSmsOnBehalfTemplateId = t('mailjetSmsOnBehalfTemplateId')
  fetch(`${config.mailjetProxyUrl}/sms/${mailjetSmsOnBehalfTemplateId}`, {
    body: JSON.stringify({To: internationalPhoneNumber, Variables: {
      userName: userName.slice(0, 19),
    }}),
    credentials: 'omit',
    method: 'post',
    mode: 'no-cors',
  })
}


export {
  sendAnonymousEmail,
  sendAnonymousSMS,
  sendEmailOnBehalf,
  sendSMSOnBehalf,
}
