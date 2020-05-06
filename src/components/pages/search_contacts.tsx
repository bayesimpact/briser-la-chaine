import {eachDayOfInterval, format as dateFormat, subDays} from 'date-fns'
import _chunk from 'lodash/chunk'
import React, {useCallback, useMemo, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'
import {Redirect, Link} from 'react-router-dom'
import CheckLineIcon from 'remixicon-react/CheckLineIcon'
import LockFillIcon from 'remixicon-react/LockFillIcon'
import UserFillIcon from 'remixicon-react/UserFillIcon'

import {useFastForward} from 'hooks/fast_forward'
import {useNumPeopleToAlert, useSelector, useSymptomsOnsetDate} from 'store/selections'
import {Routes} from 'store/url'
import {dateOption} from 'store/i18n'

import ContactsSearch from 'components/contacts_search'
import DrawerContainer from 'components/drawer_container'
import {darkButtonStyle} from 'components/buttons'
import {BottomDiv} from 'components/navigation'


interface DayCardProps {
  date: Date
  isHidden?: boolean
  onClick?: (day: Date) => void
  style?: React.CSSProperties
}


const contactCountStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  fontSize: 13,
  fontWeight: 'bold',
  justifyContent: 'center',
  marginTop: 10,
}


const DayCardBase = ({date, isHidden, onClick, style}: DayCardProps): React.ReactElement => {
  const contactCount = useSelector(
    ({contacts: {[date.toISOString()]: {contacts = []} = {}}}): number => contacts.length,
  )
  const isDayConfirmed = useSelector(
    ({contacts: {[date.toISOString()]: {isDayConfirmed = false} = {}}}): boolean => isDayConfirmed,
  )
  const isClickable = !!onClick
  const containerStyle: React.CSSProperties = useMemo(() => ({
    opacity: isHidden ? 0 : 1,
    ...style,
  }), [isHidden, style])
  const squareStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: isDayConfirmed ? colors.ICE_BLUE : colors.BRIGHT_SKY_BLUE,
    borderRadius: 30,
    color: isDayConfirmed ? colors.LIGHT_GREY_BLUE : '#fff',
    cursor: isClickable ? 'pointer' : undefined,
    display: 'flex',
    flexDirection: 'column',
    fontSize: 35,
    fontWeight: 800,
    height: 105,
    justifyContent: 'center',
    position: 'relative',
    transition: '450ms',
    width: 105,
  }
  const textStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 'bold',
  }
  const checkStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: colors.VIBRANT_GREEN,
    borderRadius: 30,
    bottom: 0,
    display: 'flex',
    height: 24,
    justifyContent: 'center',
    opacity: isDayConfirmed ? 1 : 0,
    position: 'absolute',
    right: 0,
    width: 24,
  }
  const weekDay = useMemo(() => dateFormat(date, 'EEE', dateOption), [date])
  const month = useMemo(() => dateFormat(date, 'MMMM', dateOption), [date])
  const handleClick = useCallback((): void => onClick?.(date), [date, onClick])
  return <div style={containerStyle} onClick={onClick && handleClick}>
    <div style={squareStyle} onClick={onClick && handleClick}>
      <span style={textStyle}>{weekDay || 'lundi'}</span>
      <span>{date.getDate()}</span>
      <span style={textStyle}>{month || 'mars'}</span>
      <div style={checkStyle}>
        <CheckLineIcon size={18} color="#fff" />
      </div>
    </div>
    <div style={contactCountStyle}>
      <UserFillIcon size={10} color={colors.PINKISH_GREY} />
      <div style={{backgroundColor: colors.PINKISH_GREY, height: 10, margin: '0 5px', width: 1}} />
      <span style={{paddingTop: 2}}>
        {contactCount}
      </span>
    </div>
  </div>
}
const DayCard = React.memo(DayCardBase)


interface DayProgressProps {
  numDays: number
  numDaysValidated: number
  style?: React.CSSProperties
}


const textStyle: React.CSSProperties = {
  fontStyle: 'italic',
  left: '50%',
  position: 'absolute',
  textAlign: 'center',
  top: '50%',
  transform: 'translate(-50%, -50%)',
}


const DayProgressBase = (props: DayProgressProps): React.ReactElement => {
  const {numDays, numDaysValidated, style} = props
  const {t} = useTranslation()
  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.ICE_BLUE,
    borderRadius: 20,
    height: 35,
    overflow: 'hidden',
    position: 'relative',
    // Stunt to enforce overflow hidden on Firefox.
    transform: 'scale(1)',
    ...style,
  }
  const progressStyle: React.CSSProperties = {
    backgroundColor: colors.BRIGHT_SKY_BLUE,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    transition: '200ms 500ms',
    width: `${Math.max(3, numDaysValidated * 100 / (numDays || 1))}%`,
  }
  return <div style={containerStyle}>
    <div style={progressStyle} />
    <div style={textStyle}>
      {t('{{numDaysValidated}}/{{count}} jour à vérifier', {count: numDays, numDaysValidated})}
    </div>
  </div>
}
const DayProgress = React.memo(DayProgressBase)


