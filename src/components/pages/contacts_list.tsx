import copyToClipboard from 'copy-to-clipboard'
import {format as dateFormat, subDays} from 'date-fns'
import AddLineIcon from 'remixicon-react/AddLineIcon'
import ArrowDownSLineIcon from 'remixicon-react/ArrowDownSLineIcon'
import ArrowUpSLineIcon from 'remixicon-react/ArrowUpSLineIcon'
import Chat3LineIcon from 'remixicon-react/Chat3LineIcon'
import CheckLineIcon from 'remixicon-react/CheckLineIcon'
import CheckDoubleLineIcon from 'remixicon-react/CheckDoubleLineIcon'
import ErrorWarningLineIcon from 'remixicon-react/ErrorWarningLineIcon'
import FileCopyLineIcon from 'remixicon-react/FileCopyLineIcon'
import InformationLineIcon from 'remixicon-react/InformationLineIcon'
import MailLineIcon from 'remixicon-react/MailLineIcon'
import MailSendLineIcon from 'remixicon-react/MailSendLineIcon'
import MessengerLineIcon from 'remixicon-react/MessengerLineIcon'
import PhoneLineIcon from 'remixicon-react/PhoneLineIcon'
import RestartLineIcon from 'remixicon-react/RestartLineIcon'
import UserAddLineIcon from 'remixicon-react/UserAddLineIcon'
import WhatsappLineIcon from 'remixicon-react/WhatsappLineIcon'
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'
import {Redirect} from 'react-router-dom'

import {useFastForward} from 'hooks/fast_forward'
import {alertPerson, noDate, noOp, useDispatch} from 'store/actions'
import {dateOption} from 'store/i18n'
import {useAlert, usePersonContactDays, useSelector} from 'store/selections'
import {Routes} from 'store/url'
import {beautifyPhone, normalizeEmail, normalizePhone, validateEmail,
  validatePhone} from 'store/validation'

import {darkButtonStyle} from 'components/buttons'
import ContactsSearch from 'components/contacts_search'
import DrawerContainer from 'components/drawer_container'
import Input, {InputProps, Inputable} from 'components/input'
import {Modal, ModalConfig} from 'components/modal'
import Tab from 'components/tab'
import Textarea from 'components/textarea'
import heartCelebrationImage from 'images/heart_celebration.svg'


declare global {
  interface Navigator {
    share?: (options: {text: string; title?: string; url: string}) => void
  }
}


function getInitials(name: string): string {
  return name.split(/\s+/, 2).
    map((word: string): string => word.slice(0, 1).toLocaleUpperCase()).
    join('')
}

type InputMode = InputProps['inputMode']

interface PhoneEmailInputProps extends
  Omit<InputProps, 'onChangeDelayMillisecs' | 'inputmode' | 'onChange' | 'value' | 'disabled'> {
  isDone?: true
  isValidated?: boolean
  onChange: (medium?: bayes.casContact.AlertMedium) => void
  value?: bayes.casContact.AlertMedium
}

const isNumber = (value: string): boolean => /^[\d+]/.test(value)
const beautify = (value: string): string => isNumber(value) ? beautifyPhone(value) : value

