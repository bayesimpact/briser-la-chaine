import copyToClipboard from 'copy-to-clipboard'
import {format as dateFormat, subDays} from 'date-fns'
import ArrowLeftLineIcon from 'remixicon-react/ArrowLeftLineIcon'
import CheckDoubleLineIcon from 'remixicon-react/CheckDoubleLineIcon'
import CheckFillcon from 'remixicon-react/CheckFillIcon'
import CheckLineIcon from 'remixicon-react/CheckLineIcon'
import ErrorWarningFillIcon from 'remixicon-react/ErrorWarningFillIcon'
import ErrorWarningLineIcon from 'remixicon-react/ErrorWarningLineIcon'
import ArrowUpSLineIcon from 'remixicon-react/ArrowUpSLineIcon'
import ArrowDownSLineIcon from 'remixicon-react/ArrowDownSLineIcon'
import FileCopyLineIcon from 'remixicon-react/FileCopyLineIcon'
import Markdown from 'react-markdown'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'

import {alertPerson, productSendingSectionAction, physicianSectionShownAction, saveUserName,
  shareAlert, showMessageAction, showMoreWaysAction, toggleAnonymousAction,
  useDispatch} from 'store/actions'
import {useDateOption} from 'store/i18n'
import {useAlert, useReferralUrl, useSelector} from 'store/selections'
import {normalizeEmail, normalizePhone, validateEmail, validatePhone} from 'store/validation'

import {darkButtonStyle, lightButtonStyle, longShareButtonStyle} from 'components/buttons'
import Input, {InputProps, Inputable} from 'components/input'
import {SmoothTransitions} from 'components/modal'
import WithThankYouPopUp from 'components/thank_you'
import ShareButtons from 'components/share_buttons'


const isMobileVersion = window.outerWidth < 800


type InputMode = InputProps['inputMode']

interface PhoneEmailInputProps extends
  Omit<InputProps, 'onChangeDelayMillisecs' | 'inputmode' | 'onChange' | 'value' | 'disabled'> {
  isDone?: true
  isPhoneAvailable?: boolean
  isValidated?: boolean
  onChange: (medium?: bayes.casContact.AlertMedium) => void
  value?: bayes.casContact.AlertMedium
}

const isNumber = (value: string): boolean => /^[\d+]/.test(value)

