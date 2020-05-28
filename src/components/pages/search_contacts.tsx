import {format as dateFormat} from 'date-fns'
import _chunk from 'lodash/chunk'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'
import {Redirect, Link} from 'react-router-dom'
import LightbulbFillIcon from 'remixicon-react/LightbulbFillIcon'
import CheckLineIcon from 'remixicon-react/CheckLineIcon'
import LockFillIcon from 'remixicon-react/LockFillIcon'
import UserFillIcon from 'remixicon-react/UserFillIcon'

import {useBackgroundColor} from 'hooks/background_color'
import {useFastForward} from 'hooks/fast_forward'
import {confirmContacts, openMemoryDayAction, useDispatch} from 'store/actions'
import {useDaysToValidate, useNumPeopleToAlert, useSelector,
  useSymptomsOnsetDate} from 'store/selections'
import {Routes} from 'store/url'
import {useDateOption} from 'store/i18n'

import BurgerMenu from 'components/burger_menu'
import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import ContactsSearch from 'components/contacts_search'
import DrawerContainer from 'components/drawer_container'
import {Modal} from 'components/modal'
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
  fontWeight: 600,
  justifyContent: 'center',
  marginTop: 22,
}


const DayCardBase = ({date, isHidden, onClick, style}: DayCardProps): React.ReactElement => {
  const dateOption = useDateOption()
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
  const squareContainerStyle: React.CSSProperties = {
    position: 'relative',
  }
  const squareStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    boxShadow: '0 11px 18px 0 rgba(60, 128, 209, 0.09)',
    color: '#000',
    cursor: isClickable ? 'pointer' : undefined,
    display: 'flex',
    flexDirection: 'column',
    height: 93,
    justifyContent: 'center',
    opacity: isDayConfirmed ? .5 : 1,
    transition: '450ms',
    width: 93,
  }
  const textStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
  }
  const bigTextStyle: React.CSSProperties = {
    fontFamily: 'Poppins',
    fontSize: 35,
    fontWeight: 800,
    margin: -12,
  }
  const checkStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: colors.MINTY_GREEN,
    borderRadius: 30,
    bottom: 1,
    display: 'flex',
    height: 34,
    justifyContent: 'center',
    opacity: isDayConfirmed ? 1 : 0,
    position: 'absolute',
    right: 1,
    width: 34,
  }
  const weekDay = useMemo(() => dateFormat(date, 'EEE', dateOption), [date, dateOption])
  const month = useMemo(() => dateFormat(date, 'MMMM', dateOption), [date, dateOption])
  const handleClick = useCallback((): void => onClick?.(date), [date, onClick])
  return <div style={containerStyle} onClick={onClick && handleClick}>
    <div style={squareContainerStyle}>
      <div style={squareStyle}>
        <span style={textStyle}>{weekDay || 'lundi'}</span>
        <span style={bigTextStyle}>{date.getDate()}</span>
        <span style={textStyle}>{month || 'mars'}</span>
      </div>
      <div style={checkStyle}>
        <CheckLineIcon size={18} color="#fff" />
      </div>
    </div>
    <div style={contactCountStyle}>
      <UserFillIcon size={13} color={colors.PINKISH_GREY} />
      <div style={{backgroundColor: colors.PINKISH_GREY, height: 13, margin: '0 5px', width: 1}} />
      <span style={{fontSize: 13, lineHeight: 1}}>
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


const progressContainerStyle: React.CSSProperties = {
  backgroundColor: 'rgb(212, 220, 231, .6)',
  borderRadius: 10,
  height: 12,
  overflow: 'hidden',
  position: 'relative',
  // Stunt to enforce overflow hidden on Firefox.
  transform: 'scale(1)',
}
const progressTextStyle: React.CSSProperties = {
  fontSize: 15,
  fontStyle: 'italic',
  marginTop: 15,
  textAlign: 'center',
}