const PhoneEmailInputBase = (props: PhoneEmailInputProps): React.ReactElement => {
  const {isDone, isValidated, onChange, style, value: {value: propValue = ''} = {},
    ...inputProps} = props

  const [value, setValue] = useState(propValue)
  useEffect((): void => {
    if (propValue && !isNumber(propValue)) {
      setValue(propValue)
    }
  }, [propValue])

  const isNumberInput = isNumber(value)
  const hasValue = !!value
  const [inputMode, setInputMode] = useState<InputMode>(isNumberInput ? 'tel' : 'email')
  const resetInputMode = useCallback((): void =>
    setInputMode(isNumberInput ? 'tel' : 'email'), [isNumberInput])
  useEffect((): void => {
    if (hasValue) {
      resetInputMode()
    }
  }, [hasValue, resetInputMode])

  const [isFocused, setIsFocused] = useState(false)
  const onFocus = useCallback((): void => setIsFocused(true), [])
  const onBlur = useCallback((): void => {
    resetInputMode()
    setIsFocused(false)
  }, [resetInputMode])

  const isValid = !!propValue

  const isInvalid = isValidated && !isValid

  const inputRef = useRef<Inputable>(null)
  const focus = useCallback((): void => inputRef.current?.focus(), [])

  const onValueChange = useCallback((newValue) => {
    setValue(newValue)
    if (newValue === propValue) {
      return
    }
    if (isNumber(newValue) && validatePhone(newValue)) {
      onChange?.({medium: 'SMS', value: normalizePhone(newValue)})
      inputRef.current?.blur()
      return
    }
    if (validateEmail(newValue)) {
      onChange?.({medium: 'email', value: normalizeEmail(newValue)})
      return
    }
    onChange()
  }, [onChange, propValue])
  const Icon = isNumberInput ? PhoneLineIcon : value ? MailLineIcon : AddLineIcon
  const RightIcon = isDone ? CheckDoubleLineIcon :
    isInvalid ? ErrorWarningLineIcon :
      isValid ? CheckLineIcon :
        null
  const iconSize = 24
  const iconContainerStyle: React.CSSProperties = {
    alignItems: 'center',
    bottom: 0,
    cursor: 'text',
    display: 'flex',
    fontSize: 20,
    margin: 1,
    paddingLeft: 5,
    paddingRight: 5,
    position: 'absolute',
    top: 0,
  }
  const rightIconStyle: React.CSSProperties = {
    ...iconContainerStyle,
    color: isInvalid ? colors.ORANGE_RED : 'inherit',
    right: 0,
  }
  const paddedInputStyle = useMemo((): React.CSSProperties => ({
    ...isDone ? {backgroundColor: colors.MEDIUM_GREY} : {},
    borderRadius: 5,
    ...isInvalid ? {borderColor: colors.ORANGE_RED} : {},
    flex: 1,
    paddingLeft: iconSize + 10,
    paddingRight: RightIcon ? iconSize + 10 : 0,
  }), [RightIcon, isDone, isInvalid])
  const errorStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    color: colors.ORANGE_RED,
    fontSize: 13,
    marginTop: 10,
  }

  const {t} = useTranslation()
  const inputContainerStyle: React.CSSProperties = {
    color: isDone ? colors.BLUEISH_GREY : 'inherit',
    cursor: 'pointer',
    display: 'flex',
    position: 'relative',
  }
  return <div style={style}>
    <div style={inputContainerStyle} onClick={focus}>
      <div style={{...iconContainerStyle, left: 0}}>
        <Icon size={iconSize} />
      </div>
      {RightIcon ? <div style={rightIconStyle}>
        <RightIcon size={iconSize} />
      </div> : null}
      <Input
        {...inputProps} value={isValid && !isFocused ? beautify(value) : value}
        onChange={onValueChange} inputMode={inputMode} ref={inputRef} onFocus={onFocus}
        onBlur={onBlur} onChangeDelayMillisecs={500} style={paddedInputStyle}
        disabled={isDone} />
    </div>
    {isInvalid ? <div style={errorStyle}>
      {isNumberInput ?
        t('Numéro de téléphone portable français non reconnu') : t('Email non reconnu')}
    </div> : null}
  </div>
}
const PhoneEmailInput = React.memo(PhoneEmailInputBase)


interface ThankYouPopProps extends Omit<ModalConfig, 'children'|'style'> {
  name: string
}
const heartIconStyle: React.CSSProperties = {
  color: colors.ORANGE,
  height: 75,
  marginBottom: 16,
}
const thanksContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  borderRadius: 210,
  display: 'flex',
  flexDirection: 'column',
  fontSize: 14,
  height: 210,
  justifyContent: 'center',
  width: 210,
}
const ThankYouPopUpBase = ({name, ...otherProps}: ThankYouPopProps): React.ReactElement => {
  return <Modal {...otherProps} style={thanksContainerStyle}>
    <img src={heartCelebrationImage} alt="" style={heartIconStyle} />
    <Trans parent="span" style={{fontSize: 22, fontWeight: 900}}>Merci pour</Trans>
    <span>{name}</span>
  </Modal>
}
const ThankYouPopUp = React.memo(ThankYouPopUpBase)


