import {format as dateFormat} from 'date-fns'
import React, {useCallback, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'
import {Redirect} from 'react-router-dom'
import Chat3FillIcon from 'remixicon-react/Chat3FillIcon'
import FootprintFillIcon from 'remixicon-react/FootprintFillIcon'
import LightbulbFillIcon from 'remixicon-react/LightbulbFillIcon'
import MessengerFillIcon from 'remixicon-react/MessengerFillIcon'
import OpenArmFillIcon from 'remixicon-react/OpenArmFillIcon'
import PhoneFillIcon from 'remixicon-react/PhoneFillIcon'
import TeamFillIcon from 'remixicon-react/TeamFillIcon'
import ThumbUpFillIcon from 'remixicon-react/ThumbUpFillIcon'
import UserHeartFillIcon from 'remixicon-react/UserHeartFillIcon'
import WhatsappLineIcon from 'remixicon-react/WhatsappLineIcon'

import {useFastForward} from 'hooks/fast_forward'
import {useWindowHeight} from 'hooks/resize'
import {useNamedRouteStepper} from 'hooks/stepper'
import {finishMemoryStep, useDispatch, visitDeepLink} from 'store/actions'
import {LocalizableString, prepareT} from 'store/i18n'
import {useNumPeopleToAlert, useContagiousPeriod, useSelector,
  useSymptomsOnsetDate} from 'store/selections'
import {MemoryStep, getPath} from 'store/url'

import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import ContactsSearch from 'components/contacts_search'
import MemoryHelper, {MemoryHelperConfig} from 'components/memory_helper'
import TopBar from 'components/top_bar'
import {Modal} from 'components/modal'
import {ExternalLink} from 'components/share_buttons'
import FamilyIcon from 'images/family_icon.svg'
import googleCalendarIcon from 'images/google-agenda-ico.svg'
import googleMapsIcon from 'images/google-map-ico.png'
import outlookIcon from 'images/outlook-ico.svg'


interface NoContactModalProps {
  isShown: boolean
  onClose: () => void
  onValidate: () => void
}
const modalContainer: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: '30px 20px',
}
const modalTitle: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 600,
  marginBottom: 40,
  textAlign: 'center',
}
const noticeContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.PALE_GREY,
  borderRadius: 10,
  display: 'flex',
  fontSize: 13,
  justifyContent: 'center',
  padding: 20,
}
// FIXME(cyrille) Fix the next step.
const NoContactModalBase = (props: NoContactModalProps): React.ReactElement => {
  const {onClose, onValidate} = props
  const {t} = useTranslation()
  return <Modal style={modalContainer} {...props}>
    <div style={modalTitle}>
      {t("Êtes vous sûr(e) de n'avoir croisé personne pendant cette période\u00A0?")}
    </div>
    <div>
      <div style={{...darkButtonStyle, marginBottom: 20}} onClick={onClose} >
        {t('Vérifier à nouveau')}
      </div>
      <div style={{...lightButtonStyle, marginBottom: 20}} onClick={onValidate}>
        {t("Passer à l'étape suivante")}
      </div>
    </div>
    <div style={noticeContainerStyle}>
      <LightbulbFillIcon size={21} />
      <span style={{marginLeft: 19}}>
        {t("Vous pourrez toujours ajouter des personnes à l'étape suivante")}
      </span>
    </div>
  </Modal>
}
const NoContactModal = React.memo(NoContactModalBase)


const titleStyle: React.CSSProperties = {
  color: colors.DARK_GREY_BLUE,
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
}
const strongStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontWeight: 800,
}
const greenStyle: React.CSSProperties = {
  color: colors.SEAWEED,
}
const normalStyle: React.CSSProperties = {
  fontFamily: 'Lato, Helvetica',
  fontWeight: 'normal',
}
const appLinkContainerStyle: React.CSSProperties = {
  display: 'flex',
  marginTop: 15,
}
const appLinkStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.PALE_GREY,
  border: `solid 1px ${colors.LIGHT_BLUE_GREY}`,
  borderRadius: 8,
  color: 'inherit',
  display: 'flex',
  fontSize: 11,
  padding: '8px 10px',
  textDecoration: 'none',
}
const ctaListStyle: React.CSSProperties = {
  fontSize: 13,
  marginTop: 15,
}
const smsPhoneLineStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  marginTop: 15,
}
const smsPhoneIconStyle: React.CSSProperties = {
  background: `linear-gradient(
    to bottom, ${colors.LIGHT_GREEN} 13%, ${colors.MEDIUM_GREEN} 88%
  )`,
  borderRadius: 12,
  marginRight: 10,
  padding: 6,
}
const whatsappIconStyle: React.CSSProperties = {
  ...smsPhoneIconStyle,
  background: colors.WHATSAPP_GREEN,
  padding: 4,
}
const messengerIconStyle: React.CSSProperties = {
  ...smsPhoneIconStyle,
  background: colors.MESSENGER_BLUE,
}
const googleMapsIconStyle: React.CSSProperties = {
  height: 24,
  marginRight: 10,
}

