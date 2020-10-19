import CheckboxCircleFillIcon from 'remixicon-react/CheckboxCircleFillIcon'
import CloseCircleFillIcon from 'remixicon-react/CloseCircleFillIcon'
import SendPlane2FillIcon from 'remixicon-react/SendPlane2FillIcon'
import React, {useCallback, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {Link, Redirect} from 'react-router-dom'

import {useFastForward} from 'hooks/fast_forward'

import {alertPerson, clickAlertAction, clearSender, useDispatch} from 'store/actions'
import {useAlert, usePeopleToAlert, useSelector} from 'store/selections'
import {getPath} from 'store/url'

import ContactPersonForm from 'components/alert_contacts'
import {darkButtonStyle} from 'components/buttons'
import DrawerContainer from 'components/drawer_container'

import {BottomDiv} from 'components/navigation'
import ProgressBar from 'components/progress_bar'
import WithThankYouPopUp from 'components/thank_you'
import TopBar from 'components/top_bar'


// TODO(pascal): Remove once we upgrade TypeScript to v3.9+
declare global {
  interface Navigator {
    share(data?: {text?: string; title?: string; url?: string}): Promise<void>
  }
}


interface ContactInListProps {
  onClick: (person: bayes.casContact.Person) => void
  onClose: () => void
  person: bayes.casContact.Person
}


const contactInListStyle: React.CSSProperties = {
  alignItems: 'center',
  borderBottom: `1px solid ${colors.LIGHT_BLUE_GREY}`,
  display: 'flex',
  fontFamily: 'Lato, Helvetica',
  fontWeight: 'bold',
  height: 66,
  justifyContent: 'space-between',
}

const iconMarginStyle: React.CSSProperties = {
  marginRight: 6,
}
const contactButtonStyle: React.CSSProperties = {
  alignItems: 'center',
  border: `2px solid ${colors.LIGHT_BLUE_GREY}`,
  borderRadius: '100%',
  cursor: 'pointer',
  display: 'flex',
  height: 21,
  justifyContent: 'center',
  marginRight: 10,
  width: 21,
}

const alertButtonStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.ALMOST_BLACK,
  borderRadius: 11,
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 13,
  justifyContent: 'center',
  padding: 10,
}
const alertMethodStyle: React.CSSProperties = {
  color: colors.DARK_GREY_BLUE,
  cursor: 'pointer',
  fontSize: 12,
}

const ContactInListBase = (props: ContactInListProps): React.ReactElement => {
  const {onClick, onClose, person} = props
  const {t} = useTranslation()
  const dispatch = useDispatch()
  const {isAlertedAnonymously, lastSender: sender} = useAlert(person.personId) || {}
  const wasAlerted = !!sender
  const handleClick = useCallback((): void => {
    onClick(person)
    if (wasAlerted) {
      dispatch(clearSender(person.personId))
    } else {
      dispatch(clickAlertAction)
    }
  }, [dispatch, onClick, person, wasAlerted])
  const displayName = person.displayName || person.name
  const [isThanksShown, setIsThanksShown] = useState(false)
  const alertMethod = sender === 'product' && isAlertedAnonymously ? t('Alerté(e) anonymement') :
    sender === 'product' ? t('Alerté(e) par {{productName}}', {productName: t('productName')}) :
      sender === 'user' ? t('Alerté(e) moi-même') :
        sender === 'none' ? t('Non alerté(e)') :
          sender === 'physician' ? t('Mon médecin le(la) contactera') : ''

  const openThanks = useCallback((): void => setIsThanksShown(true), [])
  const closeThanks = useCallback((): void => setIsThanksShown(false), [])
  const handleAlert = useCallback((): void => {
    if (wasAlerted) {
      return
    }
    openThanks()
    dispatch(alertPerson(person.personId))
  }, [dispatch, openThanks, person.personId, wasAlerted])

  useFastForward((): void => {
    if (isThanksShown) {
      closeThanks()
      return
    }
    handleAlert()
  }, [closeThanks, handleAlert, isThanksShown])
  const ItemIcon = sender === 'none' ? CloseCircleFillIcon : CheckboxCircleFillIcon
  const iconColor = sender === 'none' ? colors.STRONG_PINK : colors.MINTY_GREEN

  return <WithThankYouPopUp
    isThanksShown={isThanksShown} displayName={displayName} onClose={closeThanks}
    onHidden={onClose}>
    <div style={contactInListStyle}>
      <div style={{alignItems: 'center', display: 'flex', fontSize: 17, lineHeight: 1}}>
        {wasAlerted ? <ItemIcon style={iconMarginStyle} size={30} color={iconColor} /> :
          <div onClick={handleAlert} style={contactButtonStyle} />}
        {displayName}
      </div>
      {wasAlerted ? <div onClick={handleClick} style={alertMethodStyle}>{alertMethod}</div> :
        <div style={alertButtonStyle} onClick={handleClick}>
          <span style={{marginRight: 5}}>{t('Alerter')}</span>
          <SendPlane2FillIcon size={14} />
        </div>}
    </div>
  </WithThankYouPopUp>
}
const ContactInList = React.memo(ContactInListBase)


