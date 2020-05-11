
function sendEmail(emailAddress: string, risk: ContaminationRisk): void {
  fetch(`${config.mailjetProxyUrl}/email/1389855`, {
    body: JSON.stringify({To: [{Email: emailAddress}], Variables: {risk}}),
    credentials: 'omit',
    method: 'post',
    mode: 'no-cors',
  })
}

function sendSMS(phoneNumber: string, risk: ContaminationRisk): void {
  const internationalPhoneNumber = phoneNumber.replace(/ /g, '').replace(/^0/, '+33')
  fetch(`${config.mailjetProxyUrl}/sms/${risk}`, {
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
