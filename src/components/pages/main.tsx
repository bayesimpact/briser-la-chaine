import * as Sentry from '@sentry/browser'
import {ConnectedRouter, connectRouter, routerMiddleware, RouterState} from 'connected-react-router'
import {History, createBrowserHistory} from 'history'
import React, {Suspense, useLayoutEffect, useState} from 'react'
import {Provider} from 'react-redux'
import {useHistory, useLocation} from 'react-router'
import {Switch, Redirect, Route} from 'react-router-dom'
import {Store, createStore, applyMiddleware, combineReducers} from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import createReduxSentryMiddleware from 'redux-sentry-middleware'
import thunk from 'redux-thunk'
import {polyfill as smoothscrollPolyfill} from 'smoothscroll-polyfill'

import {alerts, contacts, people, user} from 'store/app_reducer'
import {AllActions} from 'store/actions'
import {init as i18nInit} from 'store/i18n'
import {useSymptomsOnsetDate} from 'store/selections'
import {Routes} from 'store/url'

import {ContagiousPeriod} from 'components/pages/search_contacts'
import {Symptoms} from 'components/pages/symptoms'
import {CalendarPage} from 'components/pages/calendar'
import ComeBackLaterPage from 'components/pages/come_back_later'
import ContactsListPage from 'components/pages/contacts_list'
import DiagnosticPage from 'components/pages/diagnostic'
import DiagnosticOutcomePage from 'components/pages/diagnostic_outcome'
import FinalPage from 'components/pages/final'
import FollowUpPage from 'components/pages/follow_up'
import {HealthStatusPage} from 'components/pages/health_status'
import MemoryOutroPage from 'components/pages/outro_memory'
import PedagogyIntroPage from 'components/pages/intro_pedagogy'
import {PedagogyOutroPage} from 'components/pages/outro_pedagogy'
import PrivacyPage from 'components/pages/privacy'
import ReferralPage from 'components/pages/referral'
import SplashPage from 'components/pages/splash'
import TermsPage from 'components/pages/terms'

import 'styles/fonts/Lato/font.css'

require('styles/app.css')

smoothscrollPolyfill()
i18nInit()

interface AppState {
  history: History
  store: Store<RootState, AllActions>
}


// Redirect the React Router from .../index.html?/route to /route
function usePathnameInQueryString(location: ReturnType<typeof useLocation>): void {
  const {pathname, search} = location
  const history = useHistory()
  const pathnameInSearch = search.slice(1)
  useLayoutEffect((): void => {
    if (pathname.endsWith('.html') && pathnameInSearch.startsWith('/')) {
      history.replace(pathnameInSearch)
    }
  }, [history, pathname, pathnameInSearch])
}


function useScrollToTopOnNewPage(location: ReturnType<typeof useLocation>): void {
  const {pathname} = location
  useLayoutEffect((): void => {
    // The 1 is a little hack to go fullscreen on mobile.
    window.scrollTo(0, 1)
  }, [pathname])
}


const App = (): React.ReactElement => {
  const location = useLocation()
  usePathnameInQueryString(location)
  useScrollToTopOnNewPage(location)
  // TODO(cyrille): Add possibility to drop the onset date without cleaning the local storage.
  // FIXME(sil): Check the conditions for which each page is available.
  const hasOnsetDate = !!useSymptomsOnsetDate()
  return <Switch>
    <Route path={Routes.SPLASH} component={SplashPage} />
    <Route path={Routes.MODERATE_RISK_SPLASH} component={SplashPage} />
    <Route path={Routes.HIGH_RISK_SPLASH} component={SplashPage} />
    <Route path={Routes.PEDAGOGY_INTRO} component={PedagogyIntroPage} />
    <Route path={Routes.HEALTH_STATUS} component={HealthStatusPage} />
    <Route path={Routes.DIAGNOSTIC} component={DiagnosticPage} />
    <Route path={Routes.DIAGNOSTIC_OUTCOME} component={DiagnosticOutcomePage} />
    <Route path={Routes.FOLLOW_UP} component={FollowUpPage} />
    <Route path={Routes.COME_BACK_LATER} component={ComeBackLaterPage} />
    <Route path={Routes.REFERRAL} component={ReferralPage} />
    <Route path={Routes.PEDAGOGY_OUTRO} component={PedagogyOutroPage} />
    {hasOnsetDate ? null : <Route path={Routes.SYMPTOMS_ONSET} component={Symptoms} />}
    {hasOnsetDate ? <Route path={Routes.CALENDAR} component={CalendarPage} /> : null}
    <Route path={Routes.CONTACTS_SEARCH} component={ContagiousPeriod} />
    <Route path={Routes.MEMORY_OUTRO} component={MemoryOutroPage} />
    <Route path={Routes.CONTACTS_LIST} component={ContactsListPage} />
    <Route path={Routes.FINAL} component={FinalPage} />
    <Route path={Routes.PRIVACY} component={PrivacyPage} />
    <Route path={Routes.TERMS} component={TermsPage} />
    <Redirect to={hasOnsetDate ? Routes.CONTACTS_SEARCH : Routes.SPLASH} />
  </Switch>
}
const MemoApp = React.memo(App)

type ReduxState = RootState & {router: RouterState<{}|null|undefined>}

function createHistoryAndStore(): AppState {
  const history = createBrowserHistory()
  // TODO(cyrille): Add amplitude middleware.
  // TODO(cyrille): Add analytics middlewares.

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.environment,
    release: config.clientVersion,
  })
  const reduxSentryMiddleware = createReduxSentryMiddleware(Sentry, {
    stateTransformer: (state: RootState) => ({
      ...state,
      // Don't send alerts, they might contain phone number and email addresses.
      alerts: 'REDACTED',
      // Don't send people, they might contain names.
      people: 'REDACTED',
    }),
  })

  const finalCreateStore = composeWithDevTools(applyMiddleware(
    reduxSentryMiddleware,
    thunk,
    routerMiddleware(history),
  ))(createStore)

  // Create the store that will be provided to connected components via Context.
  const store = finalCreateStore<ReduxState, AllActions>(
    combineReducers({
      alerts,
      contacts,
      people,
      router: connectRouter(history),
      user,
    }),
  )
  if (module.hot) {
    module.hot.accept(['store/app_reducer'], (): void => {
      const {alerts: newAlerts, contacts: newContacts, people: newPeople, user: newUser} =
        require('store/app_reducer')
      store.replaceReducer(combineReducers({
        alerts: newAlerts as typeof alerts,
        contacts: newContacts as typeof contacts,
        people: newPeople as typeof people,
        router: connectRouter(history),
        user: newUser as typeof user,
      }))
    })
  }
  return {history, store}
}


// The app augmented by top level wrappers.
const WrappedApp = (): React.ReactElement => {
  const [{history, store}] = useState(createHistoryAndStore)
  return <Provider store={store}>
    <ConnectedRouter history={history}>
      {/* TODO(cyrille): Add a nice waiting page. */}
      <Suspense fallback={<div />}>
        <MemoApp />
      </Suspense>
    </ConnectedRouter>
  </Provider>
}
const MemoWrappedApp = React.memo(WrappedApp)

export {MemoWrappedApp as App}
