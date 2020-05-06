"""Tests for the SMS endpoint of the Mailjet proxy."""

import os
import re
from typing import Any, Callable
import typing
import unittest
from unittest import mock

import requests_mock

import mailjet

_T = typing.TypeVar('_T')

requests_mock_mock = typing.cast(  # pylint: disable=invalid-name
    Callable[[], Callable[[Callable[..., Any]], Callable[..., Any]]],
    requests_mock.mock,
)


@mock.patch(mailjet.__name__ + '._MAILJET_SMS_TOKEN', 'my-secret-api-token')
@mock.patch(mailjet.__name__ + '._SMS_SENDER', 'My Test Sender')
@mock.patch.dict(os.environ, {'SMS_TEMPLATE_123': 'Hi buddy'})
class MailTest(unittest.TestCase):
    """Tests for the SMS endpoint of the Mailjet proxy."""

    def setUp(self) -> None:
        super().setUp()

        self.app = mailjet.app.test_client()

    def test_no_recipients(self) -> None:
        """Test sending an SMS without any recipient."""

        response = self.app.post('/sms/123', json={})
        self.assertEqual(200, response.status_code)
        self.assertEqual('No SMS sent', response.get_data(as_text=True))

    def test_bad_recipients_type(self) -> None:
        """Test sending an SMS with a wrong recipient type."""

        response = self.app.post('/sms/123', json={'To': [{'Email': 'pascal@example.com'}]})
        self.assertEqual(422, response.status_code)

    def test_restricted_recipient(self) -> None:
        """Test sending an SMS to a foreign phone."""

        response = self.app.post('/sms/123', json={'To': '+496912345678'})
        self.assertEqual(403, response.status_code)

    @requests_mock_mock()
    @mock.patch(mailjet.__name__ + '._TEL_PATTERN_RE', None)
    def test_unrestricted_recipients(self, mock_requests: requests_mock.Mocker) -> None:
        """Test sending an SMS to a foreign phone with restrictions lifted."""

        mock_requests.post('https://api.mailjet.com/v4/sms-send')

        response = self.app.post('/sms/123', json={'To': '+496912345678'})
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, mock_requests.call_count)

    @requests_mock_mock()
    @mock.patch(mailjet.__name__ + '._TEL_PATTERN_RE', re.compile(r'\+33[67]\d{8}'))
    def test_sending(self, mock_requests: requests_mock.Mocker) -> None:
        """Test sending a proper SMS."""

        mock_requests.post('https://api.mailjet.com/v4/sms-send')

        response = self.app.post('/sms/123', json={'To': '+33601020304'})
        self.assertEqual(200, response.status_code)

        self.assertEqual(1, mock_requests.call_count)
        request = mock_requests.last_request
        self.assertEqual(
            'Bearer my-secret-api-token',
            request.headers['Authorization'],
        )
        self.assertEqual({
            'From': 'My Test Sender',
            'Text': 'Hi buddy',
            'To': '+33601020304',
        }, request.json())

    @requests_mock_mock()
    @mock.patch.dict(os.environ, {'SMS_TEMPLATE_123': 'Hi %(firstname)s'})
    def test_sending_with_variables(self, mock_requests: requests_mock.Mocker) -> None:
        """Test sending a proper SMS."""

        mock_requests.post('https://api.mailjet.com/v4/sms-send')

        response = self.app.post('/sms/123', json={
            'To': '+33601020304',
            'Variables': {'firstname': 'Joe'},
        })
        self.assertEqual(200, response.status_code)

        self.assertEqual(1, mock_requests.call_count)
        request = mock_requests.last_request
        self.assertEqual({
            'From': 'My Test Sender',
            'Text': 'Hi Joe',
            'To': '+33601020304',
        }, request.json())


if __name__ == '__main__':
    unittest.main()