const PhoneEmailInputBase = (props: PhoneEmailInputProps): React.ReactElement => {
  const {isDone, isValidated, onChange, style, value: {value: propValue = ''} = {},
    isPhoneAvailable = true, ...inputProps} = props

  const [value, setValue] = useState(propValue)
  useEffect((): void => {
    if (propValue && !isNumber(propValue)) {
      setValue(propValue)
    }
  }, [propValue])

  const isNumberInput = isPhoneAvailable && isNumber(value)
  const hasValue = !!value
  const [inputMode, setInputMode] = useState<InputMode>(isNumberInput ? 'tel' : 'email')
  const resetInputMode = useCallback((): void =>
    setInputMode(isNumberInput ? 'tel' : 'email'), [isNumberInput])
  useEffect((): void => {
    if (hasValue) {
      resetInputMode()
    }
  }, [hasValue, resetInputMode])

  const isValid = !!propValue

  const isInvalid = isValidated && !isValid

  const inputRef = useRef<Inputable>(null)
  const focus = useCallback((): void => inputRef.current?.focus(), [])

  const onValueChange = useCallback((newValue) => {
    setValue(newValue)
    if (newValue === propValue) {
      return
    }
    if (isPhoneAvailable && isNumber(newValue) && validatePhone(newValue)) {
      onChange?.({medium: 'SMS', value: normalizePhone(newValue)})
      inputRef.current?.blur()
      return
    }
    if (validateEmail(newValue)) {
      onChange?.({medium: 'email', value: normalizeEmail(newValue)})
      return
    }
    onChange()
  }, [isPhoneAvailable, onChange, propValue])
  const RightIcon = isDone ? CheckDoubleLineIcon :
    isInvalid ? ErrorWarningLineIcon :
      isValid ? CheckLineIcon :
        null
  const iconSize = 34
  const iconMarginLeft = 10
  const iconMarginRight = 10
  const rightIconStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: isValid && !isDone ? colors.MINTY_GREEN : 'transparent',
    borderRadius: iconSize,
    color: isInvalid ? colors.BARBIE_PINK :
      isDone ? colors.MINTY_GREEN : isValid ? '#fff' : 'inherit',
    cursor: 'text',
    display: 'flex',
    fontSize: 20,
    height: iconSize,
    justifyContent: 'center',
    marginLeft: iconMarginLeft,
    marginRight: iconMarginRight,
    position: 'absolute',
    right: 1,
    top: '50%',
    transform: 'translateY(-50%)',
    width: iconSize,
  }
  const paddedInputStyle = useMemo((): React.CSSProperties => ({
    ...isInvalid ? {borderColor: colors.BARBIE_PINK} : {},
    borderRadius: 23,
    boxShadow: '0 12px 19px 0 rgba(60, 128, 209, 0.09)',
    flex: 1,
    fontStyle: isValidated ? 'normal' : 'italic',
    fontWeight: isValidated ? 600 : 'normal',
    height: 58,
    paddingLeft: 25,
    paddingRight: RightIcon ? iconSize + 10 : 0,
  }), [RightIcon, isInvalid, isValidated])
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
      {RightIcon ? <div style={rightIconStyle}>
        <RightIcon size={iconSize * .7} />
      </div> : null}
      <Input
        // TODO(cyrille): Show "Numéro de téléphone" or "Adresse e-mail" above
        // if done and not focused.
        {...inputProps} value={value}
        onChange={onValueChange} inputMode={inputMode} ref={inputRef}
        onBlur={resetInputMode} onChangeDelayMillisecs={500} style={paddedInputStyle}
        disabled={isDone} />
    </div>
    {isInvalid ? <div style={errorStyle}>
      {isNumberInput ? t('Numéro de téléphone portable non reconnu') : t('Email non reconnu')}
    </div> : null}
  </div>
}
const PhoneEmailInput = React.memo(PhoneEmailInputBase)


interface MessageSectionProps {
  toggleCloseButton?: (status: boolean) => void
  person: bayes.casContact.Person
  onBack?: () => void
  onDone?: () => void
  startDate?: string
}

