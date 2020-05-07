import _max from 'lodash/max'
import {format as dateFormat} from 'date-fns'
import jsPDF from 'jspdf'
import {useCallback} from 'react'
import {useTranslation} from 'react-i18next'

import {noDate} from 'store/actions'
import {dateOption, joinDays, prepareT} from 'store/i18n'
import {DISTANCE_OPTIONS, DURATION_OPTIONS} from 'store/options'
import {useSelector} from 'store/selections'

import logoImage from 'images/logo.png'

const marginHoriz = 15
const pageHeight = 297
const pageWidth = 210
const rightBorder = pageWidth - marginHoriz


function usePDFDownloader(): (() => void) {
  const state = useSelector((state: RootState): RootState => state)
  const {t} = useTranslation()
  return useCallback((): void => {
    const translate = t
    const doc = new jsPDF()
    let cursorY = 0

    const printHeader = (): void => {
      // TODO(pascal): Drop the hack when https://github.com/MrRio/jsPDF/issues/2201 is released
      const image = new Image()
      image.src = logoImage
      doc.addImage(image, 'PNG', 70, 15, pageWidth - 140, (pageWidth - 140) * 45 / 200)
      cursorY = 48
    }

    printHeader()

    doc.setFontSize(16)
    const addSeparator = (): void => {
      doc.setDrawColor(colors.WARM_GREY)
      // TODO(pascal): Fix the @types/jspdfx
      // @ts-ignore
      doc.setLineDash([2])
      doc.line(marginHoriz, cursorY, rightBorder, cursorY)
      cursorY += 8
    }

    if (state.user.symptomsOnsetDate) {
      doc.setFontStyle('bold')
      doc.text(t('Date des 1ers symptômes'), marginHoriz, cursorY)
      doc.setFontStyle('normal')
      doc.text(
        dateFormat(state.user.symptomsOnsetDate, 'd MMMM', dateOption),
        rightBorder, cursorY, {align: 'right'})
      cursorY += 6
      addSeparator()
    }

    if (state.user.contagiousPeriodStart && state.user.contagiousPeriodEnd) {
      doc.setFontStyle('bold')
      doc.text(t('Période contagieuse'), marginHoriz, cursorY)
      doc.setFontStyle('normal')
      doc.text(
        dateFormat(state.user.contagiousPeriodStart, 'd MMM', dateOption) + ' - ' +
        dateFormat(state.user.contagiousPeriodEnd, 'd MMM', dateOption),
        rightBorder, cursorY, {align: 'right'})
      cursorY += 6
      addSeparator()
    }

    const printFooter = (): void => {
      doc.setFontSize(10)
      doc.setFontStyle('italic')
      doc.text(
        t("Le site BriserLaChaîne.org a été réalisé par l'ONG Bayes Impact."),
        pageWidth / 2,
        pageHeight - 8,
        {align: 'center'},
      )
    }

    const createNewPage = (): void => {
      printFooter()
      doc.addPage()
      printHeader()
    }

    const printPerson = (person: bayes.casContact.Person, index: number): void => {
      if (cursorY > pageHeight - 50) {
        createNewPage()
      }

      doc.setFontSize(13)
      if (index % 2 === 0) {
        doc.setFillColor(colors.WHITE_TWO)
        doc.rect(marginHoriz / 2, cursorY, pageWidth - marginHoriz, 30, 'F')
      }

      const contacts = Object.values(state.contacts).
        map(({contacts}): bayes.casContact.Contact|undefined => (contacts || []).
          find(({personId}): boolean => personId === person.personId) || undefined).
        filter((contact?: bayes.casContact.Contact): contact is bayes.casContact.Contact =>
          !!contact)

      doc.setFontStyle('bold')
      doc.text(person.displayName || person.name, marginHoriz, cursorY + 8)
      doc.setFontStyle('normal')
      const days = contacts.map(({date}): Date => date).filter((date): boolean => date !== noDate)
      doc.text(
        t('Croisé(e) le {{days}}', {count: days.length, days: joinDays(days, 'dd/MM', translate)}),
        rightBorder, cursorY + 8, {align: 'right'})

      const alerts = state.alerts[person.personId]
      if (!alerts.isAlertedAnonymously && alerts.alertMediums) {
        doc.setFontStyle('bold')
        doc.text(
          alerts.alertMediums.map(({value}): string => value).join(' / '),
          marginHoriz, cursorY + 15)
      }

      doc.setFontStyle('normal')
      const distances = new Set(
        contacts.map(({distance}): bayes.casContact.Distance|undefined => distance),
      )
      const distance = distances.has('close') ? 'close' : distances.has('far') ? 'far' : undefined
      const distanceText =
        DISTANCE_OPTIONS.find(({value}): boolean => distance === value)?.name || prepareT('?')
      doc.text(
        t('Proximité\u00A0: ') + translate(distanceText),
        rightBorder, cursorY + 15, {align: 'right'})

      const maxDuration = _max(contacts.map(({duration}): number => duration || 0))
      const durationText =
        DURATION_OPTIONS.find(({value}): boolean => maxDuration === value)?.name || prepareT('?')
      doc.text(
        t('Durée\u00A0: ') + translate(durationText), rightBorder, cursorY + 22, {align: 'right'})
      cursorY += 30
      doc.setFontSize(16)
    }

    const peopleAlertedPersonally = state.people.
      filter(({personId}): boolean => state.alerts[personId]?.isAlertedAnonymously === false)
    if (peopleAlertedPersonally.length) {
      doc.setFontStyle('bold')
      doc.text(
        t('Personne contactée moi-même ({{count}})', {count: peopleAlertedPersonally.length}),
        marginHoriz, cursorY)
      cursorY += 6
      peopleAlertedPersonally.forEach(printPerson)
      cursorY += 6
    }

    if (cursorY > pageHeight - 50) {
      createNewPage()
    }

    const peopleAlertedAnonymously = state.people.
      filter(({personId}): boolean => !!state.alerts[personId]?.alertMediums)
    if (peopleAlertedAnonymously.length) {
      doc.setFontStyle('bold')
      doc.text(
        t('Personne contactée par {{productName}} ({{count}})', {
          count: peopleAlertedAnonymously.length,
          productName: config.productName,
        }),
        marginHoriz, cursorY)
      cursorY += 6
      peopleAlertedAnonymously.forEach(printPerson)
      cursorY += 6
    }

    printFooter()

    doc.save(t('Récapitulatif {{productName}}.pdf', {productName: config.productName}))
  }, [state, t])
}


export {usePDFDownloader}
