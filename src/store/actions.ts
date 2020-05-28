import {TFunction} from 'i18next'
import Storage from 'local-storage-fallback'
import {Action, Dispatch} from 'redux'
import {useDispatch as reactUseDispatch} from 'react-redux'
import {ThunkAction, ThunkDispatch} from 'redux-thunk'

import {sendEmail, sendSMS} from './mailjet'
// TODO(cyrille): Change all imports.
import {useSelector} from './selections'

export type AllActions =
  | AlertPerson
  | ComputeContagiousPeriod
  | CleanStorage
  | ConfirmContacts
  | CopyPersonalMessage
  | CreateContact
  | CreateNewPerson
  | Diagnose
  | DropContact
  | FollowUp
  | GoToExternalDiagnostic
  | GoToGoogleMapsHistory
  | OpenMemoryDay
  | PageIsLoaded
  | SaveContacts
  | SaveKnownRisk
  | SaveSymptomsOnsetDate
  | ShareApp
  | ShowAnonymousMessageContent
  | UpdateContact
  | UpdatePerson

// FIXME(cyrille): Add actions to log.
export const ACTIONS_TO_LOG: {[K in AllActions['type']]?: string} = {
  ALERT_PERSON: 'Alert a contacted person',
  CONFIRM_CONTACTS: 'Confirm all contacts to alert',
  COPY_PERSONAL_MESSAGE: 'Copy personal message',
  DIAGNOSE: 'Diagnostic computed',
  GO_TO_EXTERNAL_DIAG: 'Go to external diagnostic',
  GO_TO_GOOGLE_MAPS_HISTORY: 'Go to Google Maps History',
  OPEN_MEMORY_DAY: 'Open a Day View to add contacts',
  PAGE_IS_LOADED: 'Page is loaded',
  REQUIRED_FOLLOW_UP: 'Require a follow-up',
  SAVE_CONTACTS: 'Add contacts to alert',
  SHARE_APP: 'Share the app',
  SHOW_ANONYMOUS_MESSAGE_CONTENT: 'Anonymous message content is shown',
}

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
// TODO(pascal): Cleanup.
export const getNextNoDate = (state: ContactState): string => {
  const completedNoDate = Object.entries(state).
    filter(([dateString, {isDayConfirmed}]) => isDayConfirmed && dateString.startsWith(NO_DATE)).
    length
  return `${NO_DATE}_${completedNoDate}`
}

function alertPerson(translate: TFunction, personId: string):
ThunkAction<AlertPerson, RootState, {}, AllActions>
function alertPerson(
  translate: TFunction, personId: string, alertMedium: bayes.casContact.AlertMedium,
  risk: ContaminationRisk): ThunkAction<AlertPerson, RootState, {}, AllActions>
