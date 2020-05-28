import {addDays, format as dateFormat, isSameDay, subDays} from 'date-fns'
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'
import {Redirect} from 'react-router-dom'
import AlertFillIcon from 'remixicon-react/AlertFillIcon'
import ParentFillIcon from 'remixicon-react/ParentFillIcon'
import UserFillIcon from 'remixicon-react/UserFillIcon'
import UserHeartFillIcon from 'remixicon-react/UserHeartFillIcon'
import {RemixiconReactIconComponentType} from 'remixicon-react/dist/typings'

import {useBackgroundColor} from 'hooks/background_color'
import {useFastForward} from 'hooks/fast_forward'
import {useRouteStepper} from 'hooks/stepper'
import {computeContagiousPeriodAction, useDispatch} from 'store/actions'
import {useDateOption} from 'store/i18n'
import {useSelector, useSymptomsOnsetDate} from 'store/selections'
import {Routes} from 'store/url'

import {PageWithNav} from 'components/navigation'
import logoLoopImage from 'images/logo-loop.svg'


const today = new Date()


// Extract color components.
export const colorToComponents = (color: string): [number, number, number] => {
  if (color.length === 7) {
    return [
      Number.parseInt(color.slice(1, 3), 16),
      Number.parseInt(color.slice(3, 5), 16),
      Number.parseInt(color.slice(5, 7), 16),
    ]
  }
  return [
    Number.parseInt(color.slice(1, 2), 16) * 0x11,
    Number.parseInt(color.slice(2, 3), 16) * 0x11,
    Number.parseInt(color.slice(3, 4), 16) * 0x11,
  ]
}

// Change #rrggbb color to rgba(r, g, b, alpha)
export const colorToAlpha = (color: string|undefined, alpha: number): string => {
  if (!color) {
    return ''
  }
  const [red, green, blue] = colorToComponents(color)
  return `rgba(${red}, ${green}, ${blue}, ${alpha === 0 ? 0 : alpha || 1})`
}


interface PeriodProps {
  children: React.ReactNode
  height?: number
  linesColor?: string
  numTicks: number
  style?: React.CSSProperties
  ticksColor?: string
  title?: string
}


const titleContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
}


const PeriodBase = (props: PeriodProps): React.ReactElement => {
  const {children, height = 80, linesColor, numTicks, ticksColor = colors.BARBIE_PINK,
    title} = props
  const containerStyle: React.CSSProperties = {
    background: linesColor ? 'repeating-linear-gradient(-45deg, ' +
      `transparent, transparent 20px, ${linesColor} 20px, ${linesColor} 25px)` : undefined,
    fontSize: 13,
    height,
    padding: '4px 16px',
    position: 'relative',
  }
  const tickStyle: React.CSSProperties = {
    backgroundColor: ticksColor,
    height: 1,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 10,
  }
  const titleStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    fontSize: 22,
    fontWeight: 600,
    maxWidth: 280,
    opacity: title ? 1 : 0,
    textAlign: 'center',
  }
  return <div style={containerStyle}>
    {new Array(numTicks).fill(undefined).map((unused, index): React.ReactElement =>
      <div key={`tick-${index}`} style={{...tickStyle, top: `${index / numTicks * 100}%`}} />)}
    <div style={titleContainerStyle}>
      <div style={titleStyle}>
        {title}
      </div>
    </div>
    {children}
  </div>
}
const Period = React.memo(PeriodBase)


const stepTransition = '450ms'


interface PersonIconProps {
  icon?: RemixiconReactIconComponentType
  isWarningShown: boolean
  left: string
  opacity: number
  top: string
}


const PersonIconBase = (props: PersonIconProps): React.ReactElement => {
  const {icon: Icon = UserFillIcon, isWarningShown, left, opacity, top} = props
  const style = useMemo((): React.CSSProperties => ({
    display: 'flex',
    left,
    opacity,
    position: 'absolute',
    top,
    transition: stepTransition,
  }), [left, opacity, top])
  // A little white square behind the warning so that the exclamation mark appears in white.
  const whiteSquareStyle = useMemo((): React.CSSProperties => ({
    backgroundColor: '#fff',
    bottom: 1,
    height: 10,
    left: 1.5,
    opacity: isWarningShown ? 1 : 0,
    position: 'absolute',
    transition: stepTransition,
    width: 5,
  }), [isWarningShown])
  const warningStyle = useMemo((): React.CSSProperties => ({
    bottom: -2,
    left: -6,
    opacity: isWarningShown ? 1 : 0,
    position: 'absolute',
    transition: stepTransition,
  }), [isWarningShown])
  return <div style={style}>
    <Icon color={colors.BARBIE_PINK} />
    <span style={whiteSquareStyle} />
    <AlertFillIcon style={warningStyle} size={18} />
  </div>
}
const PersonIcon = React.memo(PersonIconBase)


