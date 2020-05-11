"""Tests for the Mail endpoint of the Mailjet proxy."""

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


@mock.patch(mailjet.__name__ + '._MAILJET_APIKEY_PUBLIC', 'my-public-api-key')
@mock.patch(mailjet.__name__ + '._MAILJET_SECRET', 'my-secret-api-key')
@mock.patch(mailjet.__name__ + '._MAIL_SENDER_EMAIL', 'mytestadmin@mailjetproxy.com')
@mock.patch(mailjet.__name__ + '._MAIL_SENDER_NAME', 'My Test Admin')
class MailTest(unittest.TestCase):
    """Tests for the Mail endpoint of the Mailjet proxy."""

    def setUp(self) -> None:
        super().setUp()

        self.app = mailjet.app.test_client()

    def test_no_recipients(self) -> None:
        """Test sending an email without any recipient."""

        response = self.app.post('/email/123', json={})
        self.assertEqual(200, response.status_code)
        self.assertEqual('No email sent', response.get_data(as_text=True))

    def test_bad_recipients_type(self) -> None:
        """Test sending an email with a wrong recipient type."""

        response = self.app.post('/email/123', json={'To': 'pascal@example.com'})
        self.assertEqual(422, response.status_code)

    def test_too_many_recipients(self) -> None:
        """Test sending an email to too many recipients."""

        response = self.app.post('/email/123', json={'To': [
            {'Email': 'pascal@example.com'},
            {'Email': 'pascal@example.com'},
        ]})
        self.assertEqual(403, response.status_code)

    @requests_mock_mock()
    def test_sending(self, mock_requests: requests_mock.Mocker) -> None:
        """Test sending a proper email."""

        mock_requests.post('https://api.mailjet.com/v3.1/send')

        response = self.app.post('/email/123', json={'To': [
            {'Email': 'pascal@example.com'},
        ]})
        self.assertEqual(200, response.status_code)

        self.assertEqual(1, mock_requests.call_count)
        request = mock_requests.last_request
        self.assertEqual(
            # base64.b64encode(b'my-public-api-key:my-secret-api-key')
            'Basic bXktcHVibGljLWFwaS1rZXk6bXktc2VjcmV0LWFwaS1rZXk=',
            request.headers['Authorization'],
        )
        self.assertEqual({'Messages': [{
            'From': {'Email': 'mytestadmin@mailjetproxy.com', 'Name': 'My Test Admin'},
            'TemplateID': 123,
            'TemplateLanguage': True,
            'To': [{'Email': 'pascal@example.com'}],
        }]}, request.json())


if __name__ == '__main__':
    unittest.main()
