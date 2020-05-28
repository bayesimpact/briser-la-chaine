import copyToClipboard from 'copy-to-clipboard'
import {format as dateFormat, subDays} from 'date-fns'
import AddLineIcon from 'remixicon-react/AddLineIcon'
import ArrowDownSLineIcon from 'remixicon-react/ArrowDownSLineIcon'
import ArrowUpSLineIcon from 'remixicon-react/ArrowUpSLineIcon'
import CheckDoubleLineIcon from 'remixicon-react/CheckDoubleLineIcon'
import CheckLineIcon from 'remixicon-react/CheckLineIcon'
import CheckboxCircleFillIcon from 'remixicon-react/CheckboxCircleFillIcon'
import ErrorWarningLineIcon from 'remixicon-react/ErrorWarningLineIcon'
import FileCopyLineIcon from 'remixicon-react/FileCopyLineIcon'
import InformationLineIcon from 'remixicon-react/InformationLineIcon'
import MailLineIcon from 'remixicon-react/MailLineIcon'
import MailSendLineIcon from 'remixicon-react/MailSendLineIcon'
import PhoneLineIcon from 'remixicon-react/PhoneLineIcon'
import RestartLineIcon from 'remixicon-react/RestartLineIcon'

import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'

import {useBackgroundColor} from 'hooks/background_color'
import {useFastForward} from 'hooks/fast_forward'
import {alertPerson, copyPersonalMessage, noDate, noOp, showAnonymousMessageContentAction,
  useDispatch} from 'store/actions'
import {useDateOption} from 'store/i18n'
import {useAlert, useIsHighRisk, usePersonContactDays, useReferralUrl, usePeopleToAlert,
  useSelector} from 'store/selections'
import {Routes} from 'store/url'
import {beautifyPhone, normalizeEmail, normalizePhone, validateEmail,
  validatePhone} from 'store/validation'

import BurgerMenu from 'components/burger_menu'
import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import ContactsSearch from 'components/contacts_search'
import DrawerContainer from 'components/drawer_container'
import Input, {InputProps, Inputable} from 'components/input'
import {Modal, ModalConfig} from 'components/modal'
import {BottomDiv, mobileOnDesktopStyle} from 'components/navigation'
import ShareButtons from 'components/share_buttons'
import Tabs from 'components/tabs'
import Textarea from 'components/textarea'
import heartCelebrationImage from 'images/heart_celebration.svg'


// TODO(pascal): Remove once we upgrade TypeScript to v3.9+
declare global {
  interface Navigator {
    share(data?: {text?: string; title?: string; url?: string}): Promise<void>
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
  const iconSize = 34
  const iconMarginLeft = 10
  const iconMarginRight = 10
  const iconContainerStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: Icon === AddLineIcon ? colors.MINTY_GREEN : 'transparent',
    borderRadius: iconSize,
    color: Icon === AddLineIcon ? '#fff' : '#000',
    cursor: 'text',
    display: 'flex',
    fontSize: 20,
    height: iconSize,
    justifyContent: 'center',
    marginLeft: iconMarginLeft,
    marginRight: iconMarginRight,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: iconSize,
  }
  const rightIconStyle: React.CSSProperties = {
    ...iconContainerStyle,
    backgroundColor: isValid && !isDone ? colors.MINTY_GREEN : 'transparent',
    color: isInvalid ? colors.BARBIE_PINK :
      isDone ? colors.MINTY_GREEN : isValid ? '#fff' : 'inherit',
    right: 1,
  }
  const paddedInputStyle = useMemo((): React.CSSProperties => ({
    borderRadius: 23,
    ...isInvalid ? {borderColor: colors.BARBIE_PINK} : {},
    boxShadow: '0 12px 19px 0 rgba(60, 128, 209, 0.09)',
    flex: 1,
    height: 58,
    paddingLeft: iconSize + iconMarginLeft + iconMarginRight,
    paddingRight: RightIcon ? iconSize + 10 : 0,
  }), [RightIcon, isInvalid])
  const errorStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    color: colors.BARBIE_PINK,
    fontSize: 13,
    marginTop: 10,
  }

  const {t} = useTranslation()
  const inputContainerStyle: React.CSSProperties = {
    cursor: 'pointer',
    display: 'flex',
    position: 'relative',
  }
  return <div style={style}>
    <div style={inputContainerStyle} onClick={focus}>
      <div style={{...iconContainerStyle, left: 1}}>
        <Icon size={iconSize * .7} />
      </div>
      {RightIcon ? <div style={rightIconStyle}>
        <RightIcon size={iconSize * .7} />
      </div> : null}
      <Input
      // FIXME(cyrille): Show "Numéro de téléphone" or "Adresse e-mail" above
      // if done and not focused.
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
  height: 75,
  marginBottom: 16,
}
const thankYouTextStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 22,
  fontWeight: 800,
  textAlign: 'center',
}
const thankYouNameStyle: React.CSSProperties = {
  fontFamily: 'Lato, Helvetica',
  fontSize: 14,
  fontWeight: 'normal',
}
const thanksContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  borderRadius: 45,
  color: '#000',
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
    <Trans parent="div" style={thankYouTextStyle}>
      Merci pour <div style={thankYouNameStyle}>{{name}}</div>
    </Trans>
  </Modal>
}
const ThankYouPopUp = React.memo(ThankYouPopUpBase)


