import CalendarEventLineIcon from 'remixicon-react/CalendarEventLineIcon'
import ListOrderedIcon from 'remixicon-react/ListOrderedIcon'
import ErrorWarningFillIcon from 'remixicon-react/ErrorWarningFillIcon'
import FeedbackLineIcon from 'remixicon-react/FeedbackLineIcon'
import HeartFillIcon from 'remixicon-react/HeartFillIcon'
import Lock2FillIcon from 'remixicon-react/Lock2FillIcon'
import {RemixiconReactIconComponentType} from 'remixicon-react/dist/typings'
import React, {useCallback} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory, useLocation} from 'react-router'
import {Link} from 'react-router-dom'

import {useBackgroundColor} from 'hooks/background_color'
import {useFastForward} from 'hooks/fast_forward'
import {LocalizableString, prepareT} from 'store/i18n'
import {Routes} from 'store/url'

import {darkButtonStyle} from 'components/buttons'
import Slider, {SliderChildProps} from 'components/slider'
import {BottomDiv, PedagogyLayout} from 'components/navigation'


interface PageContent {
  icon: RemixiconReactIconComponentType
  subtitle: LocalizableString
  title: LocalizableString
}
const pagesContent: readonly PageContent[] = [
  {
    icon: CalendarEventLineIcon,
    subtitle: prepareT("On s'en occupe."),
    title: prepareT('Calculer votre période contagieuse'),
  },
  {
    icon: ListOrderedIcon,
    subtitle: prepareT('Sans tracking ni géolocalisation.'),
    title: prepareT('Lister les personnes croisées pendant cette période'),
  },
  {
    icon: FeedbackLineIcon,
    subtitle: prepareT('Anonymement ou non, à vous de voir.'),
    title: prepareT('Les prévenir pour briser la chaîne de contamination'),
  },
  {
    icon: Lock2FillIcon,
    subtitle: prepareT('Vous êtes anonyme de bout en bout'),
    title: prepareT('Aucune donnée ne sort de votre téléphone'),
  },
] as const


const lastButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: '#fff',
  color: colors.BRIGHT_SKY_BLUE,
  margin: 20,
  transition: '1s',
}
const nextButtonStyle: React.CSSProperties = {
  ...lastButtonStyle,
  opacity: 0,
  pointerEvents: 'none',
}


const IntroButtonBase = (props: SliderChildProps): React.ReactElement => {
  const {isLastPage, goForward} = props
  const {t} = useTranslation()
  const history = useHistory()
  const handleButtonClick = useCallback((): void => {
    if (!isLastPage) {
      goForward()
      return
    }
    history.push(Routes.PEDAGOGY_OUTRO)
  }, [goForward, history, isLastPage])
  return <div onClick={handleButtonClick} style={isLastPage ? lastButtonStyle : nextButtonStyle}>
    {t('Commencer')}
  </div>
}
const IntroButton = React.memo(IntroButtonBase)


const alertBottomDivStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.WHITE_TWO,
  display: 'flex',
  fontSize: 13,
  justifyContent: 'center',
  padding: '20px 70px',
  textAlign: 'left',
}


const mobileOnDesktopStyle: React.CSSProperties = {
  margin: 'auto',
  maxWidth: 420,
  padding: '0 20px',
}

const warningIconStyle: React.CSSProperties = {
  flex: 'none',
  marginRight: 15,
}


const buttonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  display: 'block',
}


const PedagogyIntroPage = (): React.ReactElement => {
  const history = useHistory()
  const {t, t: translate} = useTranslation()
  const {pathname} = useLocation()
  useBackgroundColor(pathname === Routes.PEDAGOGY_INTRO ? undefined : colors.BRIGHT_SKY_BLUE)
  const gotoFirst = useCallback((): void => {
    history.push(`${Routes.PEDAGOGY_INTRO}/0`)
  }, [history])
  const gotoNext = useCallback((): void => {
    history.push(Routes.PEDAGOGY_OUTRO)
  }, [history])
  useFastForward(pathname === Routes.PEDAGOGY_INTRO ? gotoFirst : undefined)
  if (pathname === Routes.PEDAGOGY_INTRO) {
    return <PedagogyLayout
      title={<Trans>
        Prêt(e) à <span style={{color: colors.BRIGHT_SKY_BLUE}}>sauver des vies&nbsp;?</span>
      </Trans>}
      subtitle={t('Nous allons vous aider à contacter les personnes ' +
      'croisées pendant votre période contagieuse.')} icon={HeartFillIcon}>
      <BottomDiv>
        <div style={mobileOnDesktopStyle}>
          <Link to={`${Routes.PEDAGOGY_INTRO}/0`} style={buttonStyle}>
            {t("C'est parti")}
          </Link>
        </div>
        <div style={alertBottomDivStyle}>
          <ErrorWarningFillIcon style={warningIconStyle} />
          <Trans>
            En cas de difficultés respiratoires, contactez le 15 <strong>immédiatement</strong>
          </Trans>
        </div>
      </BottomDiv>
    </PedagogyLayout>
  }
  return <Slider
    bottomComponent={IntroButton} bulletColor={colors.AZURE} arrowColor={colors.BRIGHT_SKY_BLUE}
    bulletSelectColor="#fff" borderColor={colors.AZURE} onFastForward={gotoNext}>
    {pagesContent.map(({icon, subtitle, title}, index): React.ReactElement =>
      <PedagogyLayout
        key={index} title={translate(title)} subtitle={translate(subtitle)} icon={icon}
        isDark={true} />)}
  </Slider>
}


export default React.memo(PedagogyIntroPage)
