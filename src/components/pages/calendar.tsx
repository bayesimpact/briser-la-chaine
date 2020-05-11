import {format as dateFormat, isSameDay, subDays} from 'date-fns'
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'
import {Redirect} from 'react-router-dom'
import AlertFillIcon from 'remixicon-react/AlertFillIcon'
import ParentFillIcon from 'remixicon-react/ParentFillIcon'
import UserFillIcon from 'remixicon-react/UserFillIcon'
import UserHeartFillIcon from 'remixicon-react/UserHeartFillIcon'
import {RemixiconReactIconComponentType} from 'remixicon-react/dist/typings'

import {useFastForward} from 'hooks/fast_forward'
import {computeContagiousPeriodAction, useDispatch} from 'store/actions'
import {useDateOption} from 'store/i18n'
import {useSelector, useSymptomsOnsetDate} from 'store/selections'
import {Routes} from 'store/url'

import {PageWithNav} from 'components/navigation'
import {CircularProgress} from 'components/progress'


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
  const {children, height = 80, linesColor, numTicks, ticksColor = colors.SALMON, title} = props
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
    fontWeight: 'bold',
    opacity: title ? 1 : 0,
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
  const warningStyle = useMemo((): React.CSSProperties => ({
    bottom: -2,
    left: -6,
    opacity: isWarningShown ? 1 : 0,
    position: 'absolute',
    transition: stepTransition,
  }), [isWarningShown])
  // TODO(pascal): Add some white background behind the alert icon.
  return <div style={style}>
    <Icon color={colors.SALMON} />
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
  backgroundColor: colors.BRIGHT_SKY_BLUE,
  bottom: 0,
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  fontSize: 15,
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
const progressStyle: React.CSSProperties = {
  color: '#fff',
}
const legendTextStyle: React.CSSProperties = {
  fontWeight: 'bold',
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



const CalendarPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const dateOption = useDateOption()
  const history = useHistory()
  const dispatch = useDispatch()
  const symptomsOnsetDate = useSymptomsOnsetDate()
  const isContagiousPeriodComputed = useSelector(
    ({user: {contagiousPeriodEnd, contagiousPeriodStart}}): boolean =>
      !!(contagiousPeriodEnd && contagiousPeriodStart))
  const firstSymptomsDate = symptomsOnsetDate || subDays(new Date(), 1)
  const isOnsetToday = isSameDay(new Date(), firstSymptomsDate)
  const contagiousStartDate = subDays(firstSymptomsDate, config.numDaysContagiousBeforeSymptoms)
  // TODO(pascal): Use a router so that browser navigation works between those steps.
  const [step, setStep] = useState(0)

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
  }, [dispatch, history, isContagiousPeriodComputed, step])
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
  if (!symptomsOnsetDate) {
    return <Redirect to={Routes.SYMPTOMS_ONSET} />
  }

  const titleStyle: React.CSSProperties = {
    alignSelf: 'stretch',
    fontSize: 22,
    fontWeight: step && step < 3 ? 'normal' : 'bold',
    marginBottom: 12,
  }
  const startPeriodBarStyle: React.CSSProperties = {
    backgroundColor: step ? '#000' : colors.SALMON,
    flex: 1,
    height: 2,
    maxWidth: step ? 85 : 400,
    transition: stepTransition,
  }
  const startPeriodLegendStyle: React.CSSProperties = {
    ...legendTextStyle,
    color: colors.SALMON,
    opacity: step ? 0 : 1,
    transition: stepTransition,
  }
  const symptomsOnsetBarStyle: React.CSSProperties = {
    backgroundColor: isOnsetToday ? colors.SALMON : '#000',
    flex: 1,
    height: isOnsetToday ? 1 : 2,
    maxWidth: step || isOnsetToday ? 10 : 700,
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

  return <PageWithNav nextButton={t('Suivant')} onNext={gotoNext}>
    <div style={isContagiousPeriodComputed ? hiddenWaitingPageStyle : waitingPageStyle}>
      <CircularProgress style={progressStyle} />
      <Trans style={{margin: '20px 40px'}}>
        Calcul de votre période de contagion en cours…
      </Trans>
    </div>

    <div style={{alignSelf: 'stretch'}}>
      <h1 style={titleStyle}>
        {!step ? t('Période pendant laquelle vous étiez contagieux(se)') :
          step === 1 ? <Trans parent={null}>
            Toutes les personnes rencontrées pendant cette période
            sont <strong style={{color: colors.SALMON}}>
              potentiellement contaminées sans le savoir
            </strong>
          </Trans> : step === 2 ? <Trans parent={null}>
            Il est vital pour leur santé de <strong style={{color: colors.SALMON}}>
              les alerter le plus rapidement possible.
            </strong><br /><br />
            Nous sommes là pour ça.
          </Trans> : t('En résumé\u00A0:')}
      </h1>
      {step ? null : <div style={{fontSize: 15}}>
        {t("Les symptômes peuvent apparaître jusqu'à 14 jours après la contamination.")}
      </div>}
    </div>
    <div style={{alignSelf: 'stretch'}}>
      <Period
        numTicks={10} height={160} linesColor={colors.VERY_LIGHT_PINK}
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
        linesColor={step < 3 ? undefined : colors.REALLY_LIGHT_BLUE}
        title={step < 3 ? '' : t('Confinez-vous')}>
        {isOnsetToday && !step ? <div style={{display: 'flex', ...todayContainerStyle}}>
          <div style={{...basicBarStyle, flex: 1}} />
          <div style={todaySymptomsOnsetLegendStyle}>
            {t('Premiers symptômes')}
          </div></div> : <div style={todayBarStyle} />}
        <strong>{t("aujourd'hui")}</strong>
      </Period>
    </div>
  </PageWithNav>
}
const MemoPage = React.memo(CalendarPage)


export {MemoPage as CalendarPage}
