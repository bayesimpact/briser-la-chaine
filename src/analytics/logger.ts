import {AllActions, noDate} from 'store/actions'
import {getDaysToValidate, getPeopleToAlert} from 'store/selections'

import {Routes} from 'store/url'

import {AmplitudeLogger, Properties} from './amplitude'

export default class Logger implements AmplitudeLogger<AllActions, RootState> {
  private actionTypesToLog: {[T in AllActions['type']]?: string}

  private isFirstPage: boolean

  public constructor(actionTypesToLog: {[T in AllActions['type']]?: string}) {
    this.actionTypesToLog = actionTypesToLog
    this.isFirstPage = true
  }

  shouldLogAction(action: AllActions): boolean {
    return !!this.actionTypesToLog[action.type]
  }

  getEventName(action: AllActions): string {
    if (action.type === 'PAGE_IS_LOADED') {
      return `${this.actionTypesToLog[action.type] || action.type} ${action.pathname}`
    }
    return this.actionTypesToLog[action.type] || action.type
  }

  getEventProperties(action: AllActions, state: RootState): Properties {
    if (action.type === 'PAGE_IS_LOADED') {
      const properties: Properties = {}
      if (this.isFirstPage) {
        properties.isFirstPage = true
        this.isFirstPage = false
      }
      if (action.pathname === Routes.CONTACTS_SEARCH) {
        properties.numDaysToValidate = getDaysToValidate(state).length
      }
      return properties
    }
    if (action.type === 'ALERT_PERSON') {
      return {
        // TODO(cyrille): Add how many alerts have been sent to the same person.
        medium: action.alertMedium?.medium || 'self',
      }
    }
    if (action.type === 'CONFIRM_CONTACTS') {
      return {
        numContacts: action.numContacts,
      }
    }
    if (action.type === 'COPY_PERSONAL_MESSAGE') {
      const {hasReferralUrl, isDefaultText} = action
      return {hasReferralUrl, isDefaultText}
    }
    if (action.type === 'SAVE_CONTACTS') {
      const properties: Properties = {
        numContacts: action.contacts.length,
      }
      if (action.date !== noDate) {
        properties.isForADay = true
      }
      return properties
    }
    return {}
  }

  getUserId(unusedAction: AllActions, unusedState: RootState): string|undefined {
    return undefined
  }

  getUserProperties(action: AllActions, state: RootState): Properties|null {
    const {alerts, user: {chainDepth: stateChainDepth = 0, hasKnownRisk}} = state
    const chainDepth = action.type === 'SET_KNOWN_RISK' ? action.chainDepth : stateChainDepth
    return {
      countAlertedPeople: Object.keys(alerts).length,
      countAllPeople: getPeopleToAlert(state).length,
      isReferral: !!hasKnownRisk,
      referralDepth: chainDepth,
    }
  }
}