function alertPerson(
  translate: TFunction, personId: string, alertMedium?: bayes.casContact.AlertMedium,
  risk?: ContaminationRisk,
): ThunkAction<AlertPerson, RootState, {}, AllActions> {
  return (dispatch): AlertPerson => {
    const action = {
      alertMedium,
      personId,
      type: 'ALERT_PERSON',
    } as const
    dispatch(action)
    if (alertMedium?.medium === 'email') {
      sendEmail(alertMedium?.value, risk || 'low', translate)
    } else if (alertMedium?.medium === 'SMS') {
      sendSMS(alertMedium?.value, risk || 'low', translate)
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

export interface SaveKnownRisk extends Readonly<Action<'SET_KNOWN_RISK'>> {
  chainDepth: number
}

function saveKnownRisk(chainDepth: number): SaveKnownRisk {
  return {
    chainDepth,
    type: 'SET_KNOWN_RISK',
  }
}

export type ShareApp = Readonly<Action<'SHARE_APP'>>

const shareAction: ShareApp = {
  type: 'SHARE_APP',
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

// TODO(pascal): Cleanup.
function createContact(personId: string, date: Date): CreateContact {
  return {contact: {date, personId}, date, type: 'CREATE_CONTACT'}
}

type UpdateContact = ContactAction<'UPDATE_CONTACT'>

// TODO(pascal): Cleanup.
function updateContact(contact: bayes.casContact.Contact): UpdateContact {
  return {contact, date: contact.date, type: 'UPDATE_CONTACT'}
}

type DropContact = ContactAction<'DROP_CONTACT'>

// TODO(pascal): Cleanup.
function dropContact(contact: bayes.casContact.Contact): DropContact {
  return {contact, date: contact.date, type: 'DROP_CONTACT'}
}

type GoToExternalDiagnostic = Readonly<Action<'GO_TO_EXTERNAL_DIAG'>>

const goToExternalDiagnosticAction: GoToExternalDiagnostic = {
  type: 'GO_TO_EXTERNAL_DIAG',
}

type GoToGoogleMapsHistory = Readonly<Action<'GO_TO_GOOGLE_MAPS_HISTORY'>>

const goToGoogleMapsHistoryAction: GoToGoogleMapsHistory = {
  type: 'GO_TO_GOOGLE_MAPS_HISTORY',
}

type OpenMemoryDay = Readonly<Action<'OPEN_MEMORY_DAY'>>

const openMemoryDayAction: OpenMemoryDay = {
  type: 'OPEN_MEMORY_DAY',
}

interface PageIsLoaded extends Readonly<Action<'PAGE_IS_LOADED'>> {
  readonly pathname: string
}

function pageIsLoaded(pathname: string): PageIsLoaded {
  return {
    pathname,
    type: 'PAGE_IS_LOADED',
  }
}

interface SaveContacts extends DateAction<'SAVE_CONTACTS'> {
  readonly contacts: readonly bayes.casContact.Contact[]
}

function saveContacts(date: Date, contacts: readonly bayes.casContact.Contact[]): SaveContacts {
  return {contacts, date, type: 'SAVE_CONTACTS'}
}

const useDispatch: () => DispatchAllActions = reactUseDispatch

const noOp = (): void => void 0

interface Diagnose extends Readonly<Action<'DIAGNOSE'>> {
  readonly symptoms: readonly bayes.casContact.Symptom[]
}

function diagnose(symptoms: readonly bayes.casContact.Symptom[]): Diagnose {
  return {symptoms, type: 'DIAGNOSE'}
}

interface ConfirmContacts extends Readonly<Action<'CONFIRM_CONTACTS'>> {
  readonly numContacts: number
}

function confirmContacts(numContacts: number): ConfirmContacts {
  return {
    numContacts,
    type: 'CONFIRM_CONTACTS',
  }
}

interface CopyPersonalMessage extends Readonly<Action<'COPY_PERSONAL_MESSAGE'>> {
  hasReferralUrl: boolean
  isDefaultText: boolean
}

function copyPersonalMessage(hasReferralUrl: boolean, isDefaultText: boolean): CopyPersonalMessage {
  return {
    // Whether the text that was copied actually contained the referral URL.
    hasReferralUrl,
    // Whether the text that was copied is the text we suggested.
    isDefaultText,
    type: 'COPY_PERSONAL_MESSAGE',
  }
}

export type CleanStorage = Readonly<Action<'CLEAN_STORAGE'>>

function cleanStorage(): CleanStorage {
  Storage.clear()
  return {type: 'CLEAN_STORAGE'}
}

type ShowAnonymousMessageContent = Readonly<Action<'SHOW_ANONYMOUS_MESSAGE_CONTENT'>>

const showAnonymousMessageContentAction: ShowAnonymousMessageContent = {
  type: 'SHOW_ANONYMOUS_MESSAGE_CONTENT',
}

type FollowUp = Readonly<Action<'REQUIRED_FOLLOW_UP'>>

const followUpAction: FollowUp = {type: 'REQUIRED_FOLLOW_UP'}

export {alertPerson, computeContagiousPeriodAction, createContact, createNewPerson, diagnose,
  dropContact, isDateAction, saveContacts, saveSymptomsOnsetDate, updatePerson, updateContact,
  saveKnownRisk, useDispatch, useSelector, noOp, pageIsLoaded, goToExternalDiagnosticAction,
  shareAction, copyPersonalMessage, cleanStorage, showAnonymousMessageContentAction,
  goToGoogleMapsHistoryAction, openMemoryDayAction, confirmContacts, followUpAction,
}

