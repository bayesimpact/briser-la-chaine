"""Flask server to verify and relay client requests to Mailjet API."""

import os
import re
from typing import Any, Dict, Optional

import flask
import requests
from werkzeug.middleware import proxy_fix

app = flask.Flask(__name__)
# Get original host and scheme used before proxies (load balancer, nginx, etc).
app.wsgi_app = proxy_fix.ProxyFix(app.wsgi_app)  # type: ignore

# TODO(pascal): Do a health check of those env vars, either at startup, or in the health check.

_ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')
_MAILJET_APIKEY_PUBLIC = os.getenv('MAILJET_APIKEY_PUBLIC')
# See https://app.mailjet.com/account/api_keys
_MAILJET_SECRET = os.getenv('MAILJET_SECRET')
_MAILJET_SMS_TOKEN = os.getenv('MAILJET_SMS_TOKEN')
_MAIL_SENDER_EMAIL = os.getenv('MAIL_SENDER_EMAIL')
_MAIL_SENDER_NAME = os.getenv('MAIL_SENDER_NAME')
_SMS_SENDER = os.getenv('SMS_SENDER')

_TEMPLATE_WHITELISTS = frozenset(
    template_id.strip()
    for template_id in os.getenv('TEMPLATE_WHITELISTS', '').split(',')
    if template_id.strip()
)
_NUM_RECIPIENTS = int(os.getenv('NUM_RECIPIENTS', '1'))
_VAR_MAX_SIZE = int(os.getenv('VAR_MAX_SIZE', '0'))
_TEL_PATTERN = os.getenv('TEL_PATTERN', r'\+33[6-7]\d{8}$')
_TEL_PATTERN_RE = re.compile(_TEL_PATTERN) if _TEL_PATTERN else None


@app.route('/', methods=['GET'])
def health_check() -> str:
    """Health Check endpoint.

    Probes can call it to check that the server is up.
    """

    return 'Server up and running'


def _clean_variables(template_vars: Any) -> Optional[Dict[str, str]]:
    if not template_vars:
        return None
    if not isinstance(template_vars, dict):
        flask.abort(422, 'Variables must be a dict')
    for key, var in template_vars.items():
        if not isinstance(key, str) or not isinstance(var, str):
            flask.abort(422, 'Only string variables are allowed')
        if _VAR_MAX_SIZE and len(var) > _VAR_MAX_SIZE:
            flask.abort(403, f'Variable too long: "{var}"')
    return template_vars


@app.route('/email/<template_id>', methods=['POST'])
def send_email(template_id: str) -> str:
    """Send an Email."""

    if _TEMPLATE_WHITELISTS and template_id not in _TEMPLATE_WHITELISTS:
        flask.abort(404)

    content = flask.request.get_json(force=True)

    recipients = content.get('To')
    if not recipients:
        return 'No email sent'
    if not isinstance(recipients, list):
        flask.abort(422, 'Wrong format for the "To" field')
    if _NUM_RECIPIENTS and len(recipients) > _NUM_RECIPIENTS:
        flask.abort(403, 'Too many recipients')

    message = {
        'TemplateID': int(template_id),
        'TemplateLanguage': True,
        'From': {'Email': _MAIL_SENDER_EMAIL, 'Name': _MAIL_SENDER_NAME},
        'To': recipients,
        'TrackOpens': 'disabled',
        'TrackClicks': 'disabled',
    }

    if _ADMIN_EMAIL:
        message['TemplateErrorReporting'] = {'Email': _ADMIN_EMAIL}

    template_vars = _clean_variables(content.get('Variables'))
    if template_vars:
        message['Variables'] = template_vars

    custom_campaign = content.get('CustomCampaign')
    if custom_campaign:
        message['CustomCampaign'] = custom_campaign

    response = requests.post(
        'https://api.mailjet.com/v3.1/send',
        auth=(_MAILJET_APIKEY_PUBLIC, _MAILJET_SECRET),
        json={'Messages': [message]},
    )
    response.raise_for_status()

    return 'Mail sent'


@app.route('/sms/<template_id>', methods=['POST'])
def send_sms(template_id: str) -> str:
    """Send an SMS."""

    template = os.getenv(f'SMS_TEMPLATE_{template_id}')
    if not template:
        flask.abort(404)

    content = flask.request.get_json(force=True)

    recipient = content.get('To')
    if not recipient:
        return 'No SMS sent'
    if not isinstance(recipient, str):
        flask.abort(422, 'Wrong format for the "To" field')
    if _TEL_PATTERN_RE and not _TEL_PATTERN_RE.match(recipient):
        flask.abort(403, 'Recipient not allowed')

    template_vars = _clean_variables(content.get('Variables'))
    if template_vars:
        text = template % template_vars
    else:
        text = template

    message = {
        'Text': text,
        'From': _SMS_SENDER,
        'To': recipient,
    }

    response = requests.post(
        'https://api.mailjet.com/v4/sms-send',
        headers={'Authorization': f'Bearer {_MAILJET_SMS_TOKEN}'},
        json=message,
    )
    response.raise_for_status()

    return 'SMS sent'