const anonymousContainerStyle: React.CSSProperties = {
  fontSize: 15,
}
const messageTextStyle: React.CSSProperties = {
  backgroundColor: colors.PALE_GREY,
  borderRadius: 15,
  color: colors.ALMOST_BLACK,
  fontSize: 13,
  height: 250,
  marginBottom: 10,
  overflow: 'scroll',
  padding: '0 14px',
}
const inputSpacingStyle: React.CSSProperties = {
  marginTop: 11,
}
const inputLabelStyle: React.CSSProperties = {
  color: colors.ALMOST_BLACK,
  fontSize: 15,
  marginBottom: 11,
  marginTop: 25,
}
const nameInputStyle: React.CSSProperties = {
  border: `solid .5px ${colors.LIGHT_BLUE_GREY}`,
  borderRadius: 23,
  boxShadow: '0 12px 19px 0 rgba(60, 128, 209, 0.09)',
  fontWeight: 600,
  height: 58,
  padding: '0 25px',
}
const emptyNameInputStyle: React.CSSProperties = {
  ...nameInputStyle,
  fontStyle: 'italic',
  fontWeight: 'normal',
}
// TODO(pascal): Simplify message components.
// TODO(sil): Use username and contact name in the email.
const AnonymousMessageSectionBase = (props: MessageSectionProps): React.ReactElement => {
  const {person: {displayName, personId, name}, onBack, onDone} = props
  const personDisplayName = displayName || name
  const {t, t: translate} = useTranslation()
  const dateOption = useDateOption()
  const dispatch = useDispatch()
  const storedUserName = useSelector(({user: {userName}}): string => userName || '')
  const [isThanksShown, setIsThanksShown] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)

  const openThanks = useCallback((): void => setIsThanksShown(true), [])
  const closeThanks = useCallback((): void => setIsThanksShown(false), [])
  const [isValidated, setValidated] = useState(false)
  const toggleAnonymous = useCallback((): void => {
    setIsAnonymous(wasAnonymous => !wasAnonymous)
    dispatch(toggleAnonymousAction)
  }, [dispatch])
  const [alertMedium, setAlertMedium] = useState<bayes.casContact.AlertMedium|undefined>()
  const [contactName, setContactName] = useState(personDisplayName)
  const [userName, setUserName] = useState(storedUserName)
  const isValid = alertMedium && contactName && (userName || isAnonymous)
  const alertButtonStyle: React.CSSProperties = {
    ...darkButtonStyle,
    alignItems: 'center',
    backgroundColor: isValid ? colors.MINTY_GREEN : colors.MEDIUM_GREY,
    color: isValid ? colors.ALMOST_BLACK : '#fff',
    display: 'flex',
    justifyContent: 'center',
    margin: '24px 0 0',
  }
  const radioButtonStyle = {
    alignItems: 'center',
    backgroundColor: isAnonymous ? colors.ALMOST_BLACK : '#fff',
    border: `1px solid ${isAnonymous ? colors.ALMOST_BLACK : colors.LIGHT_BLUE_GREY}`,
    borderRadius: 4,
    display: 'flex',
    height: 25,
    justifyContent: 'center',
    margin: '30px 10px 29px',
    width: 25,
  }
  const emptyInputStyle: React.CSSProperties = {
    ...emptyNameInputStyle,
    ...isValidated ? {borderColor: colors.BARBIE_PINK} : {},
  }
  useEffect((): void => {
    if (isValid) {
      setValidated(false)
    }
  }, [isValid])
  const sendAlert = useCallback((): void => {
    if (!alertMedium || !(isAnonymous || userName)) {
      return
    }
    if (userName && userName !== storedUserName) {
      dispatch(saveUserName(userName))
    }
    dispatch(alertPerson(
      personId, 'product', alertMedium, isAnonymous ? undefined : userName, translate, dateOption))
    setAlertMedium(undefined)
    openThanks()
  }, [alertMedium, dateOption, dispatch, isAnonymous, openThanks, personId,
    storedUserName, translate, userName])

  const validateInput = useCallback((): void => setValidated(true), [])
  const buttonCallToAction = isValid ? sendAlert : validateInput
  const noticeText = <Trans>
    N'utilisez cette option que si nécessaire.
    Recevoir un message anonyme n'est jamais très agréable.
  </Trans>
  const isPhoneAvailable = config.isSendingSmsAvailable
  const header = t('Contacter via {{productName}}', {productName: t('productName')})
  return <WithThankYouPopUp
    isThanksShown={isThanksShown} displayName={personDisplayName} onClose={closeThanks}
    onHidden={onDone}>
    <MessageSection
      header={header} backgroundColor={colors.PALE_GREY} style={anonymousContainerStyle}
      onBack={onBack}>
      <div style={inputLabelStyle}>{t('Nom et prénom de votre contact')}*</div>
      <Input
        value={contactName} onChange={setContactName}
        style={contactName && isValidated ? nameInputStyle : emptyInputStyle} />
      <div style={{...inputLabelStyle, marginBottom: 0}}>
        {isPhoneAvailable ? t('Téléphone ou email de votre contact') : t('Email de votre contact')}*
      </div>
      <PhoneEmailInput
        value={alertMedium} onChange={setAlertMedium} style={inputSpacingStyle}
        isValidated={isValidated} isPhoneAvailable={isPhoneAvailable}
        placeholder={
          isPhoneAvailable ? t('Entrez son email ou téléphone') : t('Entrez son email')
        } />
      {isAnonymous ? null : <React.Fragment>
        <div style={inputLabelStyle}>{t('Votre nom')}*</div>
        <Input
          value={userName} onChange={setUserName}
          style={userName && isValidated ? nameInputStyle : emptyInputStyle}
          placeholder={t('Entrez votre nom et prénom')} /></React.Fragment>}
      <div
        style={{alignItems: 'center', cursor: 'pointer', display: 'flex'}}
        onClick={toggleAnonymous}>
        <div style={radioButtonStyle}>
          <CheckFillcon size={20} color="#fff" />
        </div>
        {t('Je souhaite rester anonyme')}
      </div>
      {isAnonymous ? <Notice text={noticeText} /> : null}
      <div style={{flex: 1}} />
      <div onClick={buttonCallToAction} style={alertButtonStyle}>
        {t('Alerter à ma place')}
      </div>
    </MessageSection>
  </WithThankYouPopUp>
}
const AnonymousMessageSection = React.memo(AnonymousMessageSectionBase)