const todayDate = new Date()
// Max number of cards per line for contagious period screen.
const numMaxCardPerLine = 3


interface ContagiousPeriodLineProps {
  line: readonly Date[]
  onCardClick: (date: Date) => void
}

const cardStyle = {
  margin: '10px 5px',
} as const
const ContagiousPeriodLineBase = (props: ContagiousPeriodLineProps): React.ReactElement => {
  const {line, onCardClick} = props
  return <div style={{display: 'flex'}}>
    {new Array(numMaxCardPerLine).fill(undefined).map((unused, i: number) => <DayCard
      key={i} date={line[i] || todayDate} isHidden={!line[i]}
      onClick={line[i] && onCardClick} style={cardStyle} />)}
  </div>
}
const ContagiousPeriodLine = React.memo(ContagiousPeriodLineBase)


const dayProgressStyle: React.CSSProperties = {
  margin: '20px 0',
}
const bottomDivStyle: React.CSSProperties = {
  boxShadow: '0 0 15px 0 rgba(0, 0, 0, 0.15)',
}
const validateButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: colors.VIBRANT_GREEN,
}


const ContagiousPeriodBase = (): React.ReactElement => {
  const history = useHistory()
  const {t} = useTranslation()
  const [dateShown, setDateShown] = useState<Date|undefined>()
  const symptomsOnsetDate = useSymptomsOnsetDate()
  const firstSymptomsDate = symptomsOnsetDate || todayDate
  // TODO(sil): Get those from Redux.
  const contagiousStartDate = useMemo(
    (): Date => subDays(
      firstSymptomsDate, config.numDaysContagiousBeforeSymptoms), [firstSymptomsDate])
  const contagiousDays = useMemo((): Date[] => eachDayOfInterval(
    {end: todayDate, start: contagiousStartDate}), [contagiousStartDate])
  const contagiousDaysChunks = useMemo(
    (): Date[][] => _chunk(contagiousDays, numMaxCardPerLine), [contagiousDays])
  const handleCardClick = useCallback((date: Date) => setDateShown(date), [])
  const handleDetailClose = useCallback(() => setDateShown(undefined), [])
  const totalContactsCount = useNumPeopleToAlert()
  const numDaysValidated = useSelector(({contacts}): number =>
    contagiousDays.
      filter((day: Date): boolean => !!contacts[day.toISOString()]?.isDayConfirmed).
      length,
  )
  const areEveryDaysValidated = numDaysValidated === contagiousDays.length

  const firstDate = contagiousDaysChunks[0][0]
  useFastForward((): void => {
    if (dateShown) {
      handleDetailClose()
      return
    }
    if (totalContactsCount && areEveryDaysValidated) {
      history.push(Routes.MEMORY_OUTRO)
      return
    }
    handleCardClick(firstDate)
  }, [areEveryDaysValidated, dateShown, firstDate, handleCardClick, handleDetailClose,
    history, totalContactsCount])

  if (!symptomsOnsetDate) {
    return <Redirect to={Routes.SYMPTOMS_ONSET} />
  }

  const goToOutroStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
  }
  return <DrawerContainer
    drawer={dateShown && <ContactsSearch date={dateShown} onClose={handleDetailClose} />}
    isOpen={!!dateShown} onClose={handleDetailClose}>
    <div style={{padding: 20}}>
      <Trans parent="h1" style={{fontSize: 19, fontWeight: 'bold'}}>
        Retrouvez les personnes croisées pendant votre période contagieuse
      </Trans>
      <DayProgress
        numDays={contagiousDays.length} numDaysValidated={numDaysValidated}
        style={dayProgressStyle} />
      <div style={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
        {contagiousDaysChunks.map((chunk: Date[], index: number) => <ContagiousPeriodLine
          key={index} line={chunk} onCardClick={handleCardClick} />)}
      </div>
      <BottomDiv defaultHeight={0} style={bottomDivStyle}>
        {totalContactsCount && areEveryDaysValidated ? <div style={goToOutroStyle}>
          <Link style={validateButtonStyle} to={Routes.MEMORY_OUTRO}>
            {t('Prévenir mes {{count}} cas contacts', {count: totalContactsCount})}
          </Link>
          <div>
            <LockFillIcon size={12} />{' '}
            <Trans parent="span" style={{fontSize: 13}}>
              Nous n’enverrons rien sans <strong>votre autorisation</strong>
            </Trans>
          </div>
        </div> : null}
      </BottomDiv>
    </div>
  </DrawerContainer>
}
const ContagiousPeriod = React.memo(ContagiousPeriodBase)

export {ContagiousPeriod}
