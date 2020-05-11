import {AllActions} from 'store/actions'

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
    return this.actionTypesToLog[action.type] || action.type
  }

  getEventProperties(action: AllActions, unusedState: RootState): Properties {
    if (action.type === 'PAGE_IS_LOADED') {
      const props: Properties = {
        pathname: action.pathname,
      }
      if (this.isFirstPage) {
        props.isFirstPage = true
        this.isFirstPage = false
      }
      return props
    }
    return {}
  }

  getUserId(unusedAction: AllActions, unusedState: RootState): string|undefined {
    return undefined
  }

  getUserProperties(unusedAction: AllActions, state: RootState): Properties|null {
    const {user: {hasKnownRisk}} = state
    return {
      isReferral: !!hasKnownRisk,
    }
  }
}