const ManyPeopleBase = (props: {isWarningShown: boolean; opacity: number}): React.ReactElement => {
  return <React.Fragment>
    <PersonIcon left="11.6%" top="40.7%" icon={UserHeartFillIcon} {...props} />
    <PersonIcon left="30.4%" top="63%" icon={ParentFillIcon} {...props} />
    <PersonIcon left="35%" top="11%" {...props} />
    <PersonIcon left="48%" top="29.6%" icon={UserHeartFillIcon} {...props} />
    <PersonIcon left="75.5%" top="68.5%" icon={ParentFillIcon} {...props} />
    <PersonIcon left="77.9%" top="21%" {...props} />
  </React.Fragment>
}
const ManyPeople = React.memo(ManyPeopleBase)


const waitingPageStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: '#000',
  bottom: 0,
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Poppins',
  fontSize: 18,
  fontWeight: 800,
  justifyContent: 'center',
  left: 0,
  minHeight: window.innerHeight,
  position: 'absolute',
  right: 0,
  textAlign: 'center',
  top: 0,
  transition: '300ms',
  zIndex: 2,
}
const hiddenWaitingPageStyle: React.CSSProperties = {
  ...waitingPageStyle,
  opacity: 0,
  pointerEvents: 'none',
}
const legendTextStyle: React.CSSProperties = {
  fontWeight: 600,
  marginLeft: 4,
  transform: 'translateY(-50%)',
}
const todayContainerStyle: React.CSSProperties = {
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
}
const basicBarStyle: React.CSSProperties = {
  backgroundColor: '#000',
  height: 2,
}
const todayBarStyle: React.CSSProperties = {
  ...todayContainerStyle,
  ...basicBarStyle,
}


