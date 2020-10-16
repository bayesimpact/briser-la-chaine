import React from 'react'
import {useTranslation} from 'react-i18next'
import ArrowDownLineIcon from 'remixicon-react/ArrowDownLineIcon'
import ArrowUpLineIcon from 'remixicon-react/ArrowUpLineIcon'
import {RemixiconReactIconComponentType} from 'remixicon-react/dist/typings'

import {lightButtonStyle} from 'components/buttons'
import {StringIcon, isStringIcon} from 'components/navigation'

interface StepperProps {
  stepCount: number
  stepIndex: number
  style?: React.CSSProperties
}

const progressBarStyle: React.CSSProperties = {
  backgroundColor: colors.LIGHT_BLUE_GREY,
  borderRadius: 2,
  height: 4,
  marginTop: 5,
  width: '100%',
}
const StepperBase = ({stepCount, stepIndex, style}: StepperProps): React.ReactElement => {
  const {t} = useTranslation()
  const progressStyle: React.CSSProperties = {
    backgroundColor: colors.ALMOST_BLACK,
    borderRadius: 2,
    height: '100%',
    width: `${100 * stepIndex / stepCount}%`,
  }
  const containerStyle: React.CSSProperties = {
    color: colors.DARK_GREY_BLUE,
    fontSize: 10,
    textTransform: 'uppercase',
    ...style,
  }
  return <div style={containerStyle}>
    {t('Question {{stepIndex}}/{{stepCount}}', {stepCount, stepIndex})}
    <div style={progressBarStyle}>
      <div style={progressStyle} />
    </div>
  </div>
}
const Stepper = React.memo(StepperBase)

const stepperStyle: React.CSSProperties = {
  alignSelf: 'flex-end',
  minWidth: 70,
  width: 85,
}
const previousButtonStyle: React.CSSProperties = {
  ...lightButtonStyle,
  alignItems: 'center',
  backgroundColor: colors.PALE_GREY,
  border: 'none',
  display: 'flex',
  flex: 'none',
  marginLeft: 10,
}
const nextButtonStyle: React.CSSProperties = {
  ...previousButtonStyle,
  backgroundColor: colors.MINTY_GREEN,
}

export interface MemoryHelperConfig {
  children?: React.ReactNode
  icon?: StringIcon|RemixiconReactIconComponentType
  isGreen?: boolean
  onNextText?: string
  title: React.ReactNode
}
interface MemoryHelperProps extends MemoryHelperConfig, StepperProps {
  onNext: () => void
  onPrevious?: () => void
}
const MemoryHelper = (props: MemoryHelperProps): React.ReactElement => {
  const {children, icon: Icon, isGreen, onNext, onNextText, onPrevious, stepCount, stepIndex, style,
    title} = props
  const {t, t: translate} = useTranslation()
  const titleStyle: React.CSSProperties = {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: 800,
    margin: '5px 0',
  }
  return <div style={{display: 'flex', flexDirection: 'column', ...style}}>
    <div style={{minHeight: 150}}>
      <div style={isGreen ? {color: colors.MINTY_GREEN} : {}}>
        {Icon ? isStringIcon(Icon) ?
          // TODO(cyrille): Color this on `isGreen` if necessary.
          <img src={Icon.src} alt={translate(Icon.alt)} style={{height: 24, width: 24}} /> :
          <Icon /> : null}
        <h2 style={titleStyle}>{title}</h2>
      </div>
      {children}
    </div>
    <div style={{flex: 1}} />
    <div style={{alignItems: 'center', display: 'flex'}}>
      <Stepper {...{stepCount, stepIndex}} style={stepperStyle} />
      <div style={{flex: 1}} />
      {onPrevious ? <ArrowUpLineIcon style={previousButtonStyle} onClick={onPrevious} /> : null}
      <div style={nextButtonStyle} onClick={onNext}>
        {onNextText ? translate(onNextText) : t('Suivant')}
        <ArrowDownLineIcon style={{marginLeft: 14}} />
      </div>
    </div>
  </div>
}

export default React.memo(MemoryHelper)
