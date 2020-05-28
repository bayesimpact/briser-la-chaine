import {addDays, format as dateFormat, formatRelative, startOfDay, subDays} from 'date-fns'
import React, {useCallback, useMemo, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'
import {Swipeable} from 'react-swipeable'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'

import {useFastForward} from 'hooks/fast_forward'
import {saveSymptomsOnsetDate, useDispatch} from 'store/actions'
import {useSymptomsOnsetDate} from 'store/selections'
import {useDateOption} from 'store/i18n'
import {Routes} from 'store/url'

import {PageWithNav} from 'components/navigation'


const todayDate = startOfDay(new Date())
const fartherDate = subDays(todayDate, 30)

const transition = '450ms'

interface DayCardProps {
  date: Date
  isHidden?: boolean
  isMain?: boolean
  onClick?: (day: Date) => void
  size?: number
  style?: React.CSSProperties
}

const flexCenterStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
}

const DayCardBase = (props: DayCardProps): React.ReactElement => {
  const {date, isHidden, isMain, onClick, style} = props
  const dateOption = useDateOption()
  const isClickable = !!onClick
  const containerStyle: React.CSSProperties = useMemo(() => ({
    ...flexCenterStyle,
    backgroundColor: isMain ? colors.MINTY_GREEN : colors.PALE_GREY,
    borderRadius: 45,
    color: isMain ? '#000' : colors.DARK_GREY_BLUE,
    cursor: isClickable ? 'pointer' : undefined,
    flex: 'none',
    flexDirection: 'column',
    height: 160,
    left: '50%',
    // TODO(cyrille): Move positional style to parent.
    position: 'absolute',
    top: '50%',
    transition,
    width: 160,
    ...style,
    opacity: isHidden ? 0 : (style?.opacity || 1),
    transform: 'translate(-50%, -50%) ' + (style?.transform || ''),
  }), [isClickable, isHidden, isMain, style])
  const textStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    opacity: isMain ? 1 : 0,
    transition,
  }
  const bigTextStyle: React.CSSProperties = {
    fontFamily: 'Poppins',
    fontSize: 55,
    fontWeight: 800,
    margin: -12,
  }
  const weekDay = useMemo(() => dateFormat(date, 'EEE', dateOption), [date, dateOption])
  const month = useMemo(() => dateFormat(date, 'MMMM', dateOption), [date, dateOption])
  const handleClick = useCallback((): void => onClick?.(date), [date, onClick])
  return <div style={containerStyle} onClick={onClick && handleClick}>
    <span style={textStyle}>{weekDay || 'lun.'}</span>
    <span style={bigTextStyle}>{date.getDate()}</span>
    <span style={textStyle}>{month || 'mars'}</span>
  </div>
}
const DayCard = React.memo(DayCardBase)


interface DayCardsProps {
  currentDay: Date
  firstDay: Date
  onDayChange: (day: Date) => void
  lastDay: Date
}


const cardsContainerStyle: React.CSSProperties = {
  height: 162,
  overflow: 'hidden',
  position: 'relative',
  width: '100vw',
}
const veryLeftCardStyle: React.CSSProperties = {
  opacity: 0,
  transform: 'translateX(-150%) scale(.5)',
}
const leftCardStyle: React.CSSProperties = {
  transform: 'translateX(-106%) scale(.75)',
}
const rightCardStyle: React.CSSProperties = {
  transform: 'translateX(106%) scale(.75)',
}
const veryRightCardStyle: React.CSSProperties = {
  opacity: 0,
  transform: 'translateX(150%) scale(.5)',
}


const DayCards = (props: DayCardsProps): React.ReactElement => {
  const {currentDay, firstDay, onDayChange, lastDay} = props

  const previousDay = useMemo(() => subDays(currentDay, 1), [currentDay])
  const nextDay = useMemo(() => addDays(currentDay, 1), [currentDay])
  const handlePrevious = useCallback(
    (): void => onDayChange(previousDay),
    [previousDay, onDayChange],
  )
  const handleNext = useCallback(
    (): void => onDayChange(nextDay),
    [nextDay, onDayChange],
  )

  const twoDaysAgo = useMemo(() => subDays(currentDay, 2), [currentDay])
  const twoDaysAfter = useMemo(() => addDays(currentDay, 2), [currentDay])
  return <Swipeable
    onSwipedLeft={handleNext} onSwipedRight={handlePrevious} style={cardsContainerStyle}>
    <DayCard
      isHidden={true} date={twoDaysAgo}
      style={veryLeftCardStyle} key={twoDaysAgo.toDateString()} />
    <DayCard
      onClick={onDayChange} isHidden={currentDay <= lastDay} date={previousDay}
      style={leftCardStyle} key={previousDay.toDateString()} />
    <DayCard date={currentDay} key={currentDay.toDateString()} isMain={true} />
    <DayCard
      onClick={onDayChange} isHidden={nextDay > firstDay} date={nextDay}
      style={rightCardStyle} key={nextDay.toDateString()} />
    <DayCard
      onClick={onDayChange} isHidden={true} date={twoDaysAfter}
      style={veryRightCardStyle} key={twoDaysAfter.toDateString()} />
  </Swipeable>
}


const textDateNavContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  color: '#000',
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
  zIndex: 0,
}
const arrowButtonStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: '#fff',
  border: `solid 1px ${colors.MEDIUM_GREY}`,
  borderRadius: 55,
  cursor: 'pointer',
  display: 'flex',
  flex: 'none',
  height: 55,
  justifyContent: 'center',
  position: 'relative',
  transition,
  width: 55,
  zIndex: 1,
}
const hiddenArrowButtonStyle: React.CSSProperties = {
  ...arrowButtonStyle,
  opacity: 0,
  pointerEvents: 'none',
}
const dayTextContainerStyle: React.CSSProperties = {
  fontSize: 17,
  fontStyle: 'italic',
  fontWeight: 600,
  position: 'relative',
  textAlign: 'center',
  width: 145,
  zIndex: -1,
}
const currentDayTextStyle: React.CSSProperties = {
  alignItems: 'center',
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
  transition,
}
const previousDayTextStyle: React.CSSProperties = {
  ...currentDayTextStyle,
  opacity: 0,
  transform: 'translateX(-160px)',
}
const nextDayStyle: React.CSSProperties = {
  ...previousDayTextStyle,
  transform: 'translateX(160px)',
}


const TextDateNavBase = (props: DayCardsProps): React.ReactElement => {
  const {currentDay, firstDay, onDayChange, lastDay} = props
  const dateOption = useDateOption()

  const previousDay = useMemo(() => subDays(currentDay, 1), [currentDay])
  const nextDay = useMemo(() => addDays(currentDay, 1), [currentDay])
  const handlePrevious = useCallback(
    (): void => onDayChange(previousDay),
    [previousDay, onDayChange],
  )
  const handleNext = useCallback(
    (): void => onDayChange(nextDay),
    [nextDay, onDayChange],
  )
  const isPreviousHidden = currentDay <= lastDay
  const isNextHidden = nextDay > firstDay

  const currentDayText = formatRelative(currentDay, todayDate, dateOption)
  const previousDayText = formatRelative(previousDay, todayDate, dateOption)
  const nextDayText = formatRelative(nextDay, todayDate, dateOption)

  return <div style={textDateNavContainerStyle}>
    <div
      onClick={handlePrevious} style={isPreviousHidden ? hiddenArrowButtonStyle : arrowButtonStyle}>
      <ArrowLeftSLineIcon />
    </div>
    <div style={dayTextContainerStyle}>
      <div key={previousDayText} style={previousDayTextStyle}>
        {previousDayText}
      </div>
      <div key={currentDayText} style={currentDayTextStyle}>
        {currentDayText}
      </div>
      <div key={nextDayText} style={nextDayStyle}>
        {nextDayText}
      </div>
    </div>
    <div onClick={handleNext} style={isNextHidden ? hiddenArrowButtonStyle : arrowButtonStyle}>
      <ArrowRightSLineIcon />
    </div>
  </div>
}
const TextDateNav = React.memo(TextDateNavBase)


const Symptoms = (): React.ReactElement => {
  const {t} = useTranslation()
  const history = useHistory()
  const dispatch = useDispatch()
  const symptomsOnsetDate = useSymptomsOnsetDate()
  const [onsetDay, setOnsetDay] = useState<Date>((): Date =>
    startOfDay(symptomsOnsetDate || todayDate))

  const handleDayChange = useCallback((day: Date): void => {
    if (day < fartherDate || day > todayDate) {
      return
    }
    setOnsetDay(day)
  }, [])

  const handleButtonClick = useCallback((): void => {
    dispatch(saveSymptomsOnsetDate(onsetDay))
    history.push(Routes.CALENDAR)
  }, [dispatch, history, onsetDay])

  const headerStyle: React.CSSProperties = {
    fontSize: 25,
    fontWeight: 600,
    padding: '0 20px',
  }
  const subTextStyle: React.CSSProperties = {
    fontSize: 15,
    fontStyle: 'italic',
  }

  useFastForward(handleButtonClick)

  return <PageWithNav onNext={handleButtonClick} nextButton={t('Valider')}>
    <div style={{textAlign: 'center'}}>
      <Trans parent="h1" style={headerStyle}>À quand remontent vos premiers symptômes&nbsp;?</Trans>
      <Trans parent="p" style={subTextStyle}>(Toux, perte d'odorat et de goût, fièvre)</Trans>
    </div>
    <DayCards
      firstDay={todayDate} lastDay={fartherDate}
      onDayChange={handleDayChange} currentDay={onsetDay} />
    <TextDateNav
      firstDay={todayDate} lastDay={fartherDate}
      onDayChange={handleDayChange} currentDay={onsetDay} />
  </PageWithNav>
}
const MemoSymptoms = React.memo(Symptoms)

export {MemoSymptoms as Symptoms}
