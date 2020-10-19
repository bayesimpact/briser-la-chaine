import {stringify} from 'query-string'
import Chat3FillIcon from 'remixicon-react/Chat3FillIcon'
import MailLineIcon from 'remixicon-react/MailLineIcon'
import MessengerFillIcon from 'remixicon-react/MessengerFillIcon'
import ShareBoxFillIcon from 'remixicon-react/ShareBoxFillIcon'
import WhatsappLineIcon from 'remixicon-react/WhatsappLineIcon'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {ShareMedium, shareAlert, shareApp, shareMediums, useDispatch} from 'store/actions'
import {useReferralUrl} from 'store/selections'

import {longShareButtonStyle} from 'components/buttons'


type LinkProps = React.HTMLProps<HTMLAnchorElement>

const ExternalLinkBase: React.FC<LinkProps> = (props: LinkProps): React.ReactElement =>
  <a rel="noopener noreferrer" target="_blank" {...props} />
export const ExternalLink = React.memo(ExternalLinkBase)


const isMobileVersion = window.outerWidth < 800
const hasNavigatorShare = !!navigator.share


interface ShareButtonsBaseProps {
  buttonStyle?: React.CSSProperties
  isLongForm?: boolean
  onMessengerClick?: () => void
  sharedText: string
  title?: string
}
type ShareButtonsProps = ShareButtonsBaseProps & (
  | {isConotification: true; visualElement?: never}
  | {isConotification?: false; visualElement: string}
)

const shortShareButtonStyle: React.CSSProperties = {
  alignItems: 'center',
  borderRadius: 30,
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  height: 59,
  justifyContent: 'center',
  marginRight: 10,
  textDecoration: 'none',
  width: 59,
}
const longFormShareIconStyle = {
  marginRight: 15,
}
const shareButtonsContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: 20,
}
const longFormContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}
const shareTextStyle: React.CSSProperties = {
  alignSelf: 'center',
  fontSize: 15,
  fontWeight: 600,
  margin: '25px 0px 15px',
}
const messageButtonGradient = `linear-gradient(${colors.LIGHT_GREEN}, ${colors.MEDIUM_GREEN})`

