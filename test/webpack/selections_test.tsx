import {expect} from 'chai'
import i18n from 'i18next'
import React from 'react'
import {initReactI18next} from 'react-i18next'
import {Provider} from 'react-redux'
import {create as createRenderer} from 'react-test-renderer'
import configureStore from 'redux-mock-store'

import {useReferralUrl} from 'store/selections'


i18n.use(initReactI18next).init({
  debug: true,
  keySeparator: false,
  lng: 'fr',
  nsSeparator: false,
  resources: {},
})


const ReferralUrlUser = (props: {callback: (url: string) => void; personId: string}): null => {
  const {callback, personId} = props
  const url = useReferralUrl(personId)
  callback(url)
  return null
}


interface CaptureCallback {
  (value: string): void
  values: readonly string[]
}


function createCaptureCallback(): CaptureCallback {
  const capturedValues: string[] = []
  const captureValue = (value: string): void => {
    capturedValues.push(value)
  }
  captureValue.values = capturedValues
  return captureValue
}


const mockStore = configureStore([])


function expectUseReferralUrlResult(storeState: Partial<RootState>, personId: string):
ReturnType<typeof expect> {
  const store = mockStore(storeState)

  const capture = createCaptureCallback()

  createRenderer(<Provider store={store}>
    <ReferralUrlUser callback={capture} personId={personId} />
  </Provider>)

  expect(capture.values).to.have.length(1)
  return expect(capture.values[0])
}


describe('useReferralUrl', (): void => {
  before((): void => {
    i18n.changeLanguage('fr')
    i18n.addResourceBundle('fr', 'url', {
      HIGH_RISK_SPLASH: 'probablement',
    })
    i18n.addResourceBundle('fr', 'translation', {
      canonicalUrl: 'https://www.example.com',
    })
  })

  it('should return a valid referral URL', (): void => {
    expectUseReferralUrlResult({contacts: []}, '').to.equal('https://www.example.com/probablement')
  })

  it('should return a valid referral URL', (): void => {
    expectUseReferralUrlResult({
      contacts: ['person-custom-id'],
    }, 'person-custom-id').to.equal('https://www.example.com/probablement')
  })

  it('should add a parameter when the chain gets deeper', (): void => {
    expectUseReferralUrlResult({
      contacts: ['person-custom-id'],
      user: {chainDepth: 2},
    }, 'person-custom-id').to.equal('https://www.example.com/probablement?p=2')
  })
})