interface MessageSectionProps {
  period: string
  person: bayes.casContact.Person
  onAlert?: () => void
}

const anonymousContainerStyle: React.CSSProperties = {
  color: colors.WARM_GREY,
  display: 'flex',
  flexDirection: 'column',
  fontSize: 14,
  marginTop: 24,
}
const arrowStyle: React.CSSProperties = {
  alignSelf: 'flex-end',
  height: 13,
}
const messageTextStyle: React.CSSProperties = {
  backgroundColor: colors.MEDIUM_GREY,
  color: colors.BLUEISH_GREY,
  fontSize: 12,
  marginBottom: 10,
  minHeight: 100,
  padding: '16px 8px',
}
const phoneInputStyle = {
  marginTop: 16,
}
const showContentButtonStyle = {
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
}
const AnonymousMessageSectionBase = (props: MessageSectionProps): React.ReactElement => {
  const {onAlert, period, person: {personId}} = props
  const {alertMediums: alertedMediums = []} = useAlert(personId) || {}
  const {t} = useTranslation()
  const [isContentShown, setIsContentShown] = useState(false)
  const dispatch = useDispatch()
  const [isNewAlertMediumShown, setNewAlertMediumShown] = useState(!alertedMediums.length)
  useEffect((): void => {
    if (alertedMediums.length) {
      setNewAlertMediumShown(false)
    }
  }, [alertedMediums.length])
  const showNewAlertMedium = useCallback((): void => setNewAlertMediumShown(true), [])
  const [newAlertMedium, setNewAlertMedium] = useState<bayes.casContact.AlertMedium|undefined>()
  const alertButtonStyle: React.CSSProperties = {
    ...darkButtonStyle,
    alignItems: 'center',
    ...newAlertMedium ? {} : {backgroundColor: colors.MEDIUM_GREY},
    display: 'flex',
    fontWeight: 'normal',
    justifyContent: 'center',
    margin: '24px 0',
  }
  const toggleContentShown =
    useCallback((): void => setIsContentShown(contentShown => !contentShown), [])
  const [isValidated, setValidated] = useState(false)
  useEffect((): void => {
    if (newAlertMedium) {
      setValidated(false)
    }
  }, [newAlertMedium])
  const validateInput = useCallback((): void => setValidated(true), [])
  const sendAlert = useCallback((): void => {
    if (!newAlertMedium) {
      return
    }
    dispatch(alertPerson(personId, newAlertMedium))
    setNewAlertMedium(undefined)
    onAlert?.()
  }, [newAlertMedium, dispatch, onAlert, personId])
  const buttonCallToAction = isNewAlertMediumShown ?
    newAlertMedium ? sendAlert : validateInput :
    showNewAlertMedium
  return <div style={anonymousContainerStyle}>
    <div style={showContentButtonStyle} onClick={toggleContentShown}>
      {/* TODO(cyrille): Update to 'Voir email envoyé' once alerted (and translate).*/}
      <span>Voir le message</span>
      {isContentShown ? <ArrowUpSLineIcon style={arrowStyle} /> :
        <ArrowDownSLineIcon style={arrowStyle} />}
    </div>
    {isContentShown ? <Trans style={messageTextStyle}>
      Bonjour, une personne potentiellement atteinte du COVID-19 a indiqué vous avoir croisé(e) lors
      de sa période contagieuse du {{period: period}}.
      Il est important que vous preniez les précautions nécessaires dès aujourd'hui
      (précaution + confinement).<br />
      Ce site gratuit vous donnera toutes les étapes en fonction de votre degré d'exposition
      au virus&nbsp;:<br />
      [link referral]</Trans> : null}
    {alertedMediums.map((alertMedium) => <PhoneEmailInput
      key={alertMedium.value} isDone={true} value={alertMedium}
      onChange={noOp} style={phoneInputStyle} />)}
    {isNewAlertMediumShown ? <PhoneEmailInput
      value={newAlertMedium} onChange={setNewAlertMedium} style={phoneInputStyle}
      isValidated={isValidated} placeholder={t('Entrer email ou numéro de téléphone')} /> : null}
    <div onClick={buttonCallToAction} style={alertButtonStyle}>
      {isNewAlertMediumShown ? <React.Fragment>
        {t('Alerter anonymement')} <MailSendLineIcon style={{marginLeft: 8}} />
      </React.Fragment> : t('Ajouter un moyen de contact')}
    </div>
  </div>
}
const AnonymousMessageSection = React.memo(AnonymousMessageSectionBase)