interface ContactForPhysicianProps extends MessageSectionProps {
  onBack: () => void
}


const contactForPhysicianStyle: React.CSSProperties = {
  fontSize: 15,
}
const inputLegendStyle: React.CSSProperties = {
  marginBottom: 10,
  marginTop: 25,
}

const ContactForPhysicianSectionBase = (props: ContactForPhysicianProps): React.ReactElement => {
  const {onBack, onDone, person: {displayName, name: propsName, personId}} = props
  const {t} = useTranslation()
  const dispatch = useDispatch()
  const {alertMediums: alertedMediums = []} = useAlert(personId) || {}
  const [name, setName] = useState(displayName || propsName)
  const [isValidated, setValidated] = useState(false)
  const [alertMedium, setAlertMedium] =
    useState<bayes.casContact.AlertMedium|undefined>(alertedMediums[0])
  const isValid = alertMedium && name
  const validateInput = useCallback((): void => setValidated(true), [])
  useEffect((): void => {
    if (isValid) {
      setValidated(false)
    }
  }, [isValid])
  const sendAlert = useCallback((): void => {
    if (!alertMedium) {
      return
    }
    dispatch(alertPerson(personId, 'physician', alertMedium))
    onDone?.()
  }, [alertMedium, dispatch, onDone, personId])
  const buttonCallToAction = isValid ? sendAlert : validateInput
  const handleSubmit = useCallback((event?: React.SyntheticEvent): void => {
    event?.preventDefault()
    buttonCallToAction()
  }, [buttonCallToAction])
  const buttonStyle: React.CSSProperties = {
    ...darkButtonStyle,
    backgroundColor: isValid ? darkButtonStyle.backgroundColor : colors.LIGHT_BLUE_GREY,
    color: isValid ? darkButtonStyle.color : '#fff',
    margin: 'auto',
    maxWidth: 420,
  }
  const emptyInputStyle: React.CSSProperties = {
    ...emptyNameInputStyle,
    ...isValidated ? {borderColor: colors.BARBIE_PINK} : {},
  }
  const header = t('Mon médecin le(la) contactera')
  return <MessageSection
    header={header} backgroundColor={colors.PALE_GREY} style={contactForPhysicianStyle}
    onBack={onBack}>
    <div style={inputLegendStyle}>
      {t('Nom et prénom de votre contact')}*
    </div>
    <Input
      type="text" value={name} onChange={setName}
      style={name ? nameInputStyle : emptyInputStyle}
      placeholder={t('Entrez son nom et son prénom')} />
    <div style={inputLegendStyle}>
      {t('Téléphone ou email de votre contact')}*
    </div>
    <PhoneEmailInput value={alertMedium} onChange={setAlertMedium} isValidated={isValidated} />
    <div style={{flex: 1}} />
    <div style={{margin: 20}}>
      <div onClick={handleSubmit} style={buttonStyle}>
        {t('Valider')}
      </div>
    </div>
  </MessageSection>
}
const ContactForPhysicianSection = React.memo(ContactForPhysicianSectionBase)


const messagingOptionTitleStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 16,
  fontWeight: 800,
  marginBottom: 3,
  marginTop: 30,
}
const messagingOptionSubtitleStyle: React.CSSProperties = {
  color: colors.DARK_GREY_BLUE,
}
const contactOnBehalfButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: colors.BRIGHT_SKY_BLUE,
  flex: 1,
  margin: 15,
  maxWidth: 420,
}
const cancelContactStyle: React.CSSProperties = {
  ...contactOnBehalfButtonStyle,
  ...lightButtonStyle,
}
const messagingOptionStyle: React.CSSProperties = {
  fontSize: 13,
}
const moreOptionsNoticeStyle: React.CSSProperties = {
  marginTop: 10,
}

const MoreMessagingOptionsBase = (props: MessageSectionProps): React.ReactElement => {
  const {person: {displayName: contactName, name, personId}, onBack, onDone,
    toggleCloseButton} = props
  const displayName = contactName || name
  const {t} = useTranslation()
  const dispatch = useDispatch()
  const [isAnonymousShown, setIsAnonymousShown] = useState(false)
  const showAnonymous = useCallback((): void => {
    setIsAnonymousShown(true)
    dispatch(productSendingSectionAction)
  }, [dispatch])
  const [isViaPhysicianShown, setIsViaPhysicianShown] = useState(false)
  const showViaPhysician = useCallback((): void => {
    setIsViaPhysicianShown(true)
    dispatch(physicianSectionShownAction)
  }, [dispatch])
  useEffect((): (() => void) => {
    toggleCloseButton?.(false)
    return (): void => toggleCloseButton?.(true)
  }, [toggleCloseButton])
  const onCancel = useCallback((): void => {
    dispatch(alertPerson(personId, 'none'))
    onDone?.()
  }, [dispatch, onDone, personId])
  const goBackToMenu = useCallback((): void => {
    setIsViaPhysicianShown(false)
    setIsAnonymousShown(false)
  }, [])
  const noticeText = t("Ces options d'envoi sont moins efficaces que si vous contactiez " +
    'la personne vous-même.')
  const header = t("Options d'envoi pour {{displayName}}", {displayName: displayName})
  return <React.Fragment>
    {isAnonymousShown ? <AnonymousMessageSection {...props} onBack={goBackToMenu} /> :
      isViaPhysicianShown ? <ContactForPhysicianSection {...props} onBack={goBackToMenu} /> :
        <MessageSection header={header} onBack={onBack} style={messagingOptionStyle}>
          <Notice text={noticeText} style={moreOptionsNoticeStyle} />
          <section>
            <div style={messagingOptionTitleStyle}>
              {t('{{productName}} le fait pour vous', {productName: t('productName')})}
            </div>
            <div style={messagingOptionSubtitleStyle}>
              {config.isSendingSmsAvailable ?
                t('Il vous suffit de renseigner son e-mail ou numéro de téléphone.') :
                t('Il vous suffit de renseigner son e-mail.')}
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <div onClick={showAnonymous} style={contactOnBehalfButtonStyle}>
                {t('Contacter à ma place')}
              </div>
            </div>
          </section>
          <section style={{marginTop: 10}}>
            <div style={messagingOptionTitleStyle}>
              {t('Votre médecin le fait pour vous')}
            </div>
            <div style={messagingOptionSubtitleStyle}>
              {t('Il vous suffit de renseigner son e-mail ou numéro de téléphone.')}
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <div onClick={showViaPhysician} style={contactOnBehalfButtonStyle}>
                {t('Mon médecin le(la) contactera')}
              </div>
            </div>
          </section>
          <section style={{marginTop: 10}}>
            <div style={messagingOptionTitleStyle}>
              {t("Vous n'avez pas son contact\u00A0?")}
            </div>
            <div style={messagingOptionSubtitleStyle}>
              {t('Tentez de passer par une connaissance en commun.')}
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <div onClick={onCancel} style={cancelContactStyle}>
                {t("Je n'ai pas pu le(la) contacter")}
              </div>
            </div>
          </section>
        </MessageSection>}
  </React.Fragment>
}
const MoreMessagingOptions = React.memo(MoreMessagingOptionsBase)


