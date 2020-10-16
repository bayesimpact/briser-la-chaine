import {TFunction} from 'i18next'
import Storage from 'local-storage-fallback'
import {Action, Dispatch} from 'redux'
import {useDispatch as reactUseDispatch} from 'react-redux'
import {ThunkAction, ThunkDispatch} from 'redux-thunk'

import {LocaleOption} from './i18n'
import {sendAnonymousEmail, sendAnonymousSMS, sendEmailOnBehalf, sendSMSOnBehalf} from './mailjet'
// TODO(cyrille): Change all imports.
import {useSelector} from './selections'

export type AllActions =
  | AlertPerson
  | CleanStorage
  | ClearSender
  | ClickAlert
  | ComputeContagiousPeriod
  | CopyPersonalMessage
  | CreateContact
  | CreateNewPerson
  | Diagnose
  | DownloadReport
  | DropContact
  | FinishMemory
  | FinishMemoryStep
  | FollowUp
  | GoToExternalDiagnostic
  | GoToGoogleMapsHistory
  | OpenMemoryDay
  | PageIsLoaded
  | SaveKnownRisk
  | SaveSymptomsOnsetDate
  | SaveUserName
  | ShareAlert
  | ShareApp
  | ShowAnonymousMessageContent
  | ShowProductSendingSection
  | ShowMessage
  | ShowMoreWays
  | ShowPhysicianSection
  | ToggleAnonymous
  | UpdatePerson
  | VisitDeepLink

// TODO(cyrille): Check which actions are unused and drop them.
export const ACTIONS_TO_LOG: {[K in AllActions['type']]?: string} = {
  ALERT_PERSON: 'Alert a contacted person',
  CLICK_ALERT: 'Click on the alert button',
  COPY_PERSONAL_MESSAGE: 'Copy personal message',
  CREATE_CONTACT: 'Add a person to contact',
  DIAGNOSE: 'Diagnostic computed',
  DOWNLOAD_REPORT: 'Download a report',
  DROP_CONTACT: 'Remove a person to contact',
  FINISH_MEMORY_STEP: 'Finish a step in memory block',
  GO_TO_EXTERNAL_DIAG: 'Go to external diagnostic',
  GO_TO_GOOGLE_MAPS_HISTORY: 'Go to Google Maps History',
  OPEN_MEMORY_DAY: 'Open a Day View to add contacts',
  PAGE_IS_LOADED: 'Page is loaded',
  REQUIRED_FOLLOW_UP: 'Require a follow-up',
  SHARE_ALERT: 'Send a message to alert a contacted person',
  SHARE_APP: 'Share the app',
  SHOW_ANONYMOUS_MESSAGE_CONTENT: 'Anonymous message content is shown',
  SHOW_MESSAGE: 'Show default alert message',
  SHOW_MORE_WAYS: 'Show other sending options',
  SHOW_PHYSICIAN_SECTION: 'Physician option is shown',
  SHOW_PRODUCT_SENDING_SECTION: 'Show "sending through the app" option',
  TOGGLE_ANONYMOUS: 'Click on anonymous/not anonymous option',
  VISIT_DEEP_LINK: 'Visit a deep link',
}

type DispatchAllActions =
  // Add actions as required.
  ThunkDispatch<RootState, unknown, CreateNewPerson> &
  ThunkDispatch<RootState, unknown, AlertPerson> &
  Dispatch<AllActions>

interface PersonAction<T extends string> extends Readonly<Action<T>> {
  readonly personId: string
}

export interface AlertPerson extends PersonAction<'ALERT_PERSON'> {
  readonly alertMedium?: bayes.casContact.AlertMedium
  readonly isAlertedAnonymously: boolean
  readonly sender: bayes.casContact.Sender
}