interface MessageSectionProps {
  isHighRisk: boolean
  person: bayes.casContact.Person
  onAlert?: () => void
  startDate?: string
}

const anonymousContainerStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  fontSize: 15,
  marginTop: 11,
}
const arrowStyle: React.CSSProperties = {
  height: 16,
}
const messageTextStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  border: `solid 1px ${colors.MEDIUM_GREY}`,
  borderRadius: 23,
  boxShadow: '0 12px 19px 0 rgba(60, 128, 209, 0.09)',
  color: '#000',
  fontFamily: 'inherit',
  fontSize: 14,
  marginBottom: 10,
  marginTop: 15,
  minHeight: 100,
  padding: '16px 15px',
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
  const {isHighRisk, onAlert, person: {personId}} = props
  const {alertMediums: alertedMediums = []} = useAlert(personId) || {}
  const {t, t: translate} = useTranslation()
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
    backgroundColor: newAlertMedium ? colors.MINTY_GREEN : colors.MEDIUM_GREY,
    color: newAlertMedium ? '#000' : '#fff',
    display: 'flex',
    justifyContent: 'center',
    margin: '24px 0 0',
  }
  const toggleContentShown = useCallback((): void => {
    setIsContentShown(contentShown => !contentShown)
    if (!isContentShown) {
      dispatch(showAnonymousMessageContentAction)
    }
  }, [dispatch, isContentShown])
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
    dispatch(alertPerson(translate, personId, newAlertMedium, isHighRisk ? 'high' : 'low'))
    setNewAlertMedium(undefined)
    onAlert?.()
  }, [newAlertMedium, dispatch, isHighRisk, onAlert, personId, translate])
  const buttonCallToAction = isNewAlertMediumShown ?
    newAlertMedium ? sendAlert : validateInput :
    showNewAlertMedium
  const handleSubmit = useCallback((event?: React.SyntheticEvent): void => {
    event?.preventDefault()
    buttonCallToAction()
  }, [buttonCallToAction])
  const referralUrl = useReferralUrl(personId)
  return <div style={anonymousContainerStyle}>
    <div style={showContentButtonStyle} onClick={toggleContentShown}>
      {/* TODO(cyrille): Update to 'Voir email envoyé' once alerted (and translate).*/}
      <span>Voir le message</span>
      {isContentShown ? <ArrowUpSLineIcon style={arrowStyle} /> :
        <ArrowDownSLineIcon style={arrowStyle} />}
    </div>
    {isContentShown ? <Trans style={messageTextStyle}>
      Bonjour,<br /><br />

      Nous vous écrivons de la part d'une personne porteuse du {{diseaseName: config.diseaseName}}
      {' '}qui a indiqué vous avoir croisé(e) récemment pendant sa période contagieuse.<br /><br />

      Le respect de la vie privée de nos utilisateurs est notre priorité, voilà pourquoi votre
      connaissance est anonyme elle aussi.<br /><br />

      Même si vous n'avez pas de symptômes aujourd'hui, il est possible que vous soyez porteur(se)
      du virus et que vous soyez déjà contagieux(se).<br /><br />

      Ne paniquez pas, nous sommes là pour vous aider. Afin de vous protéger ainsi que vos proches,
      il est indispensable que vous preniez toutes les précautions nécessaires
      dès aujourd'hui.<br /><br />

      Pour briser la chaîne de contamination, nous vous invitons à venir sur notre site où vous
      pourrez notamment vérifier vos symptômes et accéder à un suivi personnalisé.<br /><br />

      <a rel="noopener noreferrer" target="_blank" href={referralUrl}>
        Briser La Chaine
      </a><br /><br />

      {{productName: t('productName')}} est un site entièrement gratuit réalisé par
      Bayes Impact, une ONG citoyenne engagée dans la lutte contre la propagation du virus.
      <br /><br />

      Ensemble, brisons la chaîne de contamination.<br /><br />

      L'équipe de BriserLaChaîne.org,<br />
      Une initiative de l'ONG citoyenne Bayes Impact.
    </Trans> : null}
    <form onSubmit={handleSubmit}>
      {isNewAlertMediumShown ? <PhoneEmailInput
        value={newAlertMedium} onChange={setNewAlertMedium} style={phoneInputStyle}
        isValidated={isValidated} placeholder={t('Entrer email ou numéro de téléphone')} /> : null}
    </form>
    <div style={{flex: 1}} />
    <div onClick={buttonCallToAction} style={alertButtonStyle}>
      {isNewAlertMediumShown ? <React.Fragment>
        {t('Alerter anonymement')} <MailSendLineIcon style={{marginLeft: 8}} />
      </React.Fragment> : t('Ajouter un moyen de contact')}
    </div>
  </div>
}
const AnonymousMessageSection = React.memo(AnonymousMessageSectionBase)


