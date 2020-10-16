import React from 'react'
import {useTranslation} from 'react-i18next'

import {prepareT} from 'store/i18n'

import BurgerMenu from 'components/burger_menu'
import logoLoopBlackImage from 'images/logo-loop-black.svg'


const steps = [
  prepareT('Analyse'),
  prepareT('Prévention'),
  prepareT('Action'),
] as const


interface TopBarProps {
  progress: 0|1|2
}

const containerStyle: React.CSSProperties = {
  alignItems: 'center',
  boxShadow: '0 1px 1px 0 rgba(212, 220, 231, 0.7)',
  display: 'flex',
  fontSize: 10,
  fontWeight: 600,
  padding: '13px 15px',
}
const stepStyle: React.CSSProperties = {
  color: colors.ALMOST_BLACK,
  position: 'relative',
}
const bulletStyle: React.CSSProperties = {
  backgroundColor: 'currentColor',
  borderRadius: 10,
  display: 'block',
  flex: 'none',
  height: 10,
  margin: 4,
  width: 10,
}
const bulletDoneStyle: React.CSSProperties = {
  ...bulletStyle,
  backgroundColor: colors.MINTY_GREEN,
}
const bulletToDoStyle: React.CSSProperties = {
  ...bulletStyle,
  backgroundColor: colors.LIGHT_BLUE_GREY,
}
const stepTextStyle: React.CSSProperties = {
  left: '50%',
  marginTop: 7,
  position: 'absolute',
  textTransform: 'uppercase',
  top: '100%',
  transform: 'translateX(-50%)',
}
const stepTextDoneStyle: React.CSSProperties = {
  ...stepTextStyle,
  color: colors.SEAWEED,
}
const stepTextToDoStyle: React.CSSProperties = {
  ...stepTextStyle,
  color: colors.LIGHT_BLUE_GREY,
}
const lineStyle: React.CSSProperties = {
  backgroundColor: colors.LIGHT_BLUE_GREY,
  borderRadius: 1,
  flex: 1,
  height: 2,
}
const lineDoneStyle: React.CSSProperties = {
  ...lineStyle,
  backgroundColor: colors.MINTY_GREEN,
}
const burgerMenuStyle: React.CSSProperties = {
  position: 'static',
}


const TopBar = ({progress}: TopBarProps): React.ReactElement => {
  const {t, t: translate} = useTranslation()
  return <div style={containerStyle}>
    <img src={logoLoopBlackImage} alt={t('productName')} height={22} width={40} />
    <div style={{flex: 1}} />
    <div style={{alignItems: 'center', display: 'flex', flex: 3, marginBottom: 20, minWidth: 140}}>
      {steps.map((title, index) => <React.Fragment key={index}>
        <div style={stepStyle}>
          <span
            style={index < progress ? bulletDoneStyle : index === progress ?
              bulletStyle : bulletToDoStyle} />
          <span
            style={index < progress ? stepTextDoneStyle : index === progress ?
              stepTextStyle : stepTextToDoStyle}>
            {translate(title)}
          </span>
        </div>
        {index < steps.length - 1 ?
          <div style={index < progress ? lineDoneStyle : lineStyle} /> : null}
      </React.Fragment>)}
    </div>
    <div style={{flex: 1}} />
    <div style={{textAlign: 'right', width: 40}}>
      <BurgerMenu style={burgerMenuStyle} />
    </div>
  </div>
}


export default React.memo(TopBar)
