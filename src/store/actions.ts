import {Action, Dispatch} from 'redux'
import {useDispatch as reactUseDispatch} from 'react-redux'
import {ThunkAction, ThunkDispatch} from 'redux-thunk'

import {sendEmail, sendSMS} from './mailjet'
// TODO(cyrille): Change all imports.
import {useSelector} from './selections'

export type AllActions =
  | AlertPerson
  | ComputeContagiousPeriod
  | CreateContact
  | CreateNewPerson
  | Diagnose
  | DropContact
  | SaveContacts
  | SaveKnownRisk
  | SaveSymptomsOnsetDate
  | UpdateContact
  | UpdatePerson

type DispatchAllActions =
  // Add actions as required.
  ThunkDispatch<RootState, {}, CreateNewPerson> &
  ThunkDispatch<RootState, {}, AlertPerson> &
  Dispatch<AllActions>

interface PersonAction<T extends string> extends Readonly<Action<T>> {
  readonly personId: string
}

export interface AlertPerson extends PersonAction<'ALERT_PERSON'> {
  readonly alertMedium?: bayes.casContact.AlertMedium
}

const NO_DATE = 'NO_DATE'
export const noDate = new Date('2020-01-01')
export const getNextNoDate = (state: ContactState): string => {
  const completedNoDate = Object.entries(state).
    filter(([dateString, {isDayConfirmed}]) => isDayConfirmed && dateString.startsWith(NO_DATE)).
    length
  return `${NO_DATE}_${completedNoDate}`
}

function alertPerson(personId: string, alertMedium?: bayes.casContact.AlertMedium):
ThunkAction<AlertPerson, RootState, {}, AllActions> {
  return (dispatch): AlertPerson => {
    const action = {
      alertMedium,
      personId,
      type: 'ALERT_PERSON',
    } as const
    dispatch(action)
    if (alertMedium?.medium === 'email') {
      sendEmail(alertMedium?.value)
    } else if (alertMedium?.medium === 'SMS') {
      sendSMS(alertMedium?.value)
    }
    return action
  }
}

export type PersonUpdate = Partial<bayes.casContact.Person> & {personId: string}

interface UpdatePerson extends PersonAction<'UPDATE_PERSON'> {
  person: PersonUpdate
}

// TODO(cyrille): Drop, since unused.
function updatePerson(person: PersonUpdate): UpdatePerson {
  return {person, personId: person.personId, type: 'UPDATE_PERSON'}
}

export type ComputeContagiousPeriod = Readonly<Action<'COMPUTE_CONTAGIOUS_PERIOD'>>

const computeContagiousPeriodAction: ComputeContagiousPeriod = {
  type: 'COMPUTE_CONTAGIOUS_PERIOD',
}

export interface SaveSymptomsOnsetDate extends Readonly<Action<'SET_SYMPTOMS_ONSET_DATE'>> {
  symptomsOnsetDate: Date
}

function saveSymptomsOnsetDate(symptomsOnsetDate: Date): SaveSymptomsOnsetDate {
  return {symptomsOnsetDate, type: 'SET_SYMPTOMS_ONSET_DATE'}
}

export type SaveKnownRisk = Readonly<Action<'SET_KNOWN_RISK'>>

const saveKnownRisk: SaveKnownRisk = {
  type: 'SET_KNOWN_RISK',
}

interface CreateNewPerson extends Readonly<Action<'CREATE_NEW_PERSON'>> {
  readonly name: string
  readonly personId: string
}

const makeUniquePersonId = (people: PeopleState): string => {
  const takenPersonIds = new Set(people.map(({personId}) => personId))
  let candidate = (Math.random() * 36).toString(36)
  while (takenPersonIds.has(candidate)) {
    candidate = (Math.random() * 36).toString(36)
    // TODO(cyrille): Limit the number of iterations.
  }
  return candidate
}

function createNewPerson(name: string): ThunkAction<CreateNewPerson, RootState, {}, AllActions> {
  return (dispatch, getState): CreateNewPerson => {
    const personId = makeUniquePersonId(getState().people)
    return dispatch({name, personId, type: 'CREATE_NEW_PERSON'})
  }
}

export interface DateAction<T extends string> extends Readonly<Action<T>> {
  readonly date: Date
}

export interface ContactAction<T extends string> extends DateAction<T> {
  readonly contact: bayes.casContact.Contact
}

const isDateAction = <T extends string>(action: Action<T>): action is DateAction<T> =>
  !!(action as DateAction<T>).date


type CreateContact = ContactAction<'CREATE_CONTACT'>

function createContact(personId: string, date: Date): CreateContact {
  return {contact: {date, personId}, date, type: 'CREATE_CONTACT'}
}

type UpdateContact = ContactAction<'UPDATE_CONTACT'>

function updateContact(contact: bayes.casContact.Contact): UpdateContact {
  return {contact, date: contact.date, type: 'UPDATE_CONTACT'}
}

type DropContact = ContactAction<'DROP_CONTACT'>

function dropContact(contact: bayes.casContact.Contact): DropContact {
  return {contact, date: contact.date, type: 'DROP_CONTACT'}
}

type SaveContacts = DateAction<'SAVE_CONTACTS'>

function saveContacts(date: Date): SaveContacts {
  return {date, type: 'SAVE_CONTACTS'}
}

const useDispatch: () => DispatchAllActions = reactUseDispatch

const noOp = (): void => void 0

interface Diagnose extends Readonly<Action<'DIAGNOSE'>> {
  readonly symptoms: readonly bayes.casContact.Symptom[]
}

function diagnose(symptoms: readonly bayes.casContact.Symptom[]): Diagnose {
  return {symptoms, type: 'DIAGNOSE'}

}
export {alertPerson, computeContagiousPeriodAction, createContact, createNewPerson, diagnose,
  dropContact, isDateAction, saveContacts, saveSymptomsOnsetDate, updatePerson, updateContact,
  saveKnownRisk, useDispatch, useSelector, noOp}