const chatIconStyle: React.CSSProperties = {
  height: 20,
  margin: '0 5px',
  width: 20,
}
const shareButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  display: 'flex',
  justifyContent: 'center',
  margin: 0,
}
const personalAlertContainer: React.CSSProperties = {
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 14,
  justifyContent: 'center',
  marginTop: 21,
}
const editInstructionsStyle: React.CSSProperties = {
  color: colors.WARM_GREY,
  cursor: 'pointer',
  fontSize: 10,
  marginBottom: 8,
  textAlign: 'center',
}
const refreshInstructionsStyle: React.CSSProperties = {
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 12,
  marginBottom: 10,
}
const restartIconStyle: React.CSSProperties = {
  marginRight: 4,
}
const PersonalMessageSectionBase =
  ({onAlert, period, person}: MessageSectionProps): React.ReactElement => {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const isAlerted = useAlert(person.personId)
    const defaultText = useMemo((): string => t('Bonjour, ' +
      "j'ai découvert que j'étais probablement atteint(e) du COVID-19 " +
      "or on s'est croisé(e)s pendant ma période contagieuse du {{period}}. " +
      'Je te préviens car il est très important que tu prennes les précautions nécessaires ' +
      '(confinement + briserlachaine). ' +
      'Ce site gratuit te guidera dans toutes les étapes\u00A0: ' +
      "(c'est celui que j'ai utilisé pour te prévenir)", {period: period}), [period, t])
    const [isCustomText, setIsCustomText] = useState(false)
    const displayName = person.displayName || person.name
    const radioButtonStyle: React.CSSProperties = {
      backgroundColor: isAlerted ? '#000' : 'initial',
      border: 'solid 2px #000',
      borderRadius: 15,
      flexShrink: 0,
      height: 18,
      marginRight: 12,
      width: 18,
    }
    const [text, setText] = useState(defaultText)
    useEffect((): void => {
      if (isCustomText) {
        return
      }
      setText(defaultText)
    }, [defaultText, isCustomText])
    const updateText = useCallback((manualText: string) => {
      setIsCustomText(true)
      setText(manualText)
    }, [])
    const handleShare = useCallback(
      (): void => void navigator.share?.(
        {text, title: config.productName, url: config.canonicalUrl}),
      [text])
    const handleMail = useCallback(
      (): void => void window.open(
        `mailto:?subject=${encodeURIComponent(config.productName)}&` +
        `body=${encodeURIComponent(text)}`, '_blank'),
      [text])
    const handleAlert = useCallback((): void => {
      onAlert?.()
      dispatch(alertPerson(person.personId))
    }, [dispatch, onAlert, person.personId])

    const textAreaRef = useRef<Inputable>(null)
    const handleEditText = useCallback((): void => textAreaRef.current?.focus(), [])
    const backToDefaultText = useCallback((): void => {
      setText(defaultText)
      setIsCustomText(false)
    }, [defaultText])

    const [isTextCopied, setIsTextCopied] = useState(false)
    const handleCopy = useCallback((): void => {
      copyToClipboard(text)
      setIsTextCopied(true)
    }, [text])
    useEffect((): (() => void) => {
      if (!isTextCopied) {
        return (): void => void 0
      }
      const timeout = window.setTimeout((): void => setIsTextCopied(false), 2000)
      return (): void => clearTimeout(timeout)
    }, [isTextCopied])
    const textCopiedStyle: React.CSSProperties = {
      alignItems: 'center',
      backgroundColor: colors.ORANGE,
      borderRadius: 5,
      bottom: messageTextStyle.marginBottom,
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      left: 0,
      opacity: isTextCopied ? 1 : 0,
      padding: 8,
      pointerEvents: 'none',
      position: 'absolute',
      right: 0,
      transition: '450ms',
    }

    return <React.Fragment>
      <span onClick={handleEditText} style={editInstructionsStyle}>
        {t('Cliquer pour modifier le message')}
      </span>
      <Textarea
        style={messageTextStyle} value={text} onChange={updateText} ref={textAreaRef} />
      <div style={{position: 'relative'}}><div style={textCopiedStyle}>
        <CheckLineIcon size={16} style={{marginRight: 5}} /> {t('Message copié')}
      </div></div>
      {isCustomText ?
        <span onClick={backToDefaultText} style={refreshInstructionsStyle}>
          <RestartLineIcon size={13} style={restartIconStyle} />
          {t('Réinitialiser le message par défaut')}
        </span> : null}
      {navigator.share ? <div style={shareButtonStyle} onClick={handleShare}>
        {t('Copier et envoyer')}
        <Chat3LineIcon style={chatIconStyle} />
        <MessengerLineIcon style={chatIconStyle} />
        <WhatsappLineIcon style={{...chatIconStyle, marginRight: 0}} />
      </div> : <React.Fragment>
        <div style={shareButtonStyle} onClick={handleCopy}>
          {t('Copier')} <FileCopyLineIcon style={{...chatIconStyle, marginRight: 0}} />
        </div>
        <div style={{...shareButtonStyle, margin: '16px 0 0'}} onClick={handleMail}>
          {t('Envoyer')} <MailLineIcon style={{...chatIconStyle, marginRight: 0}} />
        </div>
      </React.Fragment>}
      <div style={personalAlertContainer} onClick={handleAlert}>
        <div style={radioButtonStyle} />
        <Trans>J'ai alerté {{name: displayName}}</Trans>
      </div>
    </React.Fragment>
  }
