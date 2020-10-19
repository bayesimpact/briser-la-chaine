import {addDays, eachDayOfInterval, format as dateFormat, isSameDay, formatRelative,
  min as minDates, subDays} from 'date-fns'
import {useTranslation} from 'react-i18next'
import {useSelector as reactUseSelector} from 'react-redux'

import {LocaleOption, useDateOption} from 'store/i18n'
import {Params, getPath} from 'store/url'

const todayDate = new Date()
const yesterdayDate = subDays(new Date(), 1)

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


function getRelativeDate(date: Date, dateOption: LocaleOption): string {
  if (isSameDay(date, todayDate) || isSameDay(date, yesterdayDate)) {
    return formatRelative(date, todayDate, dateOption)
  }
  return dateFormat(date, 'EEEE d MMMM', dateOption)
}

interface ContagiousPeriod {
  daysCount: number
  endDayText: string
  hasEnded: boolean
  startDayText: string
}

const useContagiousPeriod = (): ContagiousPeriod => {
  const dateOption = useDateOption()
  const contagiousPeriodEnd = useSelector(
    ({user: {contagiousPeriodEnd}}) => contagiousPeriodEnd || todayDate)
  const hasEnded = contagiousPeriodEnd < todayDate
  const lastDateToReview = hasEnded ? contagiousPeriodEnd : todayDate
  const contagiousPeriodStart = useSelector(
    ({user: {contagiousPeriodStart}}) => contagiousPeriodStart) || subDays(todayDate, 1)
  const startDayText = getRelativeDate(contagiousPeriodStart, dateOption)
  const endDayText = getRelativeDate(lastDateToReview, dateOption)
  const daysCount = eachDayOfInterval({end: lastDateToReview, start: contagiousPeriodStart}).length
  return {daysCount, endDayText, hasEnded, startDayText}
}

const useContactIds = (): ReadonlySet<string> => new Set(useSelector(({contacts}) => contacts))

const getPeopleToAlert = ({contacts, people}: RootState): readonly bayes.casContact.Person[] => {
  const contactIds = new Set(contacts)
  return people.filter(({personId}: bayes.casContact.Person): boolean => contactIds.has(personId))
}

const usePeopleToAlert = (): readonly bayes.casContact.Person[] => useSelector(getPeopleToAlert)

// TODO(cyrille): Save this number in the state.
const useNumPeopleToAlert = (): number => useSelector((state: RootState): number =>
  getPeopleToAlert(state).length)

const useReferralUrl = (unusedPersonId?: string): string => {
  const chainDepth = useSelector(({user: {chainDepth = 0} = {}}): number => chainDepth)
  const {t} = useTranslation()
  const pathname = t('canonicalUrl') + getPath('HIGH_RISK_SPLASH', t)
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

// TODO(pascal): Add a test.
const useHasCache = (): boolean => useSelector(({alerts, contacts, people, user}): boolean =>
  !!people.length || !!Object.keys(alerts).length || !!Object.keys(contacts).length ||
  !!Object.keys(user).length,
)

export {
  getDaysToValidate,
  getPeopleToAlert,
  useAlert,
  useContactIds,
  useContagiousPeriod,
  useHasCache,
  useNumPeopleToAlert,
  usePeopleToAlert,
  useReferralUrl,
  useSelector,
  useSymptomsOnsetDate,
}

