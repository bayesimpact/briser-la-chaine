// TODO(sil): Remove as unused.
export const makeSmsUri = (content: string, recipients: readonly string[]): string => {
  // TODO(cyrille): Account for different syntax in different OS/navigators
  return `sms:${recipients.join(',')}?body=${encodeURIComponent(content)}`
}
