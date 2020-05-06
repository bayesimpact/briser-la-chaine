
function sendEmail(emailAddress: string): void {
  // TODO(pascal): Use a different template for high/moderate risks.
  // TODO(pascal): Add the contagious period var.
  fetch(`${config.mailjetProxyUrl}/email/1389855`, {
    body: JSON.stringify({To: [{Email: emailAddress}]}),
    credentials: 'omit',
    method: 'post',
    mode: 'no-cors',
  })
}

function sendSMS(phoneNumber: string): void {
  // TODO(pascal): Use a different template for high/moderate risks.
  // TODO(pascal): Add the contagious period var.
  const internationalPhoneNumber = phoneNumber.replace(/ /g, '').replace(/^0/, '+33')
  fetch(`${config.mailjetProxyUrl}/sms/alert`, {
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
