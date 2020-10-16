import {addDays, subDays} from 'date-fns'
import _flatMap from 'lodash/flatMap'
import Storage from 'local-storage-fallback'

import {AllActions} from './actions'
import {computeNeedsAssistanceNow, isProbablySick} from './symptoms'

const today = new Date()
const SAVED_USER_COOKIE = 'user-info'
const SAVED_OLD_CONTACTS_COOKIE = 'contact-list'
const SAVED_CONTACTS_COOKIE = 'contact-set'
const SAVED_PEOPLE_COOKIE = 'people-list'
const SAVED_ALERT_COOKIE = 'alerts'

// TODO(cyrille): Replace with lodash/omit
function dropKey<M, K extends keyof M>(data: M, key: K): Omit<M, K> {
  const {[key]: omittedKey, ...remaining} = data
  return remaining
}

function unsavedUser(state: UserState, action: AllActions): void|UserState {
  switch (action.type) {
    case 'SET_KNOWN_RISK':
      return {
        ...state,
        chainDepth: (action.chainDepth || 0),
        hasKnownRisk: true,
      }
    case 'SET_SYMPTOMS_ONSET_DATE': {
      const {
        contagiousPeriodEnd: omittedEnd,
        contagiousPeriodStart: omittedStart,
        ...otherState
      } = state
      return {
        ...otherState,
        symptomsOnsetDate: action.symptomsOnsetDate,
      }
    }
    case 'COMPUTE_CONTAGIOUS_PERIOD':
      return {
        ...state,
        contagiousPeriodEnd: addDays(
          state.symptomsOnsetDate || today,
          config.numDaysContagious - config.numDaysContagiousBeforeSymptoms),
        contagiousPeriodStart: subDays(
          state.symptomsOnsetDate || today, config.numDaysContagiousBeforeSymptoms),
      }
    case 'DIAGNOSE':
      return {
        ...state,
        contaminationRisk: isProbablySick(action.symptoms),
        isAssistanceRequiredNow: computeNeedsAssistanceNow(action.symptoms),
      }
    case 'CLEAN_STORAGE':
      return {}
    case 'SET_USER_NAME':
      return {
        ...state,
        userName: action.userName,
      }
    case 'FINISH_MEMORY':
      return {
        ...state,
        hasFinishedMemorySteps: true,
      }
  }
}

interface SerializedUser extends
  Omit<UserState, 'symptomsOnsetDate'|'contagiousPeriodEnd'|'contagiousPeriodStart'> {
  symptomsOnsetDate?: string
  contagiousPeriodEnd?: string
  contagiousPeriodStart?: string
}

const serializeUser =
  ({contagiousPeriodEnd, contagiousPeriodStart, symptomsOnsetDate, ...rest}: UserState):
  SerializedUser => ({
    ...rest,
    contagiousPeriodEnd: contagiousPeriodEnd?.toISOString(),
    contagiousPeriodStart: contagiousPeriodStart?.toISOString(),
    symptomsOnsetDate: symptomsOnsetDate?.toISOString(),
  })

const deserializeUser =
  ({contagiousPeriodEnd, contagiousPeriodStart, symptomsOnsetDate, ...rest}: SerializedUser):
  UserState => ({
    ...rest,
    ...symptomsOnsetDate ? {symptomsOnsetDate: new Date(symptomsOnsetDate)} : {},
    ...contagiousPeriodEnd ? {contagiousPeriodEnd: new Date(contagiousPeriodEnd)} : {},
    ...contagiousPeriodStart ? {contagiousPeriodStart: new Date(contagiousPeriodStart)} : {},
  })

const initUser = deserializeUser(JSON.parse(Storage.getItem(SAVED_USER_COOKIE) || '{}') || {})

function user(state: UserState = initUser, action: AllActions): UserState {
  const newState = unsavedUser(state, action)
  if (!newState) {
    return state
  }
  if (Object.keys(newState).length) {
    const anonymizedState = dropKey(newState, 'userName')
    Storage.setItem(SAVED_USER_COOKIE, JSON.stringify(serializeUser(anonymizedState)))
  } else {
    Storage.removeItem(SAVED_USER_COOKIE)
  }
  return newState
}


interface SerializedContactState {
  [date: string]: bayes.casContact.DayContacts
}

const getStoredContacts = (): ContactState => {
  const jsonContacts: ContactState =
    JSON.parse(Storage.getItem(SAVED_CONTACTS_COOKIE) || '[]') || []
  if (jsonContacts.length) {
    return jsonContacts
  }
  const oldJsonContacts: SerializedContactState =
    JSON.parse(Storage.getItem(SAVED_OLD_CONTACTS_COOKIE) || '{}') || {}
  return [...new Set(_flatMap(Object.values(oldJsonContacts), ({contacts}) =>
    contacts?.map(({personId}) => personId) || []))]
}

const startingContacts = getStoredContacts()


function updateAndStore(updatedState: ContactState): ContactState {
  Storage.setItem(SAVED_CONTACTS_COOKIE, JSON.stringify([...updatedState]))
  return updatedState
}


function contacts(state: ContactState = startingContacts, action: AllActions): ContactState {
  switch (action.type) {
    case 'CLEAN_STORAGE':
      return []
    case 'CREATE_CONTACT':
      return updateAndStore([...new Set([
        ...state,
        action.personId,
      ])])
    case 'DROP_CONTACT':
      return updateAndStore(state.filter(personId => personId !== action.personId))
  }
  return state
}

const startingPeople = JSON.parse(Storage.getItem(SAVED_PEOPLE_COOKIE) || '[]') || []

function unsavedPeople(state: PeopleState, action: AllActions): PeopleState {
  switch (action.type) {
    case 'CREATE_NEW_PERSON':
      return [
        ...state,
        {
          name: action.name,
          personId: action.personId,
        },
      ]
    case 'UPDATE_PERSON':
      return state.map((person) => person.personId === action.personId ? {
        ...person,
        ...action.person,
      } : person)
    case 'CLEAN_STORAGE':
      return []
  }
  return state
}

function people(state: PeopleState = startingPeople, action: AllActions): PeopleState {
  const updatedState = unsavedPeople(state, action)
  if (updatedState !== state) {
    if (updatedState.length) {
      Storage.setItem(SAVED_PEOPLE_COOKIE, JSON.stringify(updatedState))
    } else {
      Storage.removeItem(SAVED_PEOPLE_COOKIE)
    }
  }
  return updatedState
}

const startingAlerts: AlertsState = JSON.parse(Storage.getItem(SAVED_ALERT_COOKIE) || '{}') || {}

function alerts(state: AlertsState = startingAlerts, action: AllActions): AlertsState {
  switch (action.type) {
    case 'ALERT_PERSON': {
      const newState = {
        ...state,
        [action.personId]: {
          ...action.alertMedium ? {alertMediums: [
            ...state[action.personId]?.alertMediums || [],
            action.alertMedium,
          ]} : {},
          isAlertedAnonymously: action.isAlertedAnonymously,
          lastSender: action.sender,
        },
      }
      Storage.setItem(SAVED_ALERT_COOKIE, JSON.stringify(newState))
      return newState
    }
    case 'CLEAR_SENDER': {
      const newState = {
        ...state,
        [action.personId]: dropKey(state[action.personId], 'lastSender'),
      }
      Storage.setItem(SAVED_ALERT_COOKIE, JSON.stringify(newState))
      return newState
    }
    case 'CLEAN_STORAGE':
      return {}
  }
  return state
}

export {alerts, contacts, people, user}
