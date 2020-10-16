import CalendarEventFillIcon from 'remixicon-react/CalendarEventFillIcon'
import ErrorWarningFillIcon from 'remixicon-react/ErrorWarningFillIcon'
import HeartFillIcon from 'remixicon-react/HeartFillIcon'
import Lock2FillIcon from 'remixicon-react/Lock2FillIcon'
import Message2FillIcon from 'remixicon-react/Message2FillIcon'
import UserAddFillIcon from 'remixicon-react/UserAddFillIcon'
import {RemixiconReactIconComponentType} from 'remixicon-react/dist/typings'
import React, {useCallback} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory, useLocation} from 'react-router'
import {Link} from 'react-router-dom'

import {useBackgroundColor} from 'hooks/background_color'
import {useFastForward} from 'hooks/fast_forward'
import {LocalizableString, prepareT} from 'store/i18n'
import {getPath} from 'store/url'

import BurgerMenu from 'components/burger_menu'
import {darkButtonStyle} from 'components/buttons'
import Slider, {SliderChildProps} from 'components/slider'
import {BottomDiv, PedagogyLayout, PedagogyPage} from 'components/navigation'


interface PageContent {
  icon: RemixiconReactIconComponentType
  subtitle: LocalizableString
  title: LocalizableString
}
const pagesContent: readonly PageContent[] = [
  {
    icon: CalendarEventFillIcon,
    subtitle: prepareT("On s'en occupe."),
    title: prepareT('Calculer votre période contagieuse'),
  },
  {
    icon: UserAddFillIcon,
    subtitle: prepareT('Sans tracking ni géolocalisation.'),
    title: prepareT('Lister les personnes croisées pendant cette période'),
  },
  {
    icon: Message2FillIcon,
    subtitle: prepareT('Anonymement ou non, à vous de voir.'),
    title: prepareT('Les prévenir pour briser la chaîne de contamination'),
  },
  {
    icon: Lock2FillIcon,
    subtitle: prepareT('Vous êtes anonyme de bout en bout.'),
    title: prepareT('Aucune donnée ne sort de votre téléphone'),
  },
] as const


const lastButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
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
    history.push(getPath('SYMPTOMS_ONSET', t))
  }, [goForward, history, isLastPage, t])
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
  marginBottom: 20,
}
const titleStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 28,
  fontWeight: 800,
}
const secondaryTitle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontWeight: 800,
}
const slideStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
}


const PedagogyIntroPage = (): React.ReactElement => {
  const history = useHistory()
  const {t, t: translate} = useTranslation()
  const {pathname} = useLocation()
  useBackgroundColor(pathname === getPath('PEDAGOGY_INTRO', t) ? undefined : colors.PALE_GREY)
  const gotoFirst = useCallback((): void => {
    history.push(`${getPath('PEDAGOGY_INTRO', t)}/0`)
  }, [history, t])
  const gotoNext = useCallback((): void => {
    history.push(getPath('SYMPTOMS_ONSET', t))
  }, [history, t])
  useFastForward(pathname === getPath('PEDAGOGY_INTRO', t) ? gotoFirst : undefined)
  if (pathname === getPath('PEDAGOGY_INTRO', t)) {
    return <PedagogyPage
      title={<Trans style={titleStyle}>
        Prêt(e) à <span style={{color: colors.SEAWEED}}>sauver des vies&nbsp;?</span>
      </Trans>}
      subtitle={t('Nous allons vous aider à contacter les personnes ' +
      'croisées pendant votre période contagieuse.')} icon={HeartFillIcon}
      iconColor={colors.BARBIE_PINK}>
      <BottomDiv>
        <div style={mobileOnDesktopStyle}>
          <Link to={`${getPath('PEDAGOGY_INTRO', t)}/0`} style={buttonStyle}>
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
    </PedagogyPage>
  }
  return <React.Fragment>
    <Slider
      bulletColor={colors.ALMOST_BLACK} bulletSelectColor={colors.MINTY_GREEN}
      arrowColor={colors.PALE_GREY} borderColor={colors.LIGHT_BLUE_GREY}
      chevronColor={colors.ALMOST_BLACK} bottomComponent={IntroButton} onFastForward={gotoNext}
      slideStyle={slideStyle}>
      {pagesContent.map(({icon, subtitle, title}, index): React.ReactElement =>
        <PedagogyLayout
          key={index} title={<span style={secondaryTitle}>{translate(title)}</span>}
          subtitle={translate(subtitle)} icon={icon}
          isDark={true} />)}
    </Slider>
    <BurgerMenu />
  </React.Fragment>
}


export default React.memo(PedagogyIntroPage)