const MarkdownRoot = (props: React.HTMLAttributes<HTMLDivElement>): React.ReactElement =>
  <div {...props} className="no-scrollbars" style={messageTextStyle} />
const textRenderers = {
  root: React.memo(MarkdownRoot),
}
const textCopiedCheckStyle: React.CSSProperties = {
  marginRight: 15,
}
const copyButtonStyle: React.CSSProperties = {
  ...longShareButtonStyle,
  backgroundColor: colors.BRIGHT_SKY_BLUE,
  margin: '15px 0',
}
const PersonalMessageSectionBase =
  ({person, startDate}: MessageSectionProps): React.ReactElement => {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const {personId} = person
    const displayName = person.displayName || person.name
    const referralUrl = useReferralUrl(personId)
    const text = useMemo((): string => t("Bonjour, j'ai découvert que j'étais " +
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

    const [isTextCopied, setIsTextCopied] = useState(false)
    const handleCopy = useCallback((): void => {
      copyToClipboard(text)
      setIsTextCopied(true)
    }, [text])
    const copyClick = useCallback((): void => {
      handleCopy()
      dispatch(shareAlert('copy'))
    }, [dispatch, handleCopy])
    useEffect((): (() => void) => {
      if (!isTextCopied) {
        return (): void => void 0
      }
      const timeout = window.setTimeout((): void => setIsTextCopied(false), 2000)
      return (): void => clearTimeout(timeout)
    }, [isTextCopied])

    const [isMessageShown, setMessageShown] = useState(!isMobileVersion)
    const toggleMessageShown = useCallback((): void => {
      if (!isMessageShown) {
        dispatch(showMessageAction)
      }
      setMessageShown(!isMessageShown)
    }, [dispatch, isMessageShown])
    const messageSectionHeaderStyle: React.CSSProperties = {
      alignItems: 'center',
      color: colors.BRIGHT_SKY_BLUE,
      cursor: 'pointer',
      display: 'flex',
      fontWeight: 'bold',
      lineHeight: 1,
      marginBottom: 25,
    }
    const messageSectionStyle: React.CSSProperties = {
      maxHeight: isMessageShown ? 400 : 0,
      overflow: 'hidden',
      ...SmoothTransitions,
    }
    const MessageIcon = isMessageShown ? ArrowUpSLineIcon : ArrowDownSLineIcon

    const textCopiedStyle: React.CSSProperties = {
      alignItems: 'center',
      backgroundColor: colors.ALMOST_BLACK,
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

    const header = t('Alerter {{displayName}}', {displayName: displayName})

    return <MessageSection header={header} style={{flex: 'none'}}>
      <div style={messageSectionHeaderStyle} onClick={toggleMessageShown}>
        {t('Message')}
        <MessageIcon style={{marginLeft: 10}} />
      </div>
      <div style={messageSectionStyle}>
        <Markdown source={text} renderers={textRenderers} />
        <div style={textCopiedStyle}>
          <CheckLineIcon style={textCopiedCheckStyle} />
          {t('Message copié')}
        </div>
        <div style={copyButtonStyle} onClick={copyClick}>
          <FileCopyLineIcon size={18} style={{marginRight: 15}} />
          {t('Copier et envoyer moi-même')}
        </div>
      </div>
      <ShareButtons
        onMessengerClick={handleCopy} isLongForm={true} sharedText={text} isConotification={true} />
    </MessageSection>
  }
const PersonalMessageSection = React.memo(PersonalMessageSectionBase)


interface MessageLayoutSectionProps {
  backgroundColor?: string
  header: string|React.ReactElement
  children: React.ReactNode
  onBack?: () => void
  style?: React.CSSProperties
}

const messageHeaderStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  fontFamily: 'Poppins',
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 16,
}
const backArrowStyle: React.CSSProperties = {
  cursor: 'pointer',
  display: 'flex',
  flex: 1,
  paddingLeft: 20,
}
const MessageSectionBase = (props: MessageLayoutSectionProps): React.ReactElement => {
  const {backgroundColor, header, children, onBack, style} = props
  const contentContainerStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || '#fff',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: '0 20px 20px',
  }
  const messageContainerStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    ...style,
  }
  return <div style={messageContainerStyle}>
    <div style={messageHeaderStyle}>
      {onBack ? <div style={backArrowStyle} onClick={onBack}><ArrowLeftLineIcon /></div> :
        <div style={{marginRight: 20}} />}
      <div style={{maxWidth: 190, textAlign: 'center'}}>{header}</div>
      <div style={{flex: 1}} />
    </div>
    <div
      style={contentContainerStyle}>
      {children}
    </div>
  </div>
}
const MessageSection = React.memo(MessageSectionBase)