const PersonalMessageSection = React.memo(PersonalMessageSectionBase)


const navTitleStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 'bold',
  overflow: 'hidden',
  textAlign: 'center',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}


interface NavItemProps {
  children: React.ReactNode
  containerStyle?: React.CSSProperties
  onClick: () => void
  style?: React.CSSProperties
  title: string
}

const NavItemBase = (props: NavItemProps): React.ReactElement => {
  const {children, onClick, title} = props
  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.AZURE,
    borderRadius: 12,
    color: '#fff',
    cursor: 'pointer',
    flex: 'none',
    margin: '0 7.5px',
    padding: '14px 16px',
    width: 40,
    ...props.containerStyle,
  }
  const style: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: colors.BRIGHT_SKY_BLUE,
    borderRadius: 40,
    display: 'flex',
    fontSize: 14,
    fontWeight: 'bold',
    height: 40,
    justifyContent: 'center',
    margin: '0 auto 10px',
    width: 40,
    ...props.style,
  }
  return <div onClick={onClick} style={containerStyle}>
    <div style={style}>
      {children}
    </div>
    <div style={navTitleStyle}>
      {title}
    </div>
  </div>
}
const NavItem = React.memo(NavItemBase)


interface ContactInListProps {
  isSelected: boolean
  onSelect: (person: bayes.casContact.Person) => void
  person: bayes.casContact.Person
  wasAlerted: boolean
}


const contactInListContainerStyle: React.CSSProperties = {
}
const contactInListSelectedContainerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  boxShadow: '0 5px 10px 0 rgba(0, 0, 0, 0.3)',
  color: '#000',
}
const contactInListSelectedStyle: React.CSSProperties = {
  color: '#fff',
}
const contactInListWasAlertedStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderColor: '#fff',
  color: colors.VIBRANT_GREEN,
}


