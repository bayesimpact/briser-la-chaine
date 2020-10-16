import React, {useEffect} from 'react'
import {Trans} from 'react-i18next'

import {Modal, ModalConfig} from 'components/modal'

import heartCelebrationImage from 'images/heart_celebration.svg'


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
  color: colors.ALMOST_BLACK,
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


interface WithThankYouPopProps extends Omit<ModalConfig, 'children'|'style'> {
  children: React.ReactNode
  displayName: string
  isThanksShown: boolean
}

const WithThankYouPopUpBase = (props: WithThankYouPopProps): React.ReactElement => {
  const {children, isThanksShown, displayName, onClose, onHidden} = props

  useEffect((): (() => void) => {
    if (!isThanksShown) {
      return (): void => void 0
    }
    const timeout = window.setTimeout((): void => onClose?.(), 2000)
    return (): void => clearTimeout(timeout)
  }, [isThanksShown, onClose])

  return <React.Fragment>
    <ThankYouPopUp isShown={isThanksShown} name={displayName} onHidden={onHidden} />
    {children}
  </React.Fragment>
}
const WithThankYouPopUp = React.memo(WithThankYouPopUpBase)

export default WithThankYouPopUp
