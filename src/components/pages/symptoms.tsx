import {formatRelative, startOfDay, subDays} from 'date-fns'
import React, {useCallback, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import DatePicker from 'react-datepicker'
import {useHistory} from 'react-router'
import CalendarEventFillIcon from 'remixicon-react/CalendarEventFillIcon'

import {useFastForward} from 'hooks/fast_forward'
import {saveSymptomsOnsetDate, useDispatch} from 'store/actions'
import {useDateOption} from 'store/i18n'
import {useSymptomsOnsetDate} from 'store/selections'
import {getPath} from 'store/url'

import {PageWithNav} from 'components/navigation'

import 'react-datepicker/dist/react-datepicker.css'


const todayDate = startOfDay(new Date())
const fartherDate = subDays(todayDate, 30)


interface DateButtonProps {
  day: Date
  isInvalid?: boolean
  onClick?: () => void
  value?: string
}


const dateButtonStyle: React.CSSProperties = {
  alignItems: 'center',
  border: `solid 0.5px ${colors.LIGHT_BLUE_GREY}`,
  borderRadius: 23,
  boxShadow: '0 12px 19px 0 rgba(60, 128, 209, 0.09)',
  cursor: 'pointer',
  display: 'flex',
  fontWeight: 600,
  margin: '0 -10px',
  padding: '15px 20px',
}
const dateInvalidButtonStyle: React.CSSProperties = {
  ...dateButtonStyle,
  border: `solid 2px ${colors.BARBIE_PINK}`,
}
const DateButtonBase = (props: DateButtonProps): React.ReactElement => {
  const {day, isInvalid, onClick, value} = props
  const dateOption = useDateOption()
  const relative = formatRelative(day, todayDate, dateOption)
  const style = isInvalid ? dateInvalidButtonStyle : dateButtonStyle
  return <div onClick={onClick} style={style}>
    <CalendarEventFillIcon style={{marginRight: 20}} />
    <span style={{marginRight: '.5em'}}>{value}</span>
    <span style={{color: colors.GREYISH_BROWN, fontStyle: 'italic', fontWeight: 'normal'}}>
      ({relative})
    </span>
  </div>
}
const DateButton = React.memo(DateButtonBase)


const Symptoms = (): React.ReactElement => {
  const {t} = useTranslation()
  const history = useHistory()
  const dispatch = useDispatch()
  const dateOption = useDateOption()
  const symptomsOnsetDate = useSymptomsOnsetDate()
  const [onsetDay, setOnsetDay] = useState<Date>((): Date =>
    startOfDay(symptomsOnsetDate || todayDate))
  const [isValidDay, setIsValidDay] = useState(true)
  const [isValidated, setIsValidated] = useState(false)

  const handleDayChange = useCallback((day: Date): void => {
    if (day < fartherDate || day > todayDate) {
      setIsValidDay(false)
      return
    }
    setIsValidDay(true)
    setOnsetDay(day)
  }, [])

  const handleButtonClick = useCallback((): void => {
    if (!isValidDay) {
      setIsValidated(true)
      return
    }
    dispatch(saveSymptomsOnsetDate(onsetDay))
    history.push(getPath('CALENDAR', t))
  }, [dispatch, history, isValidDay, onsetDay, t])

  const titleStyle: React.CSSProperties = {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: 800,
    marginTop: 30,
  }
  const strongStyle: React.CSSProperties = {
    color: colors.BARBIE_PINK,
  }

  // TODO(pascal): Maybe use native input on mobile.

  useFastForward(handleButtonClick)

  return <PageWithNav onNext={handleButtonClick} nextButton={t('Valider')}>
    <div style={{alignSelf: 'flex-start', marginBottom: 'auto'}}>
      <Trans style={titleStyle}>
        Retrouvons les personnes croisées pendant votre <strong style={strongStyle}>
          période contagieuse
        </strong>.
      </Trans>
      <div style={{marginTop: 10}}>{t('Sans tracking, ni géolocalisation.')}</div>
      <Trans parent="h1" style={titleStyle}>À quand remontent vos premiers symptômes&nbsp;?</Trans>
      <DatePicker
        selected={onsetDay} onChange={handleDayChange} minDate={fartherDate} maxDate={todayDate}
        locale={dateOption.locale}
        customInput={<DateButton day={onsetDay} isInvalid={isValidated && !isValidDay} />}
        dateFormat="d MMMM" />
    </div>
  </PageWithNav>
}


export default React.memo(Symptoms)