const ContactInListBase = (props: ContactInListProps): React.ReactElement => {
  const {isSelected, onSelect, person, wasAlerted} = props
  const handleClick = useCallback((): void => onSelect(person), [onSelect, person])
  // TODO(cyrille): Consider only selecting the person's ID, to avoid reselecting.
  useEffect((): void => {
    if (isSelected) {
      onSelect(person)
    }
  }, [isSelected, onSelect, person])
  const displayName = person.displayName || person.name
  const initials = getInitials(displayName)
  const style = wasAlerted ? contactInListWasAlertedStyle :
    isSelected ? contactInListSelectedStyle : undefined
  return <NavItem
    title={displayName} style={style} onClick={handleClick}
    containerStyle={isSelected ? contactInListSelectedContainerStyle : contactInListContainerStyle}>
    {wasAlerted ? <CheckLineIcon /> : initials}
  </NavItem>
}
const ContactInList = React.memo(ContactInListBase)


interface ContactsListProps {
  onAddContact: () => void
  onSelectPerson: (personId: string) => void
  people: readonly bayes.casContact.Person[]
  selectedPerson?: bayes.casContact.Person
}


const contactsListStyle: React.CSSProperties = {
  backgroundColor: colors.BRIGHT_SKY_BLUE,
  color: '#fff',
  maxWidth: 700,
  width: '100vw',
}
const contactsListHeaderStyle: React.CSSProperties = {
  fontSize: 25,
  fontWeight: 'bold',
  padding: '25px 20px 0',
}
const contactsListContainerStyle: React.CSSProperties = {
  display: 'flex',
  overflow: 'scroll',
  padding: '15px 0 23px',
}
const addContactNavContainerItemStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
}
const addContactNavItemStyle: React.CSSProperties = {
  backgroundColor: colors.AZURE,
}

// FIXME(pascal): Properly redirect to final when coming back from final.
// TODO(pascal): Clean up the transition. Make sure everything disappears at the same time.
const ContactsListBase = (props: ContactsListProps): React.ReactElement => {
  const {onAddContact, onSelectPerson, people, selectedPerson} = props
  const {t} = useTranslation()
  const alerts = useSelector(({alerts}): AlertsState => alerts)
  const scrollableListRef = useRef<HTMLDivElement>(null)
  const selectNavItem = useCallback((index: number): void => {
    // Selected index should be in 3rd position (2 on the left + margin).
    scrollableListRef.current?.scrollTo({behavior: 'smooth', left: (index - 2) * 64})
  }, [])
  const handleAddContact = useCallback((): void => {
    selectNavItem(0)
    onAddContact()
  }, [onAddContact, selectNavItem])
  const handleSelectPerson = useCallback(({personId}: bayes.casContact.Person): void => {
    const personIndex = people.findIndex(({personId: otherId}): boolean => personId === otherId)
    if (personIndex >= 0) {
      selectNavItem(personIndex + 1)
    }
    onSelectPerson(personId)
  }, [onSelectPerson, people, selectNavItem])
  if (!people.length) {
    return <Redirect to={Routes.ROOT} />
  }
  const numAlertedPeople = people.filter(({personId}): boolean => !!alerts[personId]).length
  return <div style={contactsListStyle}>
    <Trans style={contactsListHeaderStyle} count={numAlertedPeople}>
      {{numAlertedPeople}}/{{numTotalPeople: people.length}} personne alertée
    </Trans>
    <div style={contactsListContainerStyle} ref={scrollableListRef} className="no-scrollbars">
      <NavItem
        title={t('Ajouter')} onClick={handleAddContact} style={addContactNavItemStyle}
        containerStyle={addContactNavContainerItemStyle}>
        <UserAddLineIcon />
      </NavItem>
      {people.map((person) => <ContactInList
        key={person.personId} person={person} onSelect={handleSelectPerson}
        isSelected={selectedPerson?.personId === person.personId}
        wasAlerted={!!alerts[person.personId]} />)}
    </div>
  </div>
}
const ContactsList = React.memo(ContactsListBase)


interface ContactPersonFormProps {
  person: bayes.casContact.Person
  onDone: () => void
}


