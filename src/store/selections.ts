import {addDays, eachDayOfInterval, min as minDates, parseISO as parseISODate,
  subDays} from 'date-fns'
import {TFunction} from 'i18next'
import {useTranslation} from 'react-i18next'
import {useSelector as reactUseSelector} from 'react-redux'

import {joinDays, useDateOption} from 'store/i18n'
import {Params, Routes} from 'store/url'

const useSelector: <T>(
  selector: ((state: RootState) => T),
  equallityFn?: (left: T, right: T) => boolean,
) => T = reactUseSelector

// Select the last alert for a given person.
const useAlert = (personId: string): undefined|bayes.casContact.AlertPersonState =>
  useSelector(({alerts}) => alerts[personId])

// Select the date of symptoms onset of the user.
const useSymptomsOnsetDate = (): undefined|Date =>
  useSelector(({user: {symptomsOnsetDate}}) => symptomsOnsetDate)

// Select a text with all the days a person has been in contact with the user.
const usePersonContactDays = (
  person: bayes.casContact.Person, t: TFunction, dateOption: ReturnType<typeof useDateOption>,
): string =>
  useSelector(({contacts}): string => {
    const days = Object.entries(contacts).
      filter(
        ([day, {contacts}]: [string, bayes.casContact.DayContacts]): boolean =>
          !day.startsWith('NO_DATE') &&
          !!contacts?.some(({personId}: bayes.casContact.Contact): boolean =>
            personId === person.personId)).
      map(([day]: [string, bayes.casContact.DayContacts]): string => day)
    days.sort()
    return joinDays(days.map((day): Date => parseISODate(day)), 'EEEE d MMMM', t, dateOption)
  })

const getPeopleToAlert = ({contacts, people}: RootState): readonly bayes.casContact.Person[] =>
  people.filter((person: bayes.casContact.Person): boolean => Object.values(contacts).
    some(({contacts: dayContacts = [], isDayConfirmed = false}): boolean =>
      isDayConfirmed && dayContacts.some(({personId}): boolean => person.personId === personId)))

const usePeopleToAlert = (): readonly bayes.casContact.Person[] => useSelector(getPeopleToAlert)

// TODO(cyrille): Save this number in the state.
const useNumPeopleToAlert = (): number => useSelector((state: RootState): number =>
  getPeopleToAlert(state).length)

const useIsHighRisk = (personId: string): boolean => useSelector(({contacts}): boolean =>
  Object.values(contacts).some(({contacts}): boolean =>
    !!contacts?.some(({distance, duration, personId: otherId}): boolean =>
      personId === otherId &&
      !!(duration && duration > 10 || distance && distance !== 'far'))))

const useReferralUrl = (personId: string): string => {
  const chainDepth = useSelector(({user: {chainDepth = 0} = {}}): number => chainDepth)
  const isHighRisk = useIsHighRisk(personId)
  const {t} = useTranslation()
  const pathname =
    t('canonicalUrl') + (isHighRisk ? Routes.HIGH_RISK_SPLASH : Routes.MODERATE_RISK_SPLASH)
  if (!chainDepth) {
    return pathname
  }
  return pathname + `?${encodeURIComponent(Params.DEPTH)}=${chainDepth}`
}

// TODO(sil): Update this for reduced days to review.
// TODO(sil): Add a test.
const getDaysToValidate = ({user}: RootState): readonly Date[] => {
  const todayDate = new Date()
  const {contagiousPeriodEnd, contagiousPeriodStart, symptomsOnsetDate} = user
  const firstSymptomsDate = symptomsOnsetDate || todayDate
  const contagiousStartDate = contagiousPeriodStart ||
    subDays(firstSymptomsDate, config.numDaysContagiousBeforeSymptoms)
  const contagiousEndDate = contagiousPeriodEnd ||
    addDays(contagiousStartDate, config.numDaysContagious)
  return eachDayOfInterval(
    {end: minDates([todayDate, contagiousEndDate]), start: contagiousStartDate})
}

const useDaysToValidate = (): readonly Date[] => useSelector(getDaysToValidate)

// TODO(pascal): Add a test.
const useHasCache = (): boolean => useSelector(({alerts, contacts, people, user}): boolean =>
  !!people.length || !!Object.keys(alerts).length || !!Object.keys(contacts).length ||
  !!Object.keys(user).length,
)

export {
  getDaysToValidate,
  getPeopleToAlert,
  useAlert,
  useDaysToValidate,
  useHasCache,
  useIsHighRisk,
  useNumPeopleToAlert,
  usePeopleToAlert,
  usePersonContactDays,
  useReferralUrl,
  useSelector,
  useSymptomsOnsetDate,
}

