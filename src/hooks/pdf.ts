import _groupBy from 'lodash/groupBy'
import {format as dateFormat} from 'date-fns'
import jsPDF from 'jspdf'
import {useCallback} from 'react'
import {useTranslation} from 'react-i18next'

import {downloadReportAction, useDispatch} from 'store/actions'
import {IMAGE_NAMESPACE, prepareT, useDateOption} from 'store/i18n'
import {useSelector, getPeopleToAlert} from 'store/selections'

import logoImage from 'images/logo.png'

const marginHoriz = 15
const pageHeight = 297
const pageWidth = 210
const rightBorder = pageWidth - marginHoriz


function usePDFDownloader(): (() => void) {
  const state = useSelector((state: RootState): RootState => state)
  const {t} = useTranslation()
  const dateOption = useDateOption()
  const dispatch = useDispatch()
  return useCallback((): void => {
    const translate = t
    const doc = new jsPDF()
    let cursorY = 0

    const printHeader = (): void => {
      // TODO(pascal): Drop the hack when https://github.com/MrRio/jsPDF/issues/2201 is released
      const image = new Image()
      image.src = translate(logoImage, {ns: IMAGE_NAMESPACE})
      const logoRatio = (Number.parseInt(t('pngLogoHeight')) || 45) /
        (Number.parseInt(t('pngLogoWidth')) || 200)
      doc.addImage(image, 'PNG', 70, 15, pageWidth - 140, (pageWidth - 140) * logoRatio)
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
        t(
          "Le site {{productName}} a été réalisé par l'ONG Bayes Impact.",
          {productName: t('productName')},
        ),
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

      doc.setFontStyle('bold')
      doc.text(person.displayName || person.name, marginHoriz, cursorY + 8)
      doc.setFontStyle('normal')

      const alerts = state.alerts[person.personId]
      if (!alerts.isAlertedAnonymously && alerts.lastSender !== 'product' &&
        alerts.alertMediums) {
        doc.setFontStyle('bold')
        doc.text(
          alerts.alertMediums.map(({value}): string => value).join(' / '),
          marginHoriz, cursorY + 15)
      }

      cursorY += 30
      doc.setFontStyle('normal')
      doc.setFontSize(16)
    }

    const alertsBySender = _groupBy(
      getPeopleToAlert(state),
      ({personId}: bayes.casContact.Person) => state.alerts[personId]?.lastSender || '',
    )

    const printSenderGroup = (sender: ''|bayes.casContact.Sender, title: string): void => {
      const peopleAlertedBySender = alertsBySender[sender]
      if (!peopleAlertedBySender) {
        return
      }
      doc.setFontStyle('bold')
      doc.text(
        translate(title, {count: peopleAlertedBySender.length, productName: t('productName')}),
        marginHoriz, cursorY)
      cursorY += 6
      peopleAlertedBySender.forEach(printPerson)
      cursorY += 6

      if (cursorY > pageHeight - 50) {
        createNewPage()
      }
    }

    printSenderGroup('user', prepareT('Personne contactée moi-même ({{count}})', {count: 0}))

    printSenderGroup(
      'product', prepareT('Personne contactée par {{productName}} ({{count}})', {count: 0}))

    printSenderGroup(
      'physician', prepareT('Personne à contacter par mon médecin ({{count}})', {count: 0}))

    printSenderGroup(
      'none', prepareT("Personne que je n'ai pas pu contacter ({{count}})", {count: 0}))

    printSenderGroup(
      '', prepareT("Personne que je n'ai pas essayé de contacter ({{count}})", {count: 0}))

    printFooter()

    doc.save(t('Récapitulatif {{productName}}.pdf', {productName: t('productName')}))
    dispatch(downloadReportAction)
  }, [dispatch, dateOption, state, t])
}


export {usePDFDownloader}