const interactIconStyle: React.CSSProperties = {
  height: 20,
  margin: '0 5px',
  width: 20,
}
const basicButtonStyle: React.CSSProperties = {
  ...lightButtonStyle,
  alignItems: 'center',
  borderRadius: 40,
  display: 'flex',
  flex: 1,
  fontFamily: 'inherit',
  fontSize: 15,
  fontWeight: 'normal',
  justifyContent: 'center',
  margin: 0,
  maxWidth: 180,
  padding: 14,
}
const personalAlertContainer: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.BRIGHT_SKY_BLUE,
  borderRadius: '25px 25px 0 0',
  boxShadow: '0 0 15px 0 rgba(0, 0, 0, 0.15)',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 18,
  padding: '15px 30px',
}
const editInstructionsStyle: React.CSSProperties = {
  color: colors.WARM_GREY,
  cursor: 'pointer',
  fontSize: 11,
  textAlign: 'center',
}
const buttonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: 15,
}
const restartIconStyle: React.CSSProperties = {
  ...interactIconStyle,
  marginRight: 0,
}
const textCopiedCheckStyle: React.CSSProperties = {
  marginRight: 15,
  position: 'absolute',
  right: '100%',
  top: '50%',
  transform: 'translateY(-50%)',
}
const PersonalMessageSectionBase =
  ({onAlert, person, startDate}: MessageSectionProps): React.ReactElement => {
    const {t, t: translate} = useTranslation()
    const dispatch = useDispatch()
    const {name, displayName = name, personId} = person
    const referralUrl = useReferralUrl(personId)
    const isAlerted = useAlert(personId)
    const defaultText = useMemo((): string => t("Bonjour, j'ai découvert que j'étais " +
      "probablement atteint(e) du {{diseaseName}}. Je t'écris car nous nous sommes " +
      'croisé(e)s pendant ma période contagieuse qui a commencé le {{startDate}}, ' +
      "je t'ai donc peut-être contaminé(e). \n\n" +
      'Je tenais donc à te prévenir car il est très important que tu prennes les précautions ' +
      'nécessaires pour vous protéger toi et tes proches. Même sans symptôme, il est possible ' +
      'que tu sois déjà contagieux(se). \n\n' +
      "Pour briser la chaîne de contamination, je te conseille d'aller sur le site que " +
      "j'ai utilisé pour te prévenir, où tu pourras notamment vérifier tes symptômes et " +
      'accéder à un suivi personnalisé\u00A0: \n\n{{url}} \n' +
      "(c'est ce que j'ai utilisé pour te prévenir) \n\n" +
      "PS\u00A0: Le site a été créé par une ONG citoyenne, c'est entièrement gratuit et anonyme.",
    {diseaseName: config.diseaseName, startDate, url: referralUrl}), [startDate, referralUrl, t])
    const [isCustomText, setIsCustomText] = useState(false)
    const radioButtonStyle: React.CSSProperties = {
      backgroundColor: isAlerted ? 'currentColor' : 'initial',
      border: 'solid 2px',
      borderRadius: 4,
      flexShrink: 0,
      height: 22,
      marginRight: 22,
      width: 22,
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
    const handleAlert = useCallback((): void => {
      onAlert?.()
      dispatch(alertPerson(translate, person.personId))
    }, [dispatch, onAlert, person.personId, translate])

    const textAreaRef = useRef<Inputable>(null)
    const handleEditText = useCallback((): void => textAreaRef.current?.focus(), [])
    const backToDefaultText = useCallback((): void => {
      setText(defaultText)
      setIsCustomText(false)
    }, [defaultText])

    const [isTextCopied, setIsTextCopied] = useState(false)
    const handleCopy = useCallback((): void => {
      copyToClipboard(text)
      dispatch(copyPersonalMessage(text.includes(referralUrl), !isCustomText))
      setIsTextCopied(true)
    }, [dispatch, isCustomText, referralUrl, text])
    useEffect((): (() => void) => {
      if (!isTextCopied) {
        return (): void => void 0
      }
      const timeout = window.setTimeout((): void => setIsTextCopied(false), 2000)
      return (): void => clearTimeout(timeout)
    }, [isTextCopied])
    const refreshButtonStyle: React.CSSProperties = {
      ...basicButtonStyle,
      marginRight: 9,
      opacity: isCustomText ? 1 : .3,
    }
    const textCopiedStyle: React.CSSProperties = {
      alignItems: 'center',
      backgroundColor: '#000',
      borderRadius: 40,
      color: '#fff',
      display: 'flex',
      fontWeight: 600,
      justifyContent: 'center',
      left: 40,
      opacity: isTextCopied ? 1 : 0,
      padding: 15,
      pointerEvents: 'none',
      position: 'absolute',
      right: 40,
      top: '50%',
      transform: 'translateY(-50%)',
      transition: '450ms',
    }

    // TODO(sil): Add logging.
    return <React.Fragment>
      <span onClick={handleEditText} style={editInstructionsStyle}>
        {t('Cliquer pour modifier le message')}
      </span>
      <div style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
        <Textarea
          style={messageTextStyle} value={text} onChange={updateText} ref={textAreaRef} />
        <div style={textCopiedStyle}>
          <span style={{position: 'relative'}}>
            <CheckLineIcon style={textCopiedCheckStyle} />
            {t('Message copié')}
          </span>
        </div>
      </div>
      <div style={buttonsContainerStyle}>
        <div style={refreshButtonStyle} onClick={backToDefaultText}>
          {t('Réinitialiser')} <RestartLineIcon style={restartIconStyle} />
        </div>
        <div style={basicButtonStyle} onClick={handleCopy}>
          {t('Copier')} <FileCopyLineIcon style={{...interactIconStyle, marginRight: 0}} />
        </div>
      </div>
      <ShareButtons
        onMessengerClick={handleCopy}
        title={t('Envoyer le message via\u00A0:')} sharedText={text} />
      <BottomDiv style={personalAlertContainer} onClick={handleAlert}>
        <div style={radioButtonStyle} />
        <Trans>
          Je confirme avoir alerté <strong style={{fontWeight: 600}}>
            {{name: displayName}}
          </strong>
        </Trans>
      </BottomDiv>
    </React.Fragment>
  }
const PersonalMessageSection = React.memo(PersonalMessageSectionBase)


const navTitleStyle: React.CSSProperties = {
  fontSize: 12,
  height: '2.2em',
  overflow: 'hidden',
  textAlign: 'center',
  textOverflow: 'ellipsis',
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
    backgroundColor: '#fff',
    borderRadius: 23,
    color: colors.DARK_GREY_BLUE,
    cursor: 'pointer',
    flex: 'none',
    margin: '0 5px',
    padding: '14px 16px',
    width: 57,
    ...props.containerStyle,
  }
  const style: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: colors.LIGHT_BLUE_GREY,
    borderRadius: 40,
    display: 'flex',
    fontSize: 14,
    fontWeight: 600,
    height: 34,
    justifyContent: 'center',
    margin: '0 auto 10px',
    width: 34,
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
  backgroundColor: '#000',
  color: '#fff',
  fontWeight: 600,
}
const contactInListSelectedStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  color: colors.DARK_GREY_BLUE,
}
const contactInListWasAlertedStyle: React.CSSProperties = {
  backgroundColor: colors.MINTY_GREEN,
  color: '#fff',
}
const contactInListWasAlertedSelectedStyle: React.CSSProperties = {
  backgroundColor: colors.MINTY_GREEN,
  color: '#fff',
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
  const style = wasAlerted ?
    isSelected ? contactInListWasAlertedSelectedStyle : contactInListWasAlertedStyle :
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


const contactsListHeaderStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 20,
  fontWeight: 800,
  padding: '25px 30px 0',
}
const contactsListContainerStyle: React.CSSProperties = {
  display: 'flex',
  overflow: 'scroll',
  padding: '15px 0 23px',
}
const addContactNavContainerItemStyle: React.CSSProperties = {
  backgroundColor: colors.LIGHT_BLUE_GREY,
  color: colors.DARK_GREY_BLUE,
  width: 42,
}
const addContactNavItemStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 10,
  color: colors.DARK_GREY_BLUE,
}


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
  const numAlertedPeople = people.filter(({personId}): boolean => !!alerts[personId]).length
  return <div>
    {people.length ?
      <Trans parent="header" style={contactsListHeaderStyle} count={numAlertedPeople}>
        {{numAlertedPeople}}/{{numTotalPeople: people.length}} personne alertée
      </Trans> : null}
    <BurgerMenu />
    <div style={contactsListContainerStyle} ref={scrollableListRef} className="no-scrollbars">
      <div style={{flex: 'none', width: 25}} />
      <NavItem
        title={t('Ajouter')} onClick={handleAddContact} style={addContactNavItemStyle}
        containerStyle={addContactNavContainerItemStyle}>
        <AddLineIcon />
      </NavItem>
      {people.map((person) => <ContactInList
        key={person.personId} person={person} onSelect={handleSelectPerson}
        isSelected={selectedPerson?.personId === person.personId}
        wasAlerted={!!alerts[person.personId]} />)}
      <div style={{flex: 'none', width: 25}} />
    </div>
  </div>
}
const ContactsList = React.memo(ContactsListBase)