interface ContactsListProps {
  onClose: () => void
  onContactClick: (person: bayes.casContact.Person) => void
  people: readonly bayes.casContact.Person[]
}


const contactsListHeaderStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 'normal',
  margin: '33px 0 15px',
}
const contactsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: '15px 0px 23px',
}
const progressContainerStyle: React.CSSProperties = {
  backgroundColor: 'rgb(14, 179, 253, 0.1)',
  borderRadius: 4.5,
  height: 9,

}
const progressTextStyle: React.CSSProperties = {
  color: colors.BRIGHT_SKY_BLUE,
  fontSize: 16,
  fontStyle: 'normal',
  marginTop: 10,
  textAlign: 'left',
}
const progressStyle: React.CSSProperties = {
  backgroundColor: colors.BRIGHT_SKY_BLUE,
  bottom: 0,
  left: 0,
  position: 'absolute',
  top: 0,
  transition: '200ms 500ms',
}

const ContactsListBase = (props: ContactsListProps): React.ReactElement => {
  const {onContactClick, onClose, people} = props
  const alerts = useSelector(({alerts}): AlertsState => alerts)
  const {t} = useTranslation()
  const numAlertedPeople = people.filter(({personId}): boolean => !!alerts[personId]).length
  const numPeopleToAlert = people.length - numAlertedPeople
  return <div>
    <TopBar progress={2} />
    <div style={{margin: '0 20px'}}>
      <Trans parent="header" style={contactsListHeaderStyle}>
        <strong style={{fontFamily: 'Poppins', fontWeight: 800}}>
          Alerter
        </strong> chaque personne croisée
      </Trans>
      <ProgressBar
        progress={numAlertedPeople} total={people.length} progressTextStyle={progressTextStyle}
        progressStyle={progressStyle} progressContainerStyle={progressContainerStyle}
        text={t('{{count}} personne restante', {count: numPeopleToAlert})} />
      <div style={contactsContainerStyle}>
        <div style={{flex: 'none', width: 25}} />
        {people.map((person) => <ContactInList
          key={person.personId} person={person} onClick={onContactClick} onClose={onClose} />)}
        <div style={{flex: 'none', width: 25}} />
      </div>
    </div>
  </div>
}
const ContactsList = React.memo(ContactsListBase)


const contentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: window.innerHeight,
}
const completeButtonContainer: React.CSSProperties = {
  alignSelf: 'stretch',
  backgroundColor: '#fff',
  borderRadius: '25px 25px 0 0',
  boxShadow: '0 0 15px 0 rgba(0, 0, 0, 0.15)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 16,
  padding: '15px 30px',
}
const completeButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  display: 'block',
  margin: '5px auto',
  maxWidth: 420,
}

const ContactsListPage = (): React.ReactElement => {
  const people = usePeopleToAlert()
  const {t} = useTranslation()
  const alerts = useSelector(({alerts}): AlertsState => alerts)
  const numPeopleToAlert = people.filter(person => !alerts[person.personId]).length
  const [contactBeingAlerted, setContactBeingAlerted] =
    useState<bayes.casContact.Person|undefined>()
  const [isCloseButtonShown, setIsCloseButtonShown] = useState(true)
  const isEndButtonShown = !numPeopleToAlert

  const closeDrawer = useCallback((): void => setContactBeingAlerted(undefined), [])
  if (!people) {
    return <Redirect to={getPath('CONTACTS_SEARCH', t)} />
  }
  return <DrawerContainer
    isOpen={!!contactBeingAlerted}
    drawer={<ContactPersonForm
      person={contactBeingAlerted} onDone={closeDrawer}
      toggleCloseButton={setIsCloseButtonShown} />}
    onClose={isCloseButtonShown ? closeDrawer : undefined} mainStyle={contentStyle} margin={50}>
    <ContactsList people={people} onContactClick={setContactBeingAlerted} onClose={closeDrawer} />
    {isEndButtonShown ? <BottomDiv style={completeButtonContainer}>
      <Link to={getPath('DOWNLOAD', t)} style={completeButtonStyle}>
        {t('Terminer')}
      </Link>
    </BottomDiv> : null}
  </DrawerContainer>
}
const MemoPage = React.memo(ContactsListPage)

export default MemoPage