const DayProgressBase = (props: DayProgressProps): React.ReactElement => {
  const {numDays, numDaysValidated, style} = props
  const {t} = useTranslation()
  const progressStyle: React.CSSProperties = {
    backgroundColor: colors.MINTY_GREEN,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    transition: '200ms 500ms',
    width: `${Math.max(3, numDaysValidated * 100 / (numDays || 1))}%`,
  }
  return <div style={style}>
    <div style={progressContainerStyle}>
      <div style={progressStyle} />
    </div>
    <div style={progressTextStyle}>
      {t('{{numDaysValidated}}/{{count}} jour à vérifier', {count: numDays, numDaysValidated})}
    </div>
  </div>
}
const DayProgress = React.memo(DayProgressBase)


interface NoContactModalProps {
  isShown: boolean
  onClose: () => void
  onValidate: () => void
}
const modalContainer: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: '30px 20px',
}
const modalTitle: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 600,
  marginBottom: 40,
  textAlign: 'center',
}
const noticeContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.PALE_GREY,
  borderRadius: 10,
  display: 'flex',
  fontSize: 13,
  justifyContent: 'center',
  padding: 20,
}
const NoContactModalBase = (props: NoContactModalProps): React.ReactElement => {
  const {onClose, onValidate} = props
  const {t} = useTranslation()
  return <Modal style={modalContainer} {...props}>
    <div style={modalTitle}>
      {t("Êtes vous sûr(e) de n'avoir croisé personne pendant cette période\u00A0?")}
    </div>
    <div>
      <div style={darkButtonStyle} onClick={onClose} >{t('Vérifier à nouveau')}</div>
      <div style={lightButtonStyle} onClick={onValidate}>{t("Passer à l'étape suivante")}</div>
    </div>
    <div style={noticeContainerStyle}>
      <LightbulbFillIcon size={21} />
      <span style={{marginLeft: 19}}>
        {t("Vous pourrez toujours ajouter des personnes à l'étape suivante")}
      </span>
    </div>
  </Modal>
}
const NoContactModal = React.memo(NoContactModalBase)

const todayDate = new Date()
// Max number of cards per line for contagious period screen.
const numMaxCardPerLine = 3


interface ContagiousPeriodLineProps {
  line: readonly Date[]
  onCardClick: (date: Date) => void
}

const cardStyle = {
  margin: '10px 9px',
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


const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 'normal',
}
const dayProgressStyle: React.CSSProperties = {
  margin: '20px 0',
}
const bottomDivStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '25px 25px 0 0',
  boxShadow: '0 0 15px 0 rgba(0, 0, 0, 0.15)',
}
const strongStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontWeight: 800,
}