interface ContactPersonFormProps {
  person: bayes.casContact.Person
  onDone: () => void
}

const contactPersonFormStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '40px 40px 0 0',
  boxShadow: '0 8px 15px 0 rgba(60, 128, 209, 0.2)',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  margin: '0 10px',
  padding: '25px 20px',
}
const alertAgainButtonStyle: React.CSSProperties = {
  ...basicButtonStyle,
  ...mobileOnDesktopStyle,
  margin: '16px auto',
}
const tabsStyle: React.CSSProperties = {
  marginBottom: 16,
}
const alertedStyle: React.CSSProperties = {
  alignItems: 'center',
  borderTop: `1px solid ${colors.MEDIUM_GREY}`,
  display: 'flex',
  fontSize: 16,
  marginTop: 20,
  paddingTop: 15,
}
const alertedIconStyle: React.CSSProperties = {
  color: colors.MINTY_GREEN,
  marginRight: 8,
}

const ContactPersonFormBase = (props: ContactPersonFormProps): React.ReactElement => {
  const {onDone, person} = props
  const {t, t: translate} = useTranslation()
  const dateOption = useDateOption()
  const dispatch = useDispatch()
  const contagiousPeriodStart =
    useSelector(({user: {contagiousPeriodStart}}): Date|undefined => contagiousPeriodStart) ||
    subDays(new Date(), 1)
  const contagiousStartDate = useMemo(() =>
    dateFormat(contagiousPeriodStart, 'd MMMM', dateOption), [contagiousPeriodStart, dateOption])
  const alerted = useAlert(person.personId)
  const [isSenderAnonymous, setIsSenderAnonymous] = useState(!!alerted?.isAlertedAnonymously)
  useLayoutEffect((): void => {
    setIsSenderAnonymous(!!alerted?.isAlertedAnonymously)
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
  const contactDays = usePersonContactDays(person, t, dateOption)
  const isHighRisk = useIsHighRisk(person.personId)
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
    dispatch(alertPerson(translate, person.personId))
  }, [dispatch, isThanksShown, openThanks, person.personId, translate])
  const tabs = useMemo((): readonly string[] => [
    t('Alerter moi-même'),
    t('Alerter anonymement'),
  ], [t])
  const {alertMediums: alertedMediums = []} = useAlert(person.personId) || {}
  return <div style={contactPersonFormStyle}>
    <ThankYouPopUp isShown={isThanksShown} name={displayName} onHidden={onDone} />
    <div style={{alignItems: 'center', display: 'flex'}}>
      <span style={{flex: 1, fontSize: 20, fontWeight: 600}}>
        {displayName}
      </span>
      <span style={{color: colors.BARBIE_PINK, fontSize: 12, marginRight: 5}}>
        {isHighRisk ? t('Risques importants') : t('Risques modérés')}
      </span>
      <InformationLineIcon size={15} color={colors.BARBIE_PINK} />
    </div>
    {alerted ? <div style={alertedStyle}>
      <CheckboxCircleFillIcon style={alertedIconStyle} size={24} />
      {alerted.isAlertedAnonymously ?
        alerted.alertMediums?.every(({medium}) => medium === 'SMS') ?
          t('Contacté(e) anonymement par SMS') :
          alerted.alertMediums?.every(({medium}) => medium === 'email') ?
            t('Contacté(e) anonymement par email') :
            t('Contacté(e) anonymement') :
        t('Contacté(e) par vos soins')
      }
    </div> : <Trans style={{color: colors.WARM_GREY, fontSize: 12, marginTop: 4}}>
      Croisé(e) {{contactDays}}
    </Trans>}
    {alertedMediums.map((alertMedium) => <PhoneEmailInput
      key={alertMedium.value} isDone={true} value={alertMedium}
      onChange={noOp} style={phoneInputStyle} />)}
    {alerted && !canBeAlertedAgain ? <BottomDiv
      style={alertAgainButtonStyle} onClick={handleAlertAgain}>
      {t('Contacter à nouveau')}
    </BottomDiv> : <div
      style={{display: 'flex', flex: 1, flexDirection: 'column', margin: '30px 0 0'}}>
      <Tabs
        style={tabsStyle} onChangeTab={handleChangeTab} tabSelected={isSenderAnonymous ? 1 : 0}
        tabs={tabs} />
      {isSenderAnonymous ? <AnonymousMessageSection
        person={person} onAlert={openThanks} isHighRisk={isHighRisk} /> :
        <PersonalMessageSection
          onAlert={openThanks} startDate={contagiousStartDate}
          person={person} isHighRisk={isHighRisk} />}
    </div>}
  </div>
}
const ContactPersonForm = React.memo(ContactPersonFormBase)


const fadeoutMillisec = 1500


const contentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: window.innerHeight,
}


const ContactsListPage = (): React.ReactElement => {
  const history = useHistory()
  const people = usePeopleToAlert()
  const alerts = useSelector(({alerts}): AlertsState => alerts)
  const findNextNotAlerted = useCallback(
    () => people.find(({personId}) => !alerts[personId]), [alerts, people])
  const [selectedPersonId, selectPerson] = useState(
    (): string => findNextNotAlerted()?.personId || people[0]?.personId || '',
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
  useBackgroundColor(colors.PALE_GREY)
  return <DrawerContainer
    isOpen={isAddingContact}
    drawer={<ContactsSearch onClose={toggleAddingContact} date={noDate} />}
    onClose={toggleAddingContact} style={leavingStyle} mainStyle={contentStyle}>
    <ContactsList
      selectedPerson={selectedPerson} people={people}
      onSelectPerson={selectPerson} onAddContact={toggleAddingContact} />
    {selectedPerson ? <ContactPersonForm
      person={selectedPerson} onDone={selectNextNotAlerted} /> : null}
  </DrawerContainer>
}
const MemoPage = React.memo(ContactsListPage)

export default MemoPage
