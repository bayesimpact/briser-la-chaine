import Chat3LineIcon from 'remixicon-react/Chat3LineIcon'
import MailLineIcon from 'remixicon-react/MailLineIcon'
import MessengerFillIcon from 'remixicon-react/MessengerFillIcon'
import WhatsappLineIcon from 'remixicon-react/WhatsappLineIcon'
import React, {useCallback} from 'react'


type LinkProps = React.HTMLProps<HTMLAnchorElement>

const ExternalLinkBase: React.FC<LinkProps> = (props: LinkProps): React.ReactElement =>
  <a rel="noopener noreferrer" target="_blank" {...props} />
const ExternalLink = React.memo(ExternalLinkBase)


interface ShareButtonsProps {
  sharedText: string
  title: string
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
  fontWeight: 'bold',
  margin: '25px 0px 15px',
}
const whatsappStyle: React.CSSProperties = {
  ...shareButtonStyle,
  backgroundColor: colors.WHATSAPP_GREEN,
}
const messengerStyle: React.CSSProperties = {
  ...shareButtonStyle,
  backgroundColor: colors.MESSENGER_BLUE,
  marginRight: 0,
}
const mailStyle: React.CSSProperties = {
  ...shareButtonStyle,
  backgroundColor: colors.BRIGHT_SKY_BLUE,
}
const messageButtonGradient = `linear-gradient(${colors.LIGHT_GREEN}, ${colors.MEDIUM_GREEN})`
const smsStyle: React.CSSProperties = {
  ...shareButtonStyle,
  background: messageButtonGradient,
}
const shareIconSize = 26

const ShareButtons = ({sharedText, title}: ShareButtonsProps): React.ReactElement => {
  const whatsappLink = `https://wa.me/?text=${sharedText}`
  const messengerLink = `fb-messenger://share?link=${sharedText}`
  const isApple = /(mac|iphone|ipod|ipad)/i.test(navigator.platform)
  const smsLink = isApple ? `sms:?&body=${sharedText}` : `sms:?body=${sharedText}`
  const handleMail = useCallback(
    (): void => void window.open(
      `mailto:?subject=${encodeURIComponent(config.productName)}&` +
      `body=${encodeURIComponent(sharedText)}`, '_blank'),
    [sharedText])
  return <React.Fragment>
    <div style={shareTextStyle}>{title}</div>
    <div style={shareButtonsContainerStyle}>
      <ExternalLink href={smsLink} style={smsStyle}>
        <Chat3LineIcon size={shareIconSize} />
      </ExternalLink>
      <div style={mailStyle} onClick={handleMail}>
        <MailLineIcon size={shareIconSize} />
      </div>
      <ExternalLink href={whatsappLink} style={whatsappStyle}>
        <WhatsappLineIcon size={shareIconSize} />
      </ExternalLink>
      <ExternalLink href={messengerLink} style={messengerStyle}>
        <MessengerFillIcon size={shareIconSize} />
      </ExternalLink>
    </div>
  </React.Fragment>
}
export default React.memo(ShareButtons)