interface ContactPersonFormProps {
  toggleCloseButton?: (status: boolean) => void
  onDone?: () => void
  person?: bayes.casContact.Person
}

const contactPersonFormStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '40px 40px 0 0',
  boxShadow: '0 8px 15px 0 rgba(60, 128, 209, 0.2)',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  paddingTop: 25,
}
const moreWaysStyle: React.CSSProperties = {
  ...lightButtonStyle,
  flex: 1,
  fontSize: 13,
  maxWidth: 420,
}
const moreWaysTextStyle: React.CSSProperties = {
  color: colors.DARK_GREY_BLUE,
  fontSize: 12,
  marginBottom: 12,
}
const ContactPersonForm = (props: ContactPersonFormProps): React.ReactElement|null => {
  const {toggleCloseButton, person, onDone} = props
  const dispatch = useDispatch()
  const dateOption = useDateOption()
  const {t} = useTranslation()
  const [isMoreWayShown, setIsMoreWayShown] = useState(false)
  const handleMoreClick = useCallback(() => {
    setIsMoreWayShown(true)
    dispatch(showMoreWaysAction)
  }, [dispatch])
  const closeMoreOptions = useCallback(() => setIsMoreWayShown(false), [])
  const contagiousPeriodStart =
    useSelector(({user: {contagiousPeriodStart}}): Date|undefined => contagiousPeriodStart) ||
    subDays(new Date(), 1)
  const contagiousStartDate = useMemo(() =>
    dateFormat(contagiousPeriodStart, 'd MMMM', dateOption), [contagiousPeriodStart, dateOption])
  if (!person) {
    return null
  }
  return <div style={contactPersonFormStyle}>
    {isMoreWayShown ? <MoreMessagingOptions
      person={person} toggleCloseButton={toggleCloseButton}
      onBack={closeMoreOptions} onDone={onDone} /> : <React.Fragment>
      <PersonalMessageSection
        startDate={contagiousStartDate} onDone={onDone} person={person} />
      <div style={{padding: 20}}>
        <div style={moreWaysTextStyle}>
          {t('Vous ne souhaitez pas envoyer le message vous-même\u00A0?')}
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div onClick={handleMoreClick} style={moreWaysStyle}>
            {t("Voir les autres options d'envoi")}
          </div>
        </div>
      </div>
    </React.Fragment>}
  </div>
}
export default React.memo(ContactPersonForm)


interface NoticeProps {
  text: React.ReactElement|string
  style?: React.CSSProperties
}

const errorIconStyle: React.CSSProperties = {
  flex: 'none',
  marginRight: 17,
}
const NoticeBase = ({text, style}: NoticeProps): React.ReactElement => {
  const containerStyle: React.CSSProperties = {
    alignItems: 'center',
    color: colors.BARBIE_PINK,
    display: 'flex',
    fontSize: 13,
    ...style,
  }
  return <div style={containerStyle}>
    <ErrorWarningFillIcon size={20} style={errorIconStyle} />
    {text}
  </div>
}
const Notice = React.memo(NoticeBase)

