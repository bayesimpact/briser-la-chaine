import {addDays, subDays} from 'date-fns'
import _mapValues from 'lodash/mapValues'
import Storage from 'local-storage-fallback'

import {AllActions, isDateAction, getNextNoDate, noDate} from './actions'
import {computeNeedsAssistanceNow, isProbablySick} from './symptoms'

const today = new Date()
const SAVED_USER_COOKIE = 'user-info'
const SAVED_CONTACTS_COOKIE = 'contact-list'
const SAVED_PEOPLE_COOKIE = 'people-list'
const SAVED_ALERT_COOKIE = 'alerts'

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
    Storage.setItem(SAVED_USER_COOKIE, JSON.stringify(serializeUser(newState)))
  } else {
    Storage.removeItem(SAVED_USER_COOKIE)
  }
  return newState
}


type SerializedContact = Omit<bayes.casContact.Contact, 'date'>
interface SerializedDayContacts extends Omit<bayes.casContact.DayContacts, 'contacts'> {
  contacts?: readonly SerializedContact[]
}
interface SerializedContactState {
  [date: string]: SerializedDayContacts
}

const makeDate = (dateString: string): Date => {
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return noDate
    }
    return date
  } catch {
    return noDate
  }
}

const getStoredContacts = (): ContactState => {
  const jsonContacts: SerializedContactState =
    JSON.parse(Storage.getItem(SAVED_CONTACTS_COOKIE) || '{}') || {}
  return _mapValues(jsonContacts, ({contacts = [], ...rest}, dateString) => ({
    ...rest,
    ...contacts.length ? {
      contacts: contacts.map(({...contact}) => ({
        ...contact,
        date: makeDate(dateString),
      })),
    } : {},
  }))
}

const serializeContacts = (contacts: ContactState): SerializedContactState =>
  _mapValues(contacts, value => {
    if (!value) {
      return value
    }
    const {contacts = [], ...rest} = value
    return {
      ...rest,
      ...contacts.length ? {
        contacts: contacts.map(({date: unusedDate, ...contact}) => contact),
      } : {},
    }
  })

const startingContacts = getStoredContacts()

const isSameDayContact = (contact1: bayes.casContact.Contact, contact2: bayes.casContact.Contact):
boolean => contact1.personId === contact2.personId

// Update the state of a given date, and drop it or its contacts field if they're empty.
const updateDate = (
  state: ContactState,
  date: Date,
  updater: (dateState: bayes.casContact.DayContacts) => bayes.casContact.DayContacts,
): ContactState => {
  const dateString = date === noDate ? getNextNoDate(state) : date.toISOString()
  const oldStateDate = state[dateString] || {}
  const stateDate = updater(oldStateDate)
  if (!Object.keys(stateDate).length) {
    return dropKey(state, dateString)
  }
  if (Object.keys(stateDate).length === 1 && stateDate.contacts?.length === 0) {
    return dropKey(state, dateString)
  }
  return {
    ...state,
    [dateString]: stateDate.contacts?.length ? stateDate : dropKey(stateDate, 'contacts'),
  }
}


function updateDateAndStore(
  state: ContactState,
  date: Date,
  updater: (dateState: bayes.casContact.DayContacts) => bayes.casContact.DayContacts,
): ContactState {
  const dateString = date === noDate ? getNextNoDate(state) : date.toISOString()
  const savedContacts = getStoredContacts()
  const updatedState = updateDate(state, date, updater)
  const serialized = serializeContacts({
    ...savedContacts,
    [dateString]: updatedState[dateString],
  })
  // TODO(cyrille): Find a middleware to do that with all Redux changes.
  Storage.setItem(SAVED_CONTACTS_COOKIE, JSON.stringify(serialized))
  return updatedState
}


// TODO(cyrille): Consider using string dates.
function contacts(state: ContactState = startingContacts, action: AllActions): ContactState {
  if (action.type === 'CLEAN_STORAGE') {
    return {}
  }
  if (!isDateAction(action)) {
    return state
  }
  switch (action.type) {
    case 'CREATE_CONTACT':
      return updateDateAndStore(state, action.date, dateState => ({
        ...dropKey(dateState, 'isDayConfirmed'),
        contacts: [...dateState.contacts || [], action.contact],
      }))
    case 'UPDATE_CONTACT':
      return updateDateAndStore(state, action.date, dateState => ({
        ...dropKey(dateState, 'isDayConfirmed'),
        contacts: dateState.contacts?.map((contact): bayes.casContact.Contact =>
          isSameDayContact(contact, action.contact) ? {...contact, ...action.contact} : contact),
      }))
    case 'DROP_CONTACT':
      return updateDateAndStore(state, action.date, dateState => ({
        ...dropKey(dateState, 'isDayConfirmed'),
        contacts: dateState.contacts?.
          filter((contact): boolean => !isSameDayContact(contact, action.contact)),
      }))
    case 'SAVE_CONTACTS': {
      // TODO(cyrille): Consider not saving them by date anymore (while still being compatible with
      // old users' cache).
      return updateDateAndStore(state, action.date, dateState => ({
        ...dateState,
        contacts: action.contacts,
        isDayConfirmed: true,
      }))
    }
  }
  return state
}

const startingPeople = JSON.parse(Storage.getItem(SAVED_PEOPLE_COOKIE) || '[]') || []

function people(state: PeopleState = startingPeople, action: AllActions): PeopleState {
  switch (action.type) {
    case 'CREATE_NEW_PERSON':
      return [
        ...state,
        {
          name: action.name,
          personId: action.personId,
        },
      ]
    case 'SAVE_CONTACTS': {
      Storage.setItem(SAVED_PEOPLE_COOKIE, JSON.stringify(state))
      return state
    }
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
          isAlertedAnonymously: !!action.alertMedium,
        },
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
