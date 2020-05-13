import {AllActions} from 'store/actions'
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
      const properties: {isFirstPage?: boolean; numDaysToValidate?: number} = {}
      if (this.isFirstPage) {
        properties.isFirstPage = true
        this.isFirstPage = false
      }
      if (action.pathname === Routes.CONTACTS_SEARCH) {
        properties.numDaysToValidate = getDaysToValidate(state).length
      }
      return properties as Properties
    }
    if (action.type === 'ALERT_PERSON') {
      return {
        // TODO(cyrille): Add how many alerts have been sent to the same person.
        medium: action.alertMedium?.medium || 'self',
      }
    }
    if (action.type === 'COPY_PERSONAL_MESSAGE') {
      const {hasReferralUrl, isDefaultText} = action
      return {hasReferralUrl, isDefaultText}
    }
    return {}
  }

  getUserId(unusedAction: AllActions, unusedState: RootState): string|undefined {
    return undefined
  }

  getUserProperties(unusedAction: AllActions, state: RootState): Properties|null {
    const {alerts, user: {hasKnownRisk}} = state
    return {
      countAlertedPeople: Object.keys(alerts).length,
      countAllPeople: getPeopleToAlert(state).length,
      isReferral: !!hasKnownRisk,
    }
  }
}
