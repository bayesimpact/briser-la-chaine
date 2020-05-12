# Mailjet Proxy

This is a Docker Image to easily setup a proxy for Mailjet API. Such a proxy lets many users benefit
from the Mailjet API for a given account without revealing the public nor secret API keys.

Only the template email, and SMS sending APIs are enabled and they can also be restricted by env
variables.

## Usage

Once setup, the server provides an API that is a subset of the Mailjet API.

Note that using this Proxy is only a convenience to access the Mailjet API, it is required that you
make sure that all users of your Proxy will
follow [Mailjet Sending Policy](https://fr.mailjet.com/sending-policy/), as it's your account that
they would be using.

### Sending Emails by Template

```sh
curl -X POST https://my-mailjet-proxy/email/1234 \
    -H 'Content-Type: application/json' \
    -d '{
            "To": [
                {
                    "Email": "joe@example.com",
                    "Name": "My Friend Joe"
                }
            ],
            "Variables": {
                "firstname": "Joe"
            }
        }'
```

### Sending SMSes

```sh
curl -X POST https://my-mailjet-proxy/sms/1234 \
    -H 'Content-Type: application/json' \
    -d '{
            "To": "+33600000000",
            "Variables": {
                "firstname": "Joe"
            }
        }'
```

## Configuration

These are the required env variables for the server to run.

For sending emails:

 * **MAILJET_APIKEY_PUBLIC**: your account's public API key.
 * **MAILJET_SECRET**: your account's secret API key.
 * **MAIL_SENDER_EMAIL**: the email of the sender for all emails sent with this service.
 * **MAIL_SENDER_NAME**: the name of the sender for all emails sent with this service.

For sending SMSes:

 * **MAILJET_SMS_TOKEN**: your account's SMS API secret token.
 * **SMS_SENDER**: the sender for all SMSes sent with this service.
 * **SMS_TEMPLATE_`1234`**: the template for the SMS `1234` (can be any string). This is using
   Python string replacement e.g. `Hi %(firstname)s, your password is: %(password)s.`.

Additional configuration may be set:
 * **ADMIN_EMAIL**: an email address to receive templating errors.

Additional environment variables may be used to restrict the service.

 * **TEMPLATE_WHITELISTS**: a comma separated list of template IDs, only those template IDs
   may be used (default: all templates are allowed).
 * **NUM_RECIPIENTS**: maximum number of recipients that would receive each email (default: `1`).
 * **VAR_MAX_SIZE**: maximum size of variables (default: no maximum).
 * **TEL_PATTERN**: a regex to restrict which telephone numbers can be reached e.g. `\+33[67]`
   (default: restriction to French mobile phones).
