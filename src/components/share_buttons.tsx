import Chat3FillIcon from 'remixicon-react/Chat3FillIcon'
import MailLineIcon from 'remixicon-react/MailLineIcon'
import MessengerFillIcon from 'remixicon-react/MessengerFillIcon'
import ShareBoxFillIcon from 'remixicon-react/ShareBoxFillIcon'
import WhatsappLineIcon from 'remixicon-react/WhatsappLineIcon'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {shareAction, useDispatch} from 'store/actions'


type LinkProps = React.HTMLProps<HTMLAnchorElement>

const ExternalLinkBase: React.FC<LinkProps> = (props: LinkProps): React.ReactElement =>
  <a rel="noopener noreferrer" target="_blank" {...props} />
const ExternalLink = React.memo(ExternalLinkBase)


const hasNavigatorShare = !!navigator.share


interface ShareButtonsProps {
  buttonStyle?: React.CSSProperties
  onMessengerClick?: () => void
  sharedText: string
  title?: string
}
const shareButtonStyle: React.CSSProperties = {
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
const shareButtonsContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: 20,
}
const shareTextStyle: React.CSSProperties = {
  alignSelf: 'center',
  fontSize: 15,
  fontWeight: 600,
  margin: '25px 0px 15px',
}
const messageButtonGradient = `linear-gradient(${colors.LIGHT_GREEN}, ${colors.MEDIUM_GREEN})`
const shareIconSize = 26

const ShareButtons = (props: ShareButtonsProps): React.ReactElement => {
  const {buttonStyle, onMessengerClick, sharedText, title} = props
  const {t} = useTranslation()
  const dispatch = useDispatch()
  const whatsappLink = `https://wa.me/?text=${sharedText}`
  const messengerLink = `fb-messenger://share?link=${sharedText}`
  const isApple = /(mac|iphone|ipod|ipad)/i.test(navigator.platform)
  const smsLink = isApple ? `sms:?&body=${sharedText}` : `sms:?body=${sharedText}`
  const [isMessengerOpening, setIsMessengerOpening] = useState(false)
  const handleShare = useCallback((): void => {
    dispatch(shareAction)
  }, [dispatch])
  const handleMail = useCallback((): void => {
    handleShare()
    window.open(
      `mailto:?subject=${encodeURIComponent(t('productName') as string)}&` +
      `body=${encodeURIComponent(sharedText)}`, '_blank')
  }, [handleShare, sharedText, t])
  const handleMessengerClick = useCallback(() => {
    onMessengerClick?.()
    setIsMessengerOpening(true)
  }, [onMessengerClick])
  const handleNativeShare = useCallback((): void => {
    handleShare()
    navigator.share?.({text: sharedText})
  }, [handleShare, sharedText])
  useEffect((): (() => void) => {
    if (!isMessengerOpening) {
      return (): void => void 0
    }
    const timeout = window.setTimeout((): void => {
      handleShare()
      window.open(messengerLink, '_blank')
      setIsMessengerOpening(false)
    }, 1000)
    return (): void => window.clearTimeout(timeout)
  }, [isMessengerOpening, handleShare, messengerLink])
  const whatsappStyle = useMemo((): React.CSSProperties => ({
    ...shareButtonStyle,
    backgroundColor: colors.WHATSAPP_GREEN,
    ...buttonStyle,
  }), [buttonStyle])
  const nativeShareStyle = useMemo((): React.CSSProperties => ({
    ...shareButtonStyle,
    backgroundColor: '#000',
    ...buttonStyle,
  }), [buttonStyle])
  const messengerStyle = useMemo((): React.CSSProperties => ({
    ...shareButtonStyle,
    backgroundColor: colors.MESSENGER_BLUE,
    ...buttonStyle,
    marginRight: 0,
  }), [buttonStyle])
  const mailStyle = useMemo((): React.CSSProperties => ({
    ...shareButtonStyle,
    backgroundColor: colors.BRIGHT_SKY_BLUE,
    ...buttonStyle,
  }), [buttonStyle])
  const smsStyle = useMemo((): React.CSSProperties => ({
    ...shareButtonStyle,
    background: messageButtonGradient,
    ...buttonStyle,
  }), [buttonStyle])
  return <React.Fragment>
    {title ? <div style={shareTextStyle}>{title}</div> : undefined}
    <div style={shareButtonsContainerStyle} aria-label={t('Envoyer par SMS')}>
      <ExternalLink href={smsLink} style={smsStyle} onClick={handleShare}>
        <Chat3FillIcon size={shareIconSize} />
      </ExternalLink>
      <div style={mailStyle} onClick={handleMail} aria-label={t('Envoyer par email')}>
        <MailLineIcon size={shareIconSize} />
      </div>
      {hasNavigatorShare ? <div
        style={nativeShareStyle} onClick={handleNativeShare} aria-label={t('Partager')}>
        <ShareBoxFillIcon size={shareIconSize} />
      </div> : null}
      <ExternalLink
        href={whatsappLink} style={whatsappStyle} aria-label={t('Partager sur WhatsApp')}
        onClick={handleShare}>
        <WhatsappLineIcon size={shareIconSize} />
      </ExternalLink>
      {isApple ? <div
        style={messengerStyle} onClick={handleMessengerClick}
        aria-label={t('Partager sur Messenger')}>
        <MessengerFillIcon size={shareIconSize} />
      </div> : <ExternalLink
        href={messengerLink} style={messengerStyle} aria-label={t('Partager sur Messenger')}
        onClick={handleShare}>
        <MessengerFillIcon size={shareIconSize} />
      </ExternalLink>}
    </div>
  </React.Fragment>
}
export default React.memo(ShareButtons)
