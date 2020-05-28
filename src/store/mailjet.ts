import {TFunction} from 'i18next'

function sendEmail(emailAddress: string, risk: ContaminationRisk, t: TFunction): void {
  fetch(`${config.mailjetProxyUrl}/email/${t('mailjetEmailTemplateId')}`, {
    body: JSON.stringify({To: [{Email: emailAddress}], Variables: {risk}}),
    credentials: 'omit',
    method: 'post',
    mode: 'no-cors',
  })
}


function sendSMS(phoneNumber: string, risk: ContaminationRisk, t: TFunction): void {
  const internationalPhoneNumber = phoneNumber.replace(/ /g, '').replace(/^0/, '+33')
  // i18next-extract-mark-context-start ["", "high", "low"]
  const mailjetSmsTemplateId = t('mailjetSmsTemplateId', {context: risk})
  // i18next-extract-mark-context-stop
  fetch(`${config.mailjetProxyUrl}/sms/${mailjetSmsTemplateId}`, {
    body: JSON.stringify({To: internationalPhoneNumber}),
    credentials: 'omit',
    method: 'post',
    mode: 'no-cors',
  })
}

export {
  sendEmail,
  sendSMS,
}