function alertPerson(personId: string): ThunkAction<AlertPerson, RootState, unknown, AllActions>
function alertPerson(
  personId: string, sender: 'product',
  alertMedium: bayes.casContact.AlertMedium, userName: string|undefined,
  translate: TFunction, dateOptions: LocaleOption,
): ThunkAction<AlertPerson, RootState, unknown, AllActions>
function alertPerson(
  personId: string, sender: 'physician', alertMedium: bayes.casContact.AlertMedium,
): ThunkAction<AlertPerson, RootState, unknown, AllActions>
function alertPerson(
  personId: string, sender: 'none'): ThunkAction<AlertPerson, RootState, unknown, AllActions>
function alertPerson(
  personId: string, sender: bayes.casContact.Sender = 'user',
  alertMedium?: bayes.casContact.AlertMedium,
  userName?: string, translate?: TFunction, dateOptions?: LocaleOption,
): ThunkAction<AlertPerson, RootState, unknown, AllActions> {
  return (dispatch, getState): AlertPerson => {
    const action = {
      alertMedium,
      isAlertedAnonymously: !!(sender === 'product' && translate && userName),
      personId,
      sender,
      type: 'ALERT_PERSON',
    } as const
    dispatch(action)
    if (sender !== 'product' || !translate) {
      return action
    }
    if (alertMedium?.medium === 'email') {
      if (!userName) {
        sendAnonymousEmail(alertMedium.value, translate)
      } else {
        const {user: {contagiousPeriodEnd, contagiousPeriodStart}} = getState()
        if (!contagiousPeriodStart || !contagiousPeriodEnd || !dateOptions) {
          // This should never happen as we only allow the action once the contagious period is in
          // the state.
          // TODO(pascal): Log the error with Sentry.
        } else {
          sendEmailOnBehalf(
            alertMedium.value, userName, contagiousPeriodStart,
            contagiousPeriodEnd, translate, dateOptions,
          )
        }
      }
    } else if (alertMedium?.medium === 'SMS' && config.isSendingSmsAvailable) {
      if (!userName) {
        sendAnonymousSMS(alertMedium.value, translate)
      } else {
        sendSMSOnBehalf(alertMedium.value, userName, translate)
      }
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

export interface SaveUserName extends Readonly<Action<'SET_USER_NAME'>> {
  userName: string
}

function saveUserName(userName: string): SaveUserName {
  return {type: 'SET_USER_NAME', userName}
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

export const shareMediums = [
  'SMS', 'WhatsApp', 'email', 'Messenger', 'native', 'copy'] as const
export type ShareMedium = (typeof shareMediums)[number]
export interface ShareApp extends Readonly<Action<'SHARE_APP'>> {
  medium: ShareMedium
  visualElement: string
}

function shareApp(medium: ShareMedium, visualElement: string): ShareApp {
  return {
    medium,
    type: 'SHARE_APP',
    visualElement,
  }
}

interface ShareAlert extends Readonly<Action<'SHARE_ALERT'>> {
  medium: ShareMedium
}

function shareAlert(medium: ShareMedium): ShareAlert {
  return {medium, type: 'SHARE_ALERT'}
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

function createNewPerson(name: string):
ThunkAction<CreateNewPerson, RootState, unknown, AllActions> {
  return (dispatch, getState): CreateNewPerson => {
    const personId = makeUniquePersonId(getState().people)
    return dispatch({name, personId, type: 'CREATE_NEW_PERSON'})
  }
}

export interface DateAction<T extends string> extends Readonly<Action<T>> {
  readonly date: Date
}

export interface ContactAction<T extends string> extends Readonly<Action<T>> {
  readonly personId: string
}

const isDateAction = <T extends string>(action: Action<T>): action is DateAction<T> =>
  !!(action as DateAction<T>).date


type CreateContact = ContactAction<'CREATE_CONTACT'>

function createContact(personId: string): CreateContact {
  return {personId, type: 'CREATE_CONTACT'}
}

type DropContact = ContactAction<'DROP_CONTACT'>

function dropContact(personId: string): DropContact {
  return {personId, type: 'DROP_CONTACT'}
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

const useDispatch: () => DispatchAllActions = reactUseDispatch

const noOp = (): void => void 0

interface Diagnose extends Readonly<Action<'DIAGNOSE'>> {
  readonly symptoms: readonly bayes.casContact.Symptom[]
}

function diagnose(symptoms: readonly bayes.casContact.Symptom[]): Diagnose {
  return {symptoms, type: 'DIAGNOSE'}
}

interface CopyPersonalMessage extends Readonly<Action<'COPY_PERSONAL_MESSAGE'>> {
  hasReferralUrl: boolean
  isDefaultText: boolean
}

// TODO(cyrille): Drop, since it's been replaced by share('copy').
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

type ClearSender = PersonAction<'CLEAR_SENDER'>

function clearSender(personId: string): ClearSender {
  return {
    personId,
    type: 'CLEAR_SENDER',
  }
}

type FinishMemory = Readonly<Action<'FINISH_MEMORY'>>

const finishMemoryAction: FinishMemory = {type: 'FINISH_MEMORY'}

interface FinishMemoryStep extends Readonly<Action<'FINISH_MEMORY_STEP'>> {
  numAddedPeople: number
  step: string
}

function finishMemoryStep(step: string, numAddedPeople: number): FinishMemoryStep {
  return {numAddedPeople, step, type: 'FINISH_MEMORY_STEP'}
}

type DownloadReport = Readonly<Action<'DOWNLOAD_REPORT'>>

const downloadReportAction: DownloadReport = {type: 'DOWNLOAD_REPORT'}

type ClickAlert = Readonly<Action<'CLICK_ALERT'>>
type ShowProductSendingSection = Readonly<Action<'SHOW_PRODUCT_SENDING_SECTION'>>
type ShowPhysicianSection = Readonly<Action<'SHOW_PHYSICIAN_SECTION'>>
type ShowMessage = Readonly<Action<'SHOW_MESSAGE'>>
type ShowMoreWays = Readonly<Action<'SHOW_MORE_WAYS'>>
type ToggleAnonymous = Readonly<Action<'TOGGLE_ANONYMOUS'>>
const clickAlertAction: ClickAlert = {type: 'CLICK_ALERT'}
const productSendingSectionAction: ShowProductSendingSection =
  {type: 'SHOW_PRODUCT_SENDING_SECTION'}
const physicianSectionShownAction: ShowPhysicianSection = {type: 'SHOW_PHYSICIAN_SECTION'}
const showMessageAction: ShowMessage = {type: 'SHOW_MESSAGE'}
const showMoreWaysAction: ShowMoreWays = {type: 'SHOW_MORE_WAYS'}
const toggleAnonymousAction: ToggleAnonymous = {type: 'TOGGLE_ANONYMOUS'}

interface VisitDeepLink extends Readonly<Action<'VISIT_DEEP_LINK'>> {
  target: string
}

function visitDeepLink(target: string): VisitDeepLink {
  return {target, type: 'VISIT_DEEP_LINK'}
}
export {alertPerson, computeContagiousPeriodAction, createContact, createNewPerson, diagnose,
  dropContact, isDateAction, saveSymptomsOnsetDate, updatePerson,
  saveKnownRisk, useDispatch, useSelector, noOp, pageIsLoaded, goToExternalDiagnosticAction,
  shareApp, copyPersonalMessage, cleanStorage, showAnonymousMessageContentAction, shareAlert,
  goToGoogleMapsHistoryAction, openMemoryDayAction, followUpAction, clearSender,
  downloadReportAction, saveUserName, productSendingSectionAction, physicianSectionShownAction,
  showMessageAction, toggleAnonymousAction, clickAlertAction, showMoreWaysAction, visitDeepLink,
  finishMemoryStep, finishMemoryAction,
}