const alertAgainButtonStyle: React.CSSProperties = {
  ...shareButtonStyle,
  margin: '16px auto',
  width: 'fit-content',
}

interface ContagiousPeriod {
  contagiousPeriodEnd: Date|undefined
  contagiousPeriodStart: Date|undefined
}

const ContactPersonFormBase = (props: ContactPersonFormProps): React.ReactElement => {
  const {onDone, person} = props
  const {t} = useTranslation()
  const dispatch = useDispatch()
  const {contagiousPeriodEnd = new Date(), contagiousPeriodStart = subDays(new Date(), 1)} =
    useSelector(({user: {contagiousPeriodEnd, contagiousPeriodStart}}): ContagiousPeriod =>
      ({contagiousPeriodEnd, contagiousPeriodStart}))
  const period = useMemo(() =>
    t('{{start}} au {{end}}', {
      end: dateFormat(contagiousPeriodEnd, 'd MMMM yyyy', dateOption),
      start: dateFormat(contagiousPeriodStart, 'd MMMM', dateOption)}),
  [contagiousPeriodEnd, contagiousPeriodStart, t])
  const alerted = useAlert(person.personId)
  const [isSenderAnonymous, setIsSenderAnonymous] =
    useState(alerted?.isAlertedAnonymously !== false)
  useLayoutEffect((): void => {
    setIsSenderAnonymous(alerted?.isAlertedAnonymously !== false)
  }, [alerted, person.personId])
  const [isThanksShown, setIsThanksShown] = useState(false)
  useEffect((): (() => void) => {
    if (!isThanksShown) {
      return (): void => void 0
    }
    const timeout = window.setTimeout((): void => setIsThanksShown(false), 2000)
    return (): void => clearTimeout(timeout)
  }, [isThanksShown])
  const [canBeAlertedAgain, setCanBeenAlertedAgain] = useState(false)
  const handleAlertAgain = useCallback((): void => {
    setCanBeenAlertedAgain(true)
  }, [])
  const handleChangeTab = useCallback(
    () => setIsSenderAnonymous(!isSenderAnonymous), [isSenderAnonymous])
  const openThanks = useCallback((): void => setIsThanksShown(true), [])
  const displayName = person.displayName || person.name
  const contactDays = usePersonContactDays(person, t)
  const isHighRisk = useSelector(({contacts}): boolean =>
    Object.values(contacts).some(({contacts}): boolean =>
      !!contacts?.some(({distance, duration, personId}): boolean =>
        personId === person.personId &&
        // TODO(pascal): Move this logic to a store helper function.
        !!(duration && duration > 10 || distance && distance !== 'far'))))
  // TODO(pascal): Maybe do something when the InformationLineIcon is clicked.
  useLayoutEffect((): void => {
    setCanBeenAlertedAgain(false)
  }, [person])
  useFastForward((): void => {
    if (isThanksShown) {
      setIsThanksShown(false)
      return
    }
    if (!person.personId) {
      return
    }
    openThanks()
    dispatch(alertPerson(person.personId))
  }, [dispatch, isThanksShown, openThanks, person.personId])
  return <div style={{margin: '24px 30px'}}>
    <ThankYouPopUp isShown={isThanksShown} name={displayName} onHidden={onDone} />
    <div style={{alignItems: 'center', display: 'flex'}}>
      <span style={{flex: 1, fontSize: 20, fontWeight: 'bold'}}>
        {displayName}
      </span>
      <span style={{color: colors.WARM_GREY, fontSize: 12, marginRight: 5}}>
        {isHighRisk ? t('Risques importants') : t('Risques modérés')}
      </span>
      <InformationLineIcon size={15} color={colors.WARM_GREY} />
    </div>
    {alerted ? <div style={{color: colors.ORANGE, fontSize: 16, marginTop: 4}}>
      {alerted.isAlertedAnonymously ?
        alerted.alertMediums?.every(({medium}) => medium === 'SMS') ?
          t('Alerté(e) anonymement par SMS') :
          alerted.alertMediums?.every(({medium}) => medium === 'email') ?
            t('Alerté(e) anonymement par email') :
            t('Alerté(e) anonymement') :
        t('Alerté(e) par vos soins')
      }
    </div> : <Trans style={{color: colors.WARM_GREY, fontSize: 12, marginTop: 4}}>
      Croisé(e) {{contactDays}}
    </Trans>}
    {alerted && !alerted.isAlertedAnonymously && !canBeAlertedAgain ? <Trans
      style={alertAgainButtonStyle} onClick={handleAlertAgain}>
      Alerter à nouveau
    </Trans> : <div style={{display: 'flex', flexDirection: 'column', margin: '30px 0 24px'}}>
      <div style={{display: 'flex', marginBottom: 16}}>
        <Tab
          onClick={handleChangeTab} isSelected={isSenderAnonymous}
          text={t('Alerter anonymement')} />
        <Tab
          onClick={handleChangeTab} isSelected={!isSenderAnonymous} text={t('Alerter moi-même')} />
      </div>
      {isSenderAnonymous ? <AnonymousMessageSection
        period={period} person={person} onAlert={openThanks} /> :
        <PersonalMessageSection onAlert={openThanks} period={period} person={person} />}
    </div>}
  </div>
}
const ContactPersonForm = React.memo(ContactPersonFormBase)


