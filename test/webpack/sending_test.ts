import {expect} from 'chai'
import {makeSmsUri} from 'store/sending'

describe('makeSmsUri', (): void => {
  it('should make the expected string in a simple case', (): void => {
    expect(makeSmsUri('hello world', ['911'])).to.equal('sms:911?body=hello%20world')
  })
})
