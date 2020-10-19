import {detect} from 'detect-browser'
import {AllActions} from 'store/actions'
import {getDaysToValidate, getPeopleToAlert} from 'store/selections'

import {getPage} from 'store/url'

import {AmplitudeLogger, Properties} from './amplitude'

export default class Logger implements AmplitudeLogger<AllActions, RootState> {
  private actionTypesToLog: {[T in AllActions['type']]?: string}

  private isFirstPage: boolean

  private browser: {name?: string} = detect() || {}

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
    const properties: Properties = {
      $hostname: window.location.hostname,
    }
    if (this.browser.name) {
      properties['$browser'] = this.browser.name
    }
    if (action.type === 'PAGE_IS_LOADED') {
      if (this.isFirstPage) {
        properties.isFirstPage = true
        this.isFirstPage = false
      }
      if (getPage(action.pathname) === 'CONTACTS_SEARCH') {
        properties.numDaysToValidate = getDaysToValidate(state).length
      }
      if (getPage(action.pathname) === 'CONTACTS_LIST') {
        const {alerts} = state
        properties.numPeopleLeftToAlert =
          getPeopleToAlert(state).length - Object.keys(alerts).length
      }
      return properties
    }
    if (action.type === 'ALERT_PERSON') {
      return {
        ...properties,
        isAlertedAnonymously: action.isAlertedAnonymously,
        medium: action.alertMedium?.medium || 'self',
        sender: action.sender,
      }
    }
    if (action.type === 'COPY_PERSONAL_MESSAGE') {
      const {hasReferralUrl, isDefaultText} = action
      return {...properties, hasReferralUrl, isDefaultText}
    }
    if (action.type === 'FINISH_MEMORY_STEP') {
      const {numAddedPeople, step} = action
      return {...properties, numAddedPeople, step}
    }
    if (action.type === 'SHARE_APP') {
      const {medium, visualElement} = action
      return {...properties, medium, visualElement}
    }
    if (action.type === 'VISIT_DEEP_LINK') {
      const {target} = action
      return {...properties, target}
    }
    return properties
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