const PeopleFoundBase = (): React.ReactElement => {
  const count = useNumPeopleToAlert()
  const {t} = useTranslation()
  return t('{{count}}\u00A0personne', {count})
}
const PeopleFound = React.memo(PeopleFoundBase)

const DuringPeriodBase = (): React.ReactElement => {
  const {t} = useTranslation()
  const {daysCount: count, endDayText, hasEnded, startDayText} = useContagiousPeriod()
  if (hasEnded) {
    return t(
      'sur la période\u00A0: {{startDayText}} - {{endDayText}} ({{count}} jour)',
      {count, endDayText, startDayText},
    )
  }
  return t('depuis {{startDayText}}', {startDayText})
}
const DuringPeriod = React.memo(DuringPeriodBase)


interface DeepLinkProps extends React.HTMLProps<HTMLAnchorElement> {
  target: string
}

const DeepLinkBase = ({onClick, target, ...props}: DeepLinkProps): React.ReactElement => {
  const dispatch = useDispatch()
  const onLinkClick = useCallback((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    dispatch(visitDeepLink(target))
    onClick?.(event)
  }, [dispatch, target, onClick])
  return <ExternalLink onClick={onLinkClick} {...props} />
}
const DeepLink = React.memo(DeepLinkBase)

const GmapsLinkBase = (): React.ReactElement => {
  const firstDay = useSelector(({user: {contagiousPeriodStart}}) => contagiousPeriodStart) ||
    new Date()
  const url =
    `https://www.google.com/maps/timeline?pb=!1m2!2m1!1s${dateFormat(firstDay, 'yyyy-MM')}`
  return <DeepLink target="Gmaps" style={appLinkStyle} href={url}>
    <img src={googleMapsIcon} alt="Google Maps" style={googleMapsIconStyle} />
    <Trans>Ouvrir mon historique Google Maps</Trans>
  </DeepLink>
}
const GmapsLink = React.memo(GmapsLinkBase)


interface MemoryHelperDefinition extends MemoryHelperConfig {
  isHiddenOnNoContacts?: boolean
  name: LocalizableString<MemoryStep>
}

