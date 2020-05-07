import {parseISO as parseISODate} from 'date-fns'
import {TFunction} from 'i18next'
import {useSelector as reactUseSelector} from 'react-redux'

import {joinDays} from 'store/i18n'

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
const usePersonContactDays = (person: bayes.casContact.Person, t: TFunction): string =>
  useSelector(({contacts}): string => {
    const days = Object.entries(contacts).
      filter(
        ([day, {contacts}]: [string, bayes.casContact.DayContacts]): boolean =>
          !day.startsWith('NO_DATE') &&
          !!contacts?.some(({personId}: bayes.casContact.Contact): boolean =>
            personId === person.personId)).
      map(([day]: [string, bayes.casContact.DayContacts]): string => day)
    days.sort()
    return joinDays(days.map((day): Date => parseISODate(day)), 'EEEE d MMMM', t)
  })

const useNumPeopleToAlert = (): number => useSelector(({contacts}): number => {
  const personIds = new Set<string>([])
  Object.values(contacts).
    filter(({isDayConfirmed}): boolean => !!isDayConfirmed).
    forEach(({contacts}) => contacts?.forEach(({personId}) => personIds.add(personId)))
  return personIds.size
})

export {useAlert, useNumPeopleToAlert, usePersonContactDays, useSelector, useSymptomsOnsetDate}
