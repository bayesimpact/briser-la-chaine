import {expect} from 'chai'
import React from 'react'
import {Provider} from 'react-redux'
import {create as createRenderer} from 'react-test-renderer'
import configureStore from 'redux-mock-store'

import {useReferralUrl} from 'store/selections'


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
// TODO(cyrille): Setup a test i18next environment and switch back to explicit canonical URL.

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
  it('should return a valid referral URL', (): void => {
    expectUseReferralUrlResult({contacts: {}}, '').to.equal('canonicalUrl/peut-etre')
  })

  it('should return a valid referral URL for a low risk case', (): void => {
    expectUseReferralUrlResult({contacts: {
      NO_DATE_0: {
        contacts: [{
          date: new Date(),
          distance: 'far',
          duration: 5,
          personId: 'person-custom-id',
        }],
        isDayConfirmed: true,
      },
    }}, 'person-custom-id').to.equal('canonicalUrl/peut-etre')
  })

  it('should return a valid referral URL for a high risk case', (): void => {
    expectUseReferralUrlResult({contacts: {
      NO_DATE_0: {
        contacts: [{
          date: new Date(),
          distance: 'close',
          duration: 15,
          personId: 'person-custom-id',
        }],
        isDayConfirmed: true,
      },
    }}, 'person-custom-id').to.equal('canonicalUrl/probablement')
  })

  it('should add a parameter when the chain gets deeper', (): void => {
    expectUseReferralUrlResult({
      contacts: {
        NO_DATE_0: {
          contacts: [{
            date: new Date(),
            distance: 'close',
            duration: 15,
            personId: 'person-custom-id',
          }],
          isDayConfirmed: true,
        },
      },
      user: {
        chainDepth: 2,
      },
    }, 'person-custom-id').to.equal('canonicalUrl/probablement?p=2')
  })
})