const fadeoutMillisec = 1500


const ContactsListPage = (): React.ReactElement => {
  // TODO(pascal): Filter people in validated state.
  const history = useHistory()
  const allPeople = useSelector(({people}: RootState) => people)
  const contacts = useSelector(({contacts}: RootState) => contacts)
  const people = useMemo(
    (): readonly bayes.casContact.Person[] => allPeople.
      filter((person: bayes.casContact.Person): boolean => Object.values(contacts).
        some(({contacts: dayContacts = [], isDayConfirmed = false}): boolean =>
          isDayConfirmed && dayContacts.
            some(({personId}): boolean => person.personId === personId))),
    [allPeople, contacts])
  const alerts = useSelector(({alerts}): AlertsState => alerts)
  const findNextNotAlerted = useCallback(
    () => people.find(({personId}) => !alerts[personId]), [alerts, people])
  const [selectedPersonId, selectPerson] = useState(
    (): string => findNextNotAlerted()?.personId || '',
  )
  const selectedPerson = people.find(({personId}) => selectedPersonId === personId)
  const [isLeaving, setIsLeaving] = useState(false)
  const selectNextNotAlerted = useCallback((): void => {
    const nextPerson = findNextNotAlerted()
    if (nextPerson) {
      selectPerson(nextPerson.personId)
      return
    }
    setIsLeaving(true)
  }, [findNextNotAlerted])
  // Do a kind of onTransitionEnd because it does not work properly with CSS :-(
  useEffect((): (() => void) => {
    if (!isLeaving) {
      return (): void => void 0
    }
    const timeout = window.setTimeout((): void => history.push(Routes.FINAL), fadeoutMillisec)
    return (): void => clearTimeout(timeout)
  }, [history, isLeaving])
  const leavingStyle = useMemo((): React.CSSProperties => ({
    opacity: isLeaving ? 0 : 1,
    transition: `${fadeoutMillisec}ms`,
  }), [isLeaving])
  const [isAddingContact, setIsAddingContact] = useState(false)
  const toggleAddingContact = useCallback((): void => {
    setIsAddingContact((wasAddingContact: boolean): boolean => !wasAddingContact)
  }, [])
  return <DrawerContainer
    isOpen={isAddingContact}
    drawer={<ContactsSearch onClose={toggleAddingContact} date={noDate} />}
    onClose={toggleAddingContact} style={leavingStyle}>
    <ContactsList
      selectedPerson={selectedPerson} people={people}
      onSelectPerson={selectPerson} onAddContact={toggleAddingContact} />
    {selectedPerson ? <ContactPersonForm
      person={selectedPerson} onDone={selectNextNotAlerted} /> : null}
  </DrawerContainer>
}
const MemoPage = React.memo(ContactsListPage)

export default MemoPage