// TODO(cyrille): Use the names for the path.
const QUESTIONS: readonly MemoryHelperDefinition[] = [
  {
    icon: UserHeartFillIcon,
    name: prepareT('come-to-mind', {ns: 'memoryRouter'}),
    title: <Trans parent={null}>
      Commencez par ajouter toutes les personnes que vous avez croisées qui vous viennent
      à l'esprit
    </Trans>,
  },
  {
    children: <Trans>Au cours d’une soirée, en faisant du sport, &hellip;</Trans>,
    icon: OpenArmFillIcon,
    name: prepareT('friends', {ns: 'memoryRouter'}),
    title: <Trans>
      Avez-vous croisé <span style={greenStyle}>des ami(e)s&nbsp;?</span>
    </Trans>,
  },
  {
    children: <Trans>Lors d'un repas, d'un anniversaire, d'une célébration, &hellip;</Trans>,
    icon: {alt: prepareT('famille'), src: FamilyIcon},
    name: prepareT('family', {ns: 'memoryRouter'}),
    title: <Trans>Avez-vous croisé <span style={greenStyle}>de la famille&nbsp;?</span></Trans>,
  },
  {
    children: <Trans>
      En travaillant au bureau, dans les couloirs, lors d’une pause café, &hellip;
    </Trans>,
    icon: TeamFillIcon,
    name: prepareT('work', {ns: 'memoryRouter'}),
    title: <Trans>Avez-vous croisé <span style={greenStyle}>des collègues&nbsp;?</span></Trans>,
  },
  {
    children: <Trans>Supermarché, banque, voisinage, boulangerie, boutique, &hellip;</Trans>,
    icon: FootprintFillIcon,
    name: prepareT('acquaintance', {ns: 'memoryRouter'}),
    title: <Trans>
      Avez-vous croisé <span style={greenStyle}>une connaissance</span> lors d'un déplacement&nbsp;?
    </Trans>,
  },
  {
    children: <Trans>
      70% des gens oublient des personnes croisées,
      je vous propose que l’on creuse un peu ensemble.
    </Trans>,
    icon: ThumbUpFillIcon,
    isGreen: true,
    isHiddenOnNoContacts: true,
    name: prepareT('go-deeper', {ns: 'memoryRouter'}),
    onNextText: prepareT('Continuer'),
    title: <Trans>Déjà <PeopleFound />&nbsp;!</Trans>,
  },
  {
    children: <div style={ctaListStyle}>
      <Trans style={smsPhoneLineStyle}>
        <Chat3FillIcon color="#fff" style={smsPhoneIconStyle} size={12} />
        Regardez vos messages <DuringPeriod />
      </Trans>
      <Trans style={smsPhoneLineStyle}>
        <PhoneFillIcon color="#fff" style={smsPhoneIconStyle} size={12} />
        Regardez vos appels <DuringPeriod />
      </Trans>
    </div>,
    name: prepareT('phone-logs', {ns: 'memoryRouter'}),
    onNextText: prepareT("C'est fait"),
    title: <Trans style={{fontFamily: 'Lato, Helvetica', fontWeight: 'normal'}}>
      Retrouvez des personnes croisées
      en regardant <span style={strongStyle}>vos appels et SMS</span>.
    </Trans>,
  },
  {
    // TODO(cyrille): Make this work in Android Firefox.
    children: <div style={appLinkContainerStyle}>
      <DeepLink target="WhatsApp" style={appLinkStyle} href="https://wa.me">
        <WhatsappLineIcon color="#fff" style={whatsappIconStyle} size={16} />
        <Trans>Ouvrir {{app: 'WhatsApp'}}</Trans>
      </DeepLink>
      <DeepLink
        target="Messenger" style={{...appLinkStyle, marginLeft: 10}}
        href="fb-messenger://">
        <MessengerFillIcon color="#fff" style={messengerIconStyle} size={12} />
        <Trans>Ouvrir {{app: 'Messenger'}}</Trans>
      </DeepLink>
    </div>,
    name: prepareT('messaging-apps', {ns: 'memoryRouter'}),
    onNextText: prepareT("C'est fait"),
    title: <Trans style={normalStyle}>
      Retrouvez des personnes croisées en
      regardant <span style={strongStyle}>vos réseaux sociaux</span>.
    </Trans>,
  },
  {
    children: <div style={appLinkContainerStyle}><GmapsLink /></div>,
    name: prepareT('location', {ns: 'memoryRouter'}),
    onNextText: prepareT("C'est fait"),
    title: <Trans style={normalStyle}>
      Retrouvez des personnes croisées en
      regardant <span style={strongStyle}>votre historique de déplacements Google Maps</span>.
    </Trans>,
  },
  {
    children: <div style={appLinkContainerStyle}>
      <DeepLink target="GCalendar" style={appLinkStyle} href="https://calendar.google.com">
        <img src={googleCalendarIcon} alt="Google Calendar" style={googleMapsIconStyle} />
        <Trans>Ouvrir {{app: 'Google Calendar'}}</Trans>
      </DeepLink>
      <DeepLink
        target="Outlook"
        style={{...appLinkStyle, marginLeft: 10}} href="https://outlook.live.com/calendar">
        <img src={outlookIcon} alt="Outlook" style={googleMapsIconStyle} />
        <Trans>Ouvrir {{app: 'Outlook'}}</Trans>
      </DeepLink>
    </div>,
    name: prepareT('calendars', {ns: 'memoryRouter'}),
    onNextText: prepareT("C'est fait"),
    title: <Trans style={normalStyle}>
      Retrouvez des personnes croisées en
      regardant <span style={strongStyle}>vos calendriers</span>.
    </Trans>,
  },
  {
    icon: ThumbUpFillIcon,
    isHiddenOnNoContacts: true,
    name: prepareT('congrats', {ns: 'memoryRouter'}),
    onNextText: prepareT('Terminer'),
    title: <Trans>
      Bravo&nbsp;! Vous avez retrouvé <span style={greenStyle}><PeopleFound /></span>
    </Trans>,
  },
] as const