const ShareButtons = (props: ShareButtonsProps): React.ReactElement => {
  const {buttonStyle, isLongForm, onMessengerClick, sharedText, title} = props
  const shareIconSize = isLongForm ? 18 : 26
  const referralUrl = useReferralUrl()
  const {t} = useTranslation()
  const dispatch = useDispatch()
  const whatsappLink = `https://api.whatsapp.com/send?text=${sharedText}`
  const messengerParams = {
    // TODO(cyrille): Fix the quote-props rule to account for non camelCased props.
    /* eslint-disable quote-props */
    'app_id': config.facebookSSOAppId,
    'link': `https://${referralUrl}`,
    'redirect_uri': `https://${t('canonicalUrl')}`,
    /* eslint-enable quote-props */
  }
  const messengerLink = isMobileVersion ?
    `https://m.me/share?link=https://${referralUrl}` :
    `https://www.facebook.com/dialog/send?${stringify(messengerParams)}`
  const isApple = /(mac|iphone|ipod|ipad)/i.test(navigator.platform)
  const smsLink = isApple ? `sms:?&body=${sharedText}` : `sms:?body=${sharedText}`
  const [isMessengerOpening, setIsMessengerOpening] = useState(false)
  const handleShare = useMemo(
    (): {[P in ShareMedium]: () => void} => Object.fromEntries(
      shareMediums.map(medium => [medium, (): void => {
        const action = props.isConotification ?
          shareAlert(medium) : shareApp(medium, props.visualElement)
        dispatch(action)
      }])) as {[P in ShareMedium]: () => void},
    [dispatch, props.isConotification, props.visualElement])
  const handleMail = useCallback((): void => {
    handleShare['email']()
    window.open(
      `mailto:?subject=${encodeURIComponent(t('productName') as string)}&` +
      `body=${encodeURIComponent(sharedText)}`, '_blank')
  }, [handleShare, sharedText, t])
  const handleMessengerClick = useCallback(() => {
    onMessengerClick?.()
    setIsMessengerOpening(true)
  }, [onMessengerClick])
  const handleNativeShare = useCallback((): void => {
    handleShare['native']()
    navigator.share?.({text: sharedText})
  }, [handleShare, sharedText])
  useEffect((): (() => void) => {
    if (!isMessengerOpening) {
      return (): void => void 0
    }
    const timeout = window.setTimeout((): void => {
      handleShare['Messenger']()
      window.open(messengerLink, '_blank')
      setIsMessengerOpening(false)
    }, 1000)
    return (): void => window.clearTimeout(timeout)
  }, [isMessengerOpening, handleShare, messengerLink])
  const shareButtonStyle = useMemo(() => ({
    ...isLongForm ? {
      ...longShareButtonStyle,
      marginBottom: 15,
    } : shortShareButtonStyle,
    ...buttonStyle,
  }), [buttonStyle, isLongForm])
  const whatsappStyle = useMemo((): React.CSSProperties => ({
    backgroundColor: colors.WHATSAPP_GREEN,
    order: Number.parseInt(t('whatsAppShareRank')) || 'initial',
    ...shareButtonStyle,
  }), [shareButtonStyle, t])
  const nativeShareStyle = useMemo((): React.CSSProperties => ({
    backgroundColor: colors.ALMOST_BLACK,
    ...shareButtonStyle,
  }), [shareButtonStyle])
  const messengerStyle = useMemo((): React.CSSProperties => ({
    backgroundColor: colors.MESSENGER_BLUE,
    ...shareButtonStyle,
    marginRight: 0,
  }), [shareButtonStyle])
  const mailStyle = useMemo((): React.CSSProperties => ({
    backgroundColor: colors.BRIGHT_SKY_BLUE,
    ...shareButtonStyle,
  }), [shareButtonStyle])
  const smsStyle = useMemo((): React.CSSProperties => ({
    background: messageButtonGradient,
    ...shareButtonStyle,
  }), [shareButtonStyle])
  const shareIconStyle: undefined|React.CSSProperties =
    isLongForm ? longFormShareIconStyle : undefined
  return <React.Fragment>
    {title ? <div style={shareTextStyle}>{title}</div> : undefined}
    <div style={isLongForm ? longFormContainerStyle : shareButtonsContainerStyle}>
      {isMobileVersion ? <ExternalLink
        href={smsLink} style={smsStyle} onClick={handleShare['SMS']}
        aria-label={t('Envoyer par SMS')}>
        <Chat3FillIcon style={shareIconStyle} size={shareIconSize} />
        {isLongForm ? t('SMS') : null}
      </ExternalLink> : null}
      <div style={mailStyle} onClick={handleMail} aria-label={t('Envoyer par email')}>
        <MailLineIcon style={shareIconStyle} size={shareIconSize} />
        {isLongForm ? t('Email') : null}
      </div>
      {hasNavigatorShare ? <div
        style={nativeShareStyle} onClick={handleNativeShare} aria-label={t('Partager')}>
        <ShareBoxFillIcon style={shareIconStyle} size={shareIconSize} />
        {isLongForm ? t('Partager') : null}
      </div> : null}
      <ExternalLink
        href={whatsappLink} style={whatsappStyle} aria-label={t('Partager sur WhatsApp')}
        onClick={handleShare['WhatsApp']}>
        <WhatsappLineIcon style={shareIconStyle} size={shareIconSize} />
        {isLongForm ? 'WhatsApp' : null}
      </ExternalLink>
      {isApple ? <div
        style={messengerStyle} onClick={handleMessengerClick}
        aria-label={t('Partager sur Messenger')}>
        <MessengerFillIcon style={shareIconStyle} size={shareIconSize} />
        {isLongForm ? 'Messenger' : null}
      </div> : <ExternalLink
        href={messengerLink} style={messengerStyle} aria-label={t('Partager sur Messenger')}
        onClick={handleShare['Messenger']}>
        <MessengerFillIcon style={shareIconStyle} size={shareIconSize} />
        {isLongForm ? 'Messenger' : null}
      </ExternalLink>}
    </div>
  </React.Fragment>
}
export default React.memo(ShareButtons)
