import * as Sentry from '@sentry/browser'
import {ConnectedRouter, connectRouter, routerMiddleware, RouterState} from 'connected-react-router'
import {History, createBrowserHistory} from 'history'
import React, {Suspense, useEffect, useLayoutEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Provider} from 'react-redux'
import {useHistory, useLocation} from 'react-router'
import {Switch, Redirect, Route} from 'react-router-dom'
import {Store, createStore, applyMiddleware, combineReducers} from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import createReduxSentryMiddleware from 'redux-sentry-middleware'
import thunk from 'redux-thunk'
import {polyfill as smoothscrollPolyfill} from 'smoothscroll-polyfill'

import {createAmplitudeMiddleware} from 'analytics/amplitude'
import Logger from 'analytics/logger'
import {alerts, contacts, people, user} from 'store/app_reducer'
import {ACTIONS_TO_LOG, AllActions, pageIsLoaded, useDispatch} from 'store/actions'
import {init as i18nInit} from 'store/i18n'
import {useSelector, useSymptomsOnsetDate} from 'store/selections'
import {getPath as defineAndGetPath} from 'store/url'

import {ContagiousPeriod} from 'components/pages/search_contacts'
import Symptoms from 'components/pages/symptoms'
import {CalendarPage} from 'components/pages/calendar'
import ComeBackLaterPage from 'components/pages/come_back_later'
import ContactsListPage from 'components/pages/contacts_list'
import DiagnosticPage from 'components/pages/diagnostic'
import DiagnosticOutcomePage from 'components/pages/diagnostic_outcome'
import DownloadPage from 'components/pages/download'
import FinalPage from 'components/pages/final'
import FollowUpPage from 'components/pages/follow_up'
import HealthStatusPage from 'components/pages/health_status'
import MemoryIntroPage from 'components/pages/intro_memory'
import MemoryOutroPage from 'components/pages/outro_memory'
import PedagogyIntroPage from 'components/pages/intro_pedagogy'
import PrivacyPage from 'components/pages/privacy'
import ReferralPage from 'components/pages/referral'
import SplashPage from 'components/pages/splash'
import TermsPage from 'components/pages/terms'

import 'styles/fonts/Lato/font.css'
import 'styles/fonts/Poppins/font.css'

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

function useTitle(title: string): void {
  useEffect((): void => {
    document.title = title
  }, [title])
}


function useScrollToTopOnNewPage(location: ReturnType<typeof useLocation>): void {
  const {pathname} = location
  useLayoutEffect((): void => {
    // The 1 is a little hack to go fullscreen on mobile.
    window.scrollTo(0, 1)
  }, [pathname])
}


function usePageLogger(location: ReturnType<typeof useLocation>): void {
  const {pathname} = location
  const dispatch = useDispatch()
  useEffect((): void => {
    dispatch(pageIsLoaded(pathname))
  }, [dispatch, pathname])
}


const App = (): React.ReactElement => {
  const {t} = useTranslation('url')
  const location = useLocation()
  useTitle(t('productName', {ns: 'translation'}))
  usePathnameInQueryString(location)
  useScrollToTopOnNewPage(location)
  usePageLogger(location)
  const hasFinishedMemorySteps =
    useSelector(({user: {hasFinishedMemorySteps}}) => hasFinishedMemorySteps)
  const {search, hash} = location
  // TODO(sil): Check the conditions for which each page is available.
  const hasOnsetDate = !!useSymptomsOnsetDate()
  // i18next-extract-mark-ns-start url
  return <Switch>
    <Route path={defineAndGetPath('SPLASH', t)} component={SplashPage} />
    <Route path={defineAndGetPath('DIAGNOSED_SPLASH', t)} component={SplashPage} />
    <Route path={defineAndGetPath('MODERATE_RISK_SPLASH', t)} component={SplashPage} />
    <Route path={defineAndGetPath('HIGH_RISK_SPLASH', t)} component={SplashPage} />
    <Route path={defineAndGetPath('PEDAGOGY_INTRO', t)} component={PedagogyIntroPage} />
    <Route path={defineAndGetPath('HEALTH_STATUS', t)} component={HealthStatusPage} />
    <Route path={defineAndGetPath('DIAGNOSTIC', t)} component={DiagnosticPage} />
    <Route path={defineAndGetPath('DIAGNOSTIC_OUTCOME', t)} component={DiagnosticOutcomePage} />
    <Route path={defineAndGetPath('FOLLOW_UP', t)} component={FollowUpPage} />
    <Route path={defineAndGetPath('COME_BACK_LATER', t)} component={ComeBackLaterPage} />
    <Route path={defineAndGetPath('REFERRAL', t)} component={ReferralPage} />
    <Route path={defineAndGetPath('SYMPTOMS_ONSET', t)} component={Symptoms} />
    <Route path={defineAndGetPath('CALENDAR', t)} component={CalendarPage} />
    <Route path={defineAndGetPath('MEMORY_INTRO', t)} component={MemoryIntroPage} />
    <Route path={defineAndGetPath('CONTACTS_SEARCH', t)} component={ContagiousPeriod} />
    <Route path={defineAndGetPath('MEMORY_OUTRO', t)} component={MemoryOutroPage} />
    <Route path={defineAndGetPath('CONTACTS_LIST', t)} component={ContactsListPage} />
    <Route path={defineAndGetPath('DOWNLOAD', t)} component={DownloadPage} />
    <Route path={defineAndGetPath('FINAL', t)} component={FinalPage} />
    <Route path={defineAndGetPath('PRIVACY', t)} component={PrivacyPage} />
    <Route path={defineAndGetPath('TERMS', t)} component={TermsPage} />
    {/* Old Paths kept for users that might arrive here. */}
    <Route path="/probablement">
      <Redirect to={defineAndGetPath('HIGH_RISK_SPLASH', t) + search + hash} />
    </Route>
    <Route path="/peut-etre">
      <Redirect to={defineAndGetPath('MODERATE_RISK_SPLASH', t) + search + hash} />
    </Route>
    <Route path={defineAndGetPath('ROOT', t)}>
      <Redirect
        to={
          (hasOnsetDate ? hasFinishedMemorySteps ?
            defineAndGetPath('CONTACTS_LIST', t) : defineAndGetPath('CONTACTS_SEARCH', t) :
            defineAndGetPath('SPLASH', t)
          ) + search + hash} />
    </Route>
  </Switch>
  // i18next-extract-mark-ns-stop url
}
const MemoApp = React.memo(App)

type ReduxState = RootState & {router: RouterState<unknown>}

function createHistoryAndStore(): AppState {
  const history = createBrowserHistory()
  // TODO(cyrille): Add 3rd party analytics middlewares.

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

  const amplitudeMiddleware = createAmplitudeMiddleware(new Logger(ACTIONS_TO_LOG))

  const finalCreateStore = composeWithDevTools(applyMiddleware(
    // Sentry middleware needs to be first to correctly catch exception down the line.
    reduxSentryMiddleware,
    amplitudeMiddleware,
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