// TODO(pascal): Update UI to take into account reduction of days to review.
const CalendarPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const dateOption = useDateOption()
  const history = useHistory()
  const dispatch = useDispatch()
  const symptomsOnsetDate = useSymptomsOnsetDate()
  const contagiousPeriodEnd = useSelector(({user: {contagiousPeriodEnd}}) => contagiousPeriodEnd)
  const contagiousPeriodStart = useSelector(
    ({user: {contagiousPeriodStart}}) => contagiousPeriodStart)
  const isContagiousPeriodComputed = !!(contagiousPeriodEnd && contagiousPeriodStart)
  const firstSymptomsDate = symptomsOnsetDate || subDays(new Date(), 1)
  const isOnsetToday = isSameDay(today, firstSymptomsDate)
  const contagiousStartDate = contagiousPeriodStart ||
    subDays(firstSymptomsDate, config.numDaysContagiousBeforeSymptoms)
  const contagiousEndDate = contagiousPeriodEnd ||
    addDays(contagiousStartDate, config.numDaysContagious)
  const isStillContagious = today < contagiousEndDate || isSameDay(today, contagiousEndDate)
  const [step, setStep] = useRouteStepper(4)

  const gotoNext = useCallback((): void => {
    if (!isContagiousPeriodComputed) {
      dispatch(computeContagiousPeriodAction)
      return
    }
    if (step < 3) {
      setStep(step + 1)
      return
    }
    history.push(Routes.CONTACTS_SEARCH)
  }, [dispatch, history, isContagiousPeriodComputed, setStep, step])
  useFastForward(gotoNext)

  const hasSymptomsOnsetDate = !!symptomsOnsetDate
  useEffect((): (() => void) => {
    if (!hasSymptomsOnsetDate || isContagiousPeriodComputed) {
      return (): void => void 0
    }
    const timeout = window.setTimeout(
      (): void => void dispatch(computeContagiousPeriodAction),
      2000,
    )
    return (): void => window.clearTimeout(timeout)
  }, [firstSymptomsDate, dispatch, hasSymptomsOnsetDate, isContagiousPeriodComputed])

  const textRef = useRef<HTMLDivElement>(null)
  const [textSize, setTextSize] = useState(0)
  useLayoutEffect((): void => {
    const newTextSize = textRef.current?.getBoundingClientRect()?.width
    if (newTextSize) {
      setTextSize(newTextSize)
    }
  }, [])

  useBackgroundColor(!symptomsOnsetDate || isContagiousPeriodComputed ? undefined : '#000')

  if (!symptomsOnsetDate) {
    return <Redirect to={Routes.SYMPTOMS_ONSET} />
  }

  const titleStyle: React.CSSProperties = {
    alignSelf: 'stretch',
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: 800,
    marginBottom: 12,
  }
  const startPeriodBarStyle: React.CSSProperties = {
    backgroundColor: step ? '#000' : colors.BARBIE_PINK,
    flex: 1,
    height: 2,
    maxWidth: step ? 85 : 400,
    transition: stepTransition,
  }
  const startPeriodLegendStyle: React.CSSProperties = {
    ...legendTextStyle,
    color: colors.BARBIE_PINK,
    opacity: step ? 0 : 1,
    transition: stepTransition,
  }
  const symptomsOnsetBarStyle: React.CSSProperties = {
    backgroundColor: isOnsetToday ? colors.BARBIE_PINK : '#000',
    flex: 1,
    height: isOnsetToday ? 1 : 2,
    maxWidth: step || isOnsetToday ? 10 : 400,
    transition: stepTransition,
  }
  const symptomsOnsetLegendStyle: React.CSSProperties = {
    ...legendTextStyle,
    color: '#000',
    minWidth: textSize || 'auto',
    opacity: step || isOnsetToday ? 0 : 1,
    transition: stepTransition,
  }
  const todaySymptomsOnsetLegendStyle: React.CSSProperties = {
    ...symptomsOnsetLegendStyle,
    opacity: 1,
  }
  const symptomsOnsetDateStyle: React.CSSProperties = {
    left: 0,
    opacity: step || isOnsetToday ? 0 : 1,
    padding: '4px 16px',
    position: 'absolute',
    top: '50%',
    transition: stepTransition,
  }
  const lastRecommendation = isStillContagious ?
    t("Confinez-vous et prenez l'avis d'un médecin") : t('Faites-vous tester')
  const isBottomLineShort = (isOnsetToday && !step) || (!isStillContagious && step < 3)

  return <PageWithNav nextButton={t('Suivant')} onNext={gotoNext}>
    <div style={isContagiousPeriodComputed ? hiddenWaitingPageStyle : waitingPageStyle}>
      <img src={logoLoopImage} alt="" />
      <Trans style={{margin: '20px 40px', maxWidth: 240}}>
        Calcul de votre période de contagion en cours…
      </Trans>
    </div>

    <div style={{alignSelf: 'stretch'}}>
      <h1 style={titleStyle}>
        {!step ? t('Période pendant laquelle vous étiez contagieux(se)') :
          step === 1 ? <Trans parent={null}>
            Toutes les personnes rencontrées pendant cette période
            sont <strong style={{color: colors.BARBIE_PINK}}>
              potentiellement contaminées sans le savoir
            </strong>
          </Trans> : step === 2 ? <Trans parent={null}>
            Il est essentiel pour leur santé de <strong style={{color: colors.BARBIE_PINK}}>
              les alerter le plus rapidement possible.
            </strong><br /><br />
            Nous sommes là pour ça.
          </Trans> : t("En résumé, voici ce que vous devez faire dès aujourd'hui\u00A0:")}
      </h1>
      {step ? null : <div style={{fontSize: 15}}>
        {t("Les symptômes peuvent apparaître jusqu'à 14 jours après la contamination.")}
      </div>}
    </div>
    <div style={{alignSelf: 'stretch'}}>
      <Period
        numTicks={10} height={160} linesColor={colorToAlpha(colors.BARBIE_PINK, .15)}
        title={step < 3 ? '' : t('Alertez vos contacts')}>
        {dateFormat(contagiousStartDate, 'EEEE d MMMM', dateOption)}
        <div style={{display: 'flex', left: 0, position: 'absolute', right: 0, top: 0}}>
          <div style={startPeriodBarStyle} />
          <div style={startPeriodLegendStyle} ref={textRef}>
            {t('Début de votre période contagieuse')}
          </div>
        </div>
        <div style={{display: 'flex', left: 0, position: 'absolute', right: 0, top: '50%'}}>
          <div style={symptomsOnsetBarStyle} />
          <div style={symptomsOnsetLegendStyle}>
            {t('Premiers symptômes')}
          </div>
        </div>
        <div style={symptomsOnsetDateStyle}>
          {dateFormat(symptomsOnsetDate, 'EEEE d MMMM', dateOption)}
        </div>
        <ManyPeople opacity={step && step < 3 ? 1 : 0} isWarningShown={step > 1} />
      </Period>
      <Period
        numTicks={step < 3 ? 5 : 10} ticksColor={colors.MEDIUM_GREY} height={step < 3 ? 80 : 160}
        linesColor={step < 3 ? undefined : colorToAlpha(colors.MINTY_GREEN, .15)}
        title={step < 3 ? '' : lastRecommendation}>
        {isBottomLineShort ? <div style={{display: 'flex', ...todayContainerStyle}}>
          <div style={{...basicBarStyle, flex: 1}} />
          <div style={todaySymptomsOnsetLegendStyle}>
            {isOnsetToday ? t('Premiers symptômes') : t('Fin de votre période contagieuse')}
          </div></div> : <div style={todayBarStyle} />}
        <strong>
          {isStillContagious ? t("aujourd'hui") :
            dateFormat(contagiousEndDate, 'EEEE d MMMM', dateOption)}
        </strong>
      </Period>
    </div>
  </PageWithNav>
}
const MemoPage = React.memo(CalendarPage)


export {MemoPage as CalendarPage}