const ContagiousPeriodBase = (): React.ReactElement => {
  const history = useHistory()
  const {t} = useTranslation()
  const [dateShown, setDateShown] = useState<Date|undefined>()
  const dispatch = useDispatch()
  const symptomsOnsetDate = useSymptomsOnsetDate()
  const contagiousDays = useDaysToValidate()
  const contagiousDaysChunks = useMemo(
    (): Date[][] => _chunk(contagiousDays, numMaxCardPerLine), [contagiousDays])
  const handleCardClick = useCallback((date: Date) => {
    dispatch(openMemoryDayAction)
    setDateShown(date)
  }, [dispatch])
  const handleDetailClose = useCallback(() => setDateShown(undefined), [])
  const totalContactsCount = useNumPeopleToAlert()
  const numDaysValidated = useSelector(({contacts}): number =>
    contagiousDays.
      filter((day: Date): boolean => !!contacts[day.toISOString()]?.isDayConfirmed).
      length,
  )
  const areEveryDaysValidated = numDaysValidated === contagiousDays.length
  const [isNoContactModalShown, setIsNoContactModalShown] =
    useState(areEveryDaysValidated && !totalContactsCount)
  const [isNoContactValidated, setIsNoContactValidated] = useState(false)
  const closeModal = useCallback(() => {
    setIsNoContactModalShown(false)
    setIsNoContactValidated(true)
  }, [])
  const validateNoContact = useCallback(() => {
    setIsNoContactValidated(true)
    setIsNoContactModalShown(false)
  }, [])

  const firstDate = contagiousDaysChunks[0][0]
  useEffect(() => {
    if (areEveryDaysValidated && !totalContactsCount && !isNoContactValidated) {
      setIsNoContactModalShown(true)
    }
  }, [areEveryDaysValidated, isNoContactValidated, totalContactsCount])

  const confirmAllDays = useCallback((): void => {
    dispatch(confirmContacts(totalContactsCount))
  }, [dispatch, totalContactsCount])

  useFastForward((): void => {
    if (dateShown) {
      handleDetailClose()
      return
    }
    if (totalContactsCount && areEveryDaysValidated) {
      confirmAllDays()
      history.push(Routes.MEMORY_OUTRO)
      return
    }
    handleCardClick(firstDate)
  }, [areEveryDaysValidated, confirmAllDays, dateShown, firstDate, handleCardClick,
    handleDetailClose, history, totalContactsCount])

  useBackgroundColor(symptomsOnsetDate ? colors.PALE_GREY : undefined)

  const validateButtonStyle: React.CSSProperties = useMemo((): React.CSSProperties => ({
    ...(isNoContactValidated ? lightButtonStyle : darkButtonStyle),
    margin: '0 0 12px 0',
  }), [isNoContactValidated])

  if (!symptomsOnsetDate) {
    return <Redirect to={Routes.SYMPTOMS_ONSET} />
  }

  const goToOutroStyle: React.CSSProperties = {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 20px 12px',
  }
  const bottomTextStyle: React.CSSProperties = {
    fontSize: 19,
    fontWeight: 600,
    paddingTop: 20,
    textAlign: 'center',
  }
  return <DrawerContainer
    drawer={dateShown && <ContactsSearch date={dateShown} onClose={handleDetailClose} />}
    isOpen={!!dateShown} onClose={handleDetailClose}>
    <BurgerMenu color="#000" />
    <NoContactModal
      isShown={isNoContactModalShown} onClose={closeModal} onValidate={validateNoContact} />
    <div style={{marginTop: 20, padding: 20}}>
      <Trans parent="h1" style={titleStyle}>
        Retrouvez <strong style={strongStyle}>les personnes croisées</strong> pendant votre période
        contagieuse
      </Trans>
      <DayProgress
        numDays={contagiousDays.length} numDaysValidated={numDaysValidated}
        style={dayProgressStyle} />
      <div style={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
        {contagiousDaysChunks.map((chunk: Date[], index: number) => <ContagiousPeriodLine
          key={index} line={chunk} onCardClick={handleCardClick} />)}
      </div>
      <BottomDiv defaultHeight={0} style={bottomDivStyle}>
        {isNoContactValidated ?
          <div style={bottomTextStyle}>
            {t("J'ai vérifié n'avoir croisé personne")}
          </div> : null}
        {areEveryDaysValidated && (isNoContactValidated || totalContactsCount) ?
          <div style={goToOutroStyle}>
            <Link style={validateButtonStyle} to={Routes.MEMORY_OUTRO} onClick={confirmAllDays}>
              {totalContactsCount ?
                t('Prévenir mes {{count}} cas contacts', {count: totalContactsCount}) :
                t("Passer à l'étape suivante")}
            </Link>
            <div>
              <LockFillIcon size={12} />{' '}
              <Trans parent="span" style={{fontSize: 13}}>
                Nous n'enverrons rien sans <strong>votre autorisation</strong>.
              </Trans>
            </div>
          </div> : null}
      </BottomDiv>
    </div>
  </DrawerContainer>
}
const ContagiousPeriod = React.memo(ContagiousPeriodBase)

export {ContagiousPeriod}