// Fake questions are just congratulation pages for when user has entered any contacts.
const realQuestionsCount = QUESTIONS.
  filter(({isHiddenOnNoContacts}) => !isHiddenOnNoContacts).
  length

const ContagiousPeriodBase = (): React.ReactElement => {
  const history = useHistory()
  const {t} = useTranslation()
  const {t: translateRouterName} = useTranslation('memoryRouter')
  const [isFormShown, setFormShown] = useState(false)
  const {index: currentIndex, setStep: selectQuestion} =
    useNamedRouteStepper(QUESTIONS.map(({name}) => translateRouterName(name)))
  const {isHiddenOnNoContacts: omittedIsHidden, name: stepName,
    ...currentQuestion} = QUESTIONS[currentIndex]
  const dispatch = useDispatch()
  const totalContactsCount = useNumPeopleToAlert()
  const [previousPeopleCount, setPreviousPeopleCount] = useState(totalContactsCount)
  const goToOutro = useCallback((): void => history.push(getPath('MEMORY_OUTRO', t)), [history, t])
  const [isNoContactModalShown, setIsNoContactModalShown] = useState(false)
  const updateQuestion = useCallback((delta: 1|-1): void => {
    const numAddedPeople = totalContactsCount - previousPeopleCount
    if (delta > 0 || numAddedPeople) {
      // Only dispatch an event when going forward or if there actually are added people
      // when going backward.
      dispatch(finishMemoryStep(stepName, numAddedPeople))
    }
    setPreviousPeopleCount(totalContactsCount)
    let newIndex = currentIndex + delta
    while (!totalContactsCount && QUESTIONS[newIndex]?.isHiddenOnNoContacts) {
      newIndex += delta
    }
    if (newIndex >= QUESTIONS.length && totalContactsCount) {
      goToOutro()
      return
    }
    if (newIndex >= QUESTIONS.length) {
      setIsNoContactModalShown(true)
      return
    }
    if (newIndex < 0) {
      return
    }
    selectQuestion(translateRouterName(QUESTIONS[newIndex].name))
  }, [
    currentIndex, dispatch, goToOutro, previousPeopleCount,
    selectQuestion, stepName, totalContactsCount, translateRouterName,
  ])
  const onNext = useCallback(() => updateQuestion(1), [updateQuestion])
  const onPrevious = useCallback(() => updateQuestion(-1), [updateQuestion])
  const symptomsOnsetDate = useSymptomsOnsetDate()
  const handleDetailClose = useCallback(() => setFormShown(false), [])
  const {endDayText, startDayText} = useContagiousPeriod()
  const closeModal = useCallback(() => setIsNoContactModalShown(false), [])

  useFastForward((): void => {
    if (isFormShown) {
      handleDetailClose()
      return
    }
    updateQuestion(1)
  }, [handleDetailClose, isFormShown, updateQuestion])
  const windowHeight = useWindowHeight()

  if (!symptomsOnsetDate) {
    return <Redirect to={getPath('SYMPTOMS_ONSET', t)} />
  }

  const stepIndex = QUESTIONS.
    slice(0, currentIndex).
    filter(({isHiddenOnNoContacts}) => !isHiddenOnNoContacts).
    length + 1
  const contentStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 20px 25px',
  }
  const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: windowHeight,
    margin: '0 auto',
    maxWidth: 700,
  }
  return <div style={pageStyle}>
    <TopBar progress={1} />
    <NoContactModal isShown={isNoContactModalShown} onClose={closeModal} onValidate={goToOutro} />
    <div style={contentStyle}>
      <header style={{marginBottom: 50}}>
        <div style={titleStyle}>
          {t('période contagieuse')}
        </div>
        <div style={{fontFamily: 'Poppins', fontSize: 13, fontWeight: 800, marginTop: 5}}>
          {startDayText} - {endDayText}
        </div>
      </header>
      <MemoryHelper
        onNext={onNext} onPrevious={stepIndex > 1 ? onPrevious : undefined}
        stepCount={realQuestionsCount} stepIndex={stepIndex} {...currentQuestion} />
    </div>
    <ContactsSearch />
  </div>
}
const ContagiousPeriod = React.memo(ContagiousPeriodBase)

export {ContagiousPeriod}
