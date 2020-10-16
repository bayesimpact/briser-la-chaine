import {format as dateFormat, subDays} from 'date-fns'
import LightbulbFlashLineIcon from 'remixicon-react/LightbulbFlashLineIcon'
import React, {useMemo} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'

import {useFastForward} from 'hooks/fast_forward'
import {useSelector} from 'store/actions'
import {useDateOption} from 'store/i18n'
import {getPath} from 'store/url'

import {darkButtonStyle} from 'components/buttons'
import {BottomDiv, mobileOnDesktopStyle, PedagogyLayout} from 'components/navigation'
import TopBar from 'components/top_bar'


const todayDate = new Date()

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  margin: 'auto',
  maxWidth: 700,
  minHeight: window.innerHeight,
}
const buttonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  display: 'block',
  marginBottom: 20,
  ...mobileOnDesktopStyle,
}
const titleStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 22,
  fontWeight: 800,
  ...mobileOnDesktopStyle,
}
const MemoryIntroPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const dateOption = useDateOption()
  const contagiousPeriodEnd = useSelector(
    ({user: {contagiousPeriodEnd}}) => contagiousPeriodEnd || todayDate)
  const lastDateToReview = contagiousPeriodEnd < todayDate ? contagiousPeriodEnd : todayDate
  const contagiousPeriodStart = useSelector(
    ({user: {contagiousPeriodStart}}) => contagiousPeriodStart) || subDays(todayDate, 1)
  const startDate = useMemo(
    () => dateFormat(contagiousPeriodStart, t('theDateFormat'), dateOption),
    [contagiousPeriodStart, dateOption, t])
  const endDate = useMemo(
    () => dateFormat(lastDateToReview, t('theDateFormat'), dateOption),
    [lastDateToReview, dateOption, t])

  useFastForward(undefined, [], 'CONTACTS_SEARCH')
  const title = useMemo(() => <Trans style={titleStyle}>
    Prêt(e) à retrouver les personnes croisées entre
    le <span style={{color: colors.SEAWEED}}>{{startDate}} et le {{endDate}}</span>&nbsp;?
  </Trans>, [endDate, startDate])
  const subtitle = t('Nous allons vous poser des questions afin de stimuler votre mémoire.' +
    ' Laissez-vous guider\u00A0!')
  return <div style={pageStyle}>
    <TopBar progress={1} />
    <PedagogyLayout title={title} subtitle={subtitle} icon={LightbulbFlashLineIcon}>
      <BottomDiv>
        <div style={{margin: 20}}>
          <Link to={`${getPath('CONTACTS_SEARCH', t)}`} style={buttonStyle}>
            {t("J'ai compris")}
          </Link>
        </div>
      </BottomDiv>
    </PedagogyLayout>
  </div>
}

export default React.memo(MemoryIntroPage)
