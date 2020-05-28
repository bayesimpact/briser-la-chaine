import Storage from 'local-storage-fallback'
import LockFillIcon from 'remixicon-react/LockFillIcon'
import React, {useCallback, useEffect, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useLocation} from 'react-router'
import {Link} from 'react-router-dom'

import {parseQueryString} from 'analytics/parse'
import {useFastForward} from 'hooks/fast_forward'
import {useDefaultShareText} from 'hooks/share'
import {saveKnownRisk, useDispatch} from 'store/actions'
import {prepareT, IMAGE_NAMESPACE} from 'store/i18n'
import {Params, Routes} from 'store/url'

import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import FAQContent from 'components/faq_content'
import ShareButtons from 'components/share_buttons'

import logoImage from 'images/logo.svg'
import bayesLogoHorizontallImage from 'images/bayes-logo-horizontal.svg'
import calendarLineImage from 'images/calendar-line-icon.svg'
import cecileMonteilImage from 'images/cecile-monteil.png'
import jeremyZeggaghImage from 'images/jeremy-zeggagh.png'
import liemBinhLuongNguyenImage from 'images/liem-binh-luong-nguyen.png'
import mapCrossedImage from 'images/map-crossed-icon.svg'
import spyFillImage from 'images/spy-fill-icon.svg'


const isMobileVersion = window.outerWidth < 800
const desktopMaxWidth = 960
const mobileMaxWidth = 700

const riskyContactStyle: React.CSSProperties = {
  color: colors.BARBIE_PINK,
}
const lowRiskContactStyle: React.CSSProperties = {
  color: colors.BARBIE_PINK,
}
const discreetLink: React.CSSProperties = {
  color: 'inherit',
}
const bayesHorizontalLogoStyle: React.CSSProperties = {
  filter: 'grayscale(1) brightness(0)',
  height: 21.52, // 300 / 2370 * 170
  opacity: .3,
  width: 170,
}


const titles = {
  [Routes.HIGH_RISK_SPLASH]: {
    callToAction: prepareT('Que dois je faire\u00A0?'),
    desktopFontSize: 31,
    lineHeight: 1.35,
    mobileFontSize: 20,
    nextPage: Routes.DIAGNOSTIC,
    subtitle: prepareT('Même sans symptôme, vous êtes peut-être contagieux(se) aussi.'),
    title: <Trans parent={null}>
      Un(e) proche atteint(e) du {{diseaseName: config.diseaseName}} a indiqué vous
      avoir <span style={riskyContactStyle}>
        probablement contaminé(e)
      </span> pendant sa période contagieuse.
    </Trans>,
  },
  [Routes.MODERATE_RISK_SPLASH]: {
    callToAction: prepareT('Que dois je faire\u00A0?'),
    desktopFontSize: 31,
    lineHeight: 1.35,
    mobileFontSize: 20,
    nextPage: Routes.DIAGNOSTIC,
    subtitle: prepareT('Même sans symptôme, vous êtes peut-être contagieux(se) aussi.'),
    title: <Trans parent={null}>
      Un(e) proche atteint(e) du {{diseaseName: config.diseaseName}} a indiqué vous
      avoir <span style={lowRiskContactStyle}>
        peut-être contaminé(e)
      </span> pendant sa période contagieuse.
    </Trans>,
  },
  [Routes.DIAGNOSED_SPLASH]: {
    desktopFontSize: 57,
    nextPage: Routes.PEDAGOGY_INTRO,
    title: <Trans parent={null}>
      Votre situation peut relever d'un <span style={{whiteSpace: 'nowrap'}}>
        {{diseaseName: config.diseaseName}}
      </span>
    </Trans>,
  },
} as const


interface StepsSectionProps {
  callToAction: string
  style?: React.CSSProperties
  to: string
}


const StepsSectionBase = (props: StepsSectionProps): React.ReactElement => {
  const {callToAction, style, to} = props
  const {pathname} = useLocation()
  const {subtitle = prepareT(
    'Nous vous aidons à contacter les personnes croisées pendant votre période ' +
    'contagieuse en quelques minutes.',
  )} = titles[pathname] || {}
  const {t, t: translate} = useTranslation()
  const ctaButtonStyle: React.CSSProperties = {
    ...darkButtonStyle,
    display: 'block',
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: 800,
    margin: 'auto',
    maxWidth: 420,
  }
  const stepStyle: React.CSSProperties = {
    alignItems: 'center',
    color: colors.DARK_GREY_BLUE,
    display: 'flex',
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: 800,
  }
  const bulletStyle: React.CSSProperties = {
    backgroundColor: colors.MINTY_GREEN,
    borderRadius: 8,
    height: 8,
    marginRight: 26,
    width: 8,
  }
  const lineStyle: React.CSSProperties = {
    backgroundColor: colors.LIGHT_BLUE_GREY,
    height: 30,
    marginLeft: 4,
    width: 1,
  }
  return <div style={style}>
    <div>
      {translate(subtitle)}
    </div>
    <div style={{margin: '30px auto', maxWidth: 420}}>
      <div style={stepStyle}>
        <div style={bulletStyle} />
        {t('Analyse')}
      </div>
      <div style={lineStyle} />
      <div style={stepStyle}>
        <div style={bulletStyle} />
        {t('Prévention')}
      </div>
      <div style={lineStyle} />
      <div style={stepStyle}>
        <div style={bulletStyle} />
        {t('Action')}
      </div>
    </div>
    <Link to={to} style={ctaButtonStyle}>
      {callToAction}
    </Link>
  </div>
}
const StepsSection = React.memo(StepsSectionBase)


interface TitleProps {
  style?: React.CSSProperties
}


// NOTE: This is the top of our app and therefore the first text that we put here will be used by
// Google for its snippet. Make sure to order it as you think it should be.
const TitleBase = (props: TitleProps): React.ReactElement => {
  const {style} = props
  const {pathname} = useLocation()
  const {desktopFontSize = 60, lineHeight = 1.11, mobileFontSize = 38, title = undefined} =
    titles[pathname] || {}
  const titleStyle: React.CSSProperties = {
    fontFamily: 'Poppins',
    fontSize: isMobileVersion ? mobileFontSize : desktopFontSize,
    fontWeight: 800,
    lineHeight,
    margin: 0,
    ...style,
  }
  const {t, t: translate} = useTranslation()
  // FIXME(cyrille): Ensure the dimensions are OK.
  const localLogoImage = translate(logoImage, {ns: IMAGE_NAMESPACE})
  return <h1 style={titleStyle}>
    <img
      src={localLogoImage} alt={t('productName')} width={200}
      style={isMobileVersion ? {display: 'block', marginBottom: 30} : {display: 'none'}} />
    {title ? title : <Trans>
      Peut-être atteint(e) du <span style={{whiteSpace: 'nowrap'}}>
        {{diseaseName: config.diseaseName}}&nbsp;?
      </span>
    </Trans>}
    {isMobileVersion ? null : <React.Fragment>
      <img src={localLogoImage} alt="" style={{display: 'block', marginTop: 50, width: 285}} />
      <a
        href="https://www.bayesimpact.org" style={{display: 'flex', marginTop: 50}} target="_blank"
        rel="noopener noreferrer">
        <img src={bayesLogoHorizontallImage} alt="Bayes Impact" style={bayesHorizontalLogoStyle} />
      </a>
    </React.Fragment>}
  </h1>
}
const Title = React.memo(TitleBase)


interface NoticesProps {
  callToAction: string
  style?: React.CSSProperties
}


const NoticesBase = (props: NoticesProps): React.ReactElement => {
  const {callToAction, style} = props
  const {t} = useTranslation()
  const containerStyle: React.CSSProperties = {
    color: colors.GREYISH_BROWN,
    fontSize: 12,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 290,
    ...style,
  }
  return <div style={containerStyle}>
    <Trans style={{marginBottom: 15, textAlign: 'center'}}>
      En cliquant sur <strong>{{callToAction}}</strong> vous acceptez
      nos&nbsp;<a
        href={Routes.TERMS} style={discreetLink} target="_blank" rel="noopener noreferrer">
        Conditions Générales d'Utilisation
      </a>.
    </Trans>
    <div style={{alignItems: 'center', display: 'flex', justifyContent: 'center'}}>
      <LockFillIcon size={16} />
      <span style={{margin: '0 5px'}}>
        {t('Nous ne collectons aucune donnée.')}
      </span>
      <a href={Routes.PRIVACY} style={discreetLink} target="_blank" rel="noopener noreferrer">
        {t('En savoir plus')}
      </a>
    </div>
  </div>
}
const Notices = React.memo(NoticesBase)


function parseDepth(param?: string): number {
  if (!param) {
    return 0
  }
  const paramAsNumber = Number.parseInt(param, 10)
  if (Number.isNaN(paramAsNumber)) {
    return 0
  }
  return paramAsNumber
}


const LandingSectionBase = (): React.ReactElement => {
  const {t: translate} = useTranslation()

  const dispatch = useDispatch()
  const {pathname, search} = useLocation()
  const isModerateRisk = pathname === Routes.MODERATE_RISK_SPLASH
  const isDiagnosed = pathname === Routes.DIAGNOSED_SPLASH
  const isHighRisk = isDiagnosed || pathname === Routes.HIGH_RISK_SPLASH
  const hasRisk = isHighRisk || isModerateRisk
  const params = parseQueryString(search)
  const depth = parseDepth(params[Params.DEPTH]) + ((hasRisk && !isDiagnosed) ? 1 : 0)

  const {
    callToAction = prepareT('Commencer'),
    nextPage = Routes.HEALTH_STATUS,
  } = titles[pathname] || {}
  useEffect((): void => {
    if (!hasRisk) {
      return
    }
    dispatch(saveKnownRisk(depth))
  }, [depth, dispatch, hasRisk])

  useFastForward(undefined, undefined, nextPage)

  const translatedCallToAction = translate(callToAction)

  if (isMobileVersion) {
    return <section style={{borderTop: `solid 8px ${colors.MINTY_GREEN}`, padding: '45px 30px'}}>
      <Title />
      <div style={{marginTop: 30}}>
        <StepsSection callToAction={translatedCallToAction} to={nextPage} />
        <Notices style={{marginTop: 20}} callToAction={translatedCallToAction} />
      </div>
    </section>
  }

  const sectionStyle: React.CSSProperties = {
    padding: '80px 20px 30px',
    position: 'relative',
    zIndex: 0,
  }
  const halfBackgroundStyle: React.CSSProperties = {
    backgroundColor: colors.MINTY_GREEN,
    bottom: 0,
    left: '50%',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: -1,
  }
  const innerStepsSectionStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 35,
    padding: 35,
  }
  const contentStyle: React.CSSProperties = {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    margin: 'auto',
    maxWidth: desktopMaxWidth,
  }
  return <section style={sectionStyle}>
    <div style={contentStyle}>
      <Title style={{maxWidth: 450}} />
      <div style={{maxWidth: 385}}>
        <StepsSection
          style={innerStepsSectionStyle} callToAction={translatedCallToAction} to={nextPage} />
        <Notices style={{marginTop: 20}} callToAction={translatedCallToAction} />
      </div>
    </div>
    <div style={halfBackgroundStyle} />
  </section>
}
const LandingSection = React.memo(LandingSectionBase)


const featuresSectionStyle: React.CSSProperties = {
  backgroundColor: colors.PALE_GREY,
  color: '#000',
  padding: isMobileVersion ? '30px 35px' : '80px 20px',
}
const featuresTitleStyle: React.CSSProperties = {
  color: colors.BLACK,
  fontFamily: 'Poppins',
  fontSize: isMobileVersion ? 35 : 40,
  fontWeight: 800,
  lineHeight: 1.18,
  margin: '0 auto 50px',
  maxWidth: desktopMaxWidth,
  textAlign: isMobileVersion ? 'center' : 'left',
}
const featureCircleStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 40,
  boxShadow: '0 1px 10px 0 rgba(0, 0, 0, 0.16)',
  display: 'flex',
  flex: 'none',
  height: 110,
  justifyContent: 'center',
  width: 110,
}
const featuresContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: isMobileVersion ? 'column' : 'row',
  margin: 'auto',
  maxWidth: desktopMaxWidth,
}
const featureContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: 'none',
  marginBottom: isMobileVersion ? 40 : undefined,
  marginRight: isMobileVersion ? undefined : 'auto',
  paddingRight: isMobileVersion ? undefined : 10,
}
const reverseRowStyle: React.CSSProperties = isMobileVersion ? {
  flexDirection: 'row-reverse',
  justifyContent: 'space-between',
} : {}
const featureTextStyle: React.CSSProperties = {
  fontWeight: 600,
  maxWidth: 125,
}

const FeaturesSectionBase = (): React.ReactElement => {
  const {t} = useTranslation()
  return <section style={featuresSectionStyle}>
    <Trans parent="h2" style={featuresTitleStyle}>
      Un <span style={{color: colors.SEAWEED}}>geste civique</span>,<br />
      en quelques clics
    </Trans>
    <div style={featuresContainerStyle}>
      <div style={featureContainerStyle}>
        <div style={featureCircleStyle}>
          <img src={calendarLineImage} alt="" />
        </div>
        <div style={{flex: 'none', width: 25}} />
        <div style={featureTextStyle}>
          {t('Basé sur votre mémoire')}
        </div>
      </div>
      <div style={{...featureContainerStyle, ...reverseRowStyle}}>
        <div style={featureCircleStyle}>
          <img src={mapCrossedImage} alt="" />
        </div>
        <div style={{flex: 'none', width: 25}} />
        <Trans style={featureTextStyle}>
          Sans traçage<br />ni géolocalisation
        </Trans>
      </div>
      <div style={featureContainerStyle}>
        <div style={featureCircleStyle}>
          <img src={spyFillImage} alt="" />
        </div>
        <div style={{flex: 'none', width: 25}} />
        <Trans style={featureTextStyle}>
          Notification anonyme<br />ou personnelle
        </Trans>
      </div>
    </div>
  </section>
}
const FeaturesSection = React.memo(FeaturesSectionBase)

const sectionStyle: React.CSSProperties = {
  padding: isMobileVersion ? '60px 30px 70px' : '80px 20px',
}
const recommendedSectionStyle: React.CSSProperties = {
  backgroundColor: '#000',
  color: '#fff',
  ...sectionStyle,
}
const doctorsSectionContentStyle: React.CSSProperties = isMobileVersion ? {} : {
  display: 'flex',
  margin: 'auto',
  maxWidth: desktopMaxWidth,
}
const recommendedTitleStyle: React.CSSProperties = {
  flex: 1,
  fontFamily: 'Poppins',
  fontSize: isMobileVersion ? 35 : 40,
  fontWeight: 800,
  lineHeight: 1.14,
  marginBottom: isMobileVersion ? undefined : 50,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: 0,
  maxWidth: desktopMaxWidth,
}
const recommendationStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: isMobileVersion ? 'row' : 'column-reverse',
  justifyContent: isMobileVersion ? 'space-between' : 'flex-end',
  marginTop: isMobileVersion ? 50 : 0,
}
const doctorNameStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 20,
  fontWeight: 800,
  lineHeight: 1.2,
  marginTop: isMobileVersion ? 0 : 33,
}
const doctorPhotoStyle: React.CSSProperties = {
  borderRadius: 40,
  height: 110,
  marginLeft: isMobileVersion ? 25 : undefined,
  width: 110,
}


const DoctorsSectionBase = (): React.ReactElement => {
  // This is only to make sure this component gets updated if the language changes.
  useTranslation()
  return <section style={recommendedSectionStyle}>
    <Trans parent="h2" style={recommendedTitleStyle}>
      Créé en <span style={{color: colors.MINTY_GREEN}}>collaboration</span><br />
      avec&nbsp;des médecins
    </Trans>
    <div style={doctorsSectionContentStyle}>
      <div style={recommendationStyle}>
        <div style={isMobileVersion ? {} : {maxWidth: 250}}>
          <h3 style={doctorNameStyle}>
            D<sup>r</sup> Jérémy <div style={{color: colors.BARBIE_PINK}}>Zeggagh</div>
          </h3>
          <Trans>
            Médecin spécialisé en maladies infectieuses,<br />
            Hôpital&nbsp;Saint-Louis, APHP
          </Trans>
        </div>
        <img style={doctorPhotoStyle} alt="" src={jeremyZeggaghImage} />
      </div>
      <div style={recommendationStyle}>
        <div style={isMobileVersion ? {} : {maxWidth: 250}}>
          <h3 style={doctorNameStyle}>
            D<sup>r</sup> Cécile <div style={{color: colors.BARBIE_PINK}}>Monteil</div>
          </h3>
          <Trans>
            Médecin urgentiste pédiatre et experte en e-santé,<br />
            Hôpital&nbsp;Robert&nbsp;Debré, APHP
          </Trans>
        </div>
        <img style={doctorPhotoStyle} alt="" src={cecileMonteilImage} />
      </div>
      <div style={recommendationStyle}>
        <div style={isMobileVersion ? {} : {maxWidth: 250}}>
          <h3 style={doctorNameStyle}>
            D<sup>r</sup> Liem Binh <div style={{color: colors.BARBIE_PINK}}>Luong Nguyen</div>
          </h3>
          <Trans>
            Médecin spécialisé en maladies infectieuses,<br />
            Centre de Vaccinologie,<br />
            Hôpital&nbsp;Cochin, APHP
          </Trans>
        </div>
        <img style={doctorPhotoStyle} alt="" src={liemBinhLuongNguyenImage} />
      </div>
    </div>
  </section>
}
const DoctorsSection = React.memo(DoctorsSectionBase)


const FAQSectionBase = (): React.ReactElement => {
  return <section style={sectionStyle}>
    <div style={doctorsSectionContentStyle}>
      <FAQContent isMobileVersion={isMobileVersion} />
    </div>
  </section>
}
const FAQSection = React.memo(FAQSectionBase)


const shareSectionStyle: React.CSSProperties = {
  alignItems: isMobileVersion ? undefined : 'center',
  borderTop: `solid 2px ${colors.MINTY_GREEN}`,
  display: 'flex',
  flexDirection: isMobileVersion ? 'column' : 'row',
  margin: 'auto',
  maxWidth: desktopMaxWidth,
  padding: isMobileVersion ? '60px 0' : '80px 0',
}
const shareTitleStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 40,
  fontWeight: 800,
  lineHeight: isMobileVersion ? 1 : 1.15,
}
const shareButtonStyle: React.CSSProperties = {
  background: undefined,
  backgroundColor: '#fff',
  border: `solid 1px ${colors.SMOKEY_GREY}`,
  borderRadius: 60,
  color: '#000',
  height: 60,
  marginRight: 20,
  width: 60,
}


const ShareSectionBase = (): React.ReactElement => {
  const text = useDefaultShareText()
  return <section style={{padding: '0 30px'}}>
    <div style={shareSectionStyle}>
      <Trans parent="h2" style={shareTitleStyle}>
        À partager<br />
        <span style={{color: colors.MINTY_GREEN}}>sans gêne</span>
      </Trans>
      <div style={{flex: 1}} />
      <ShareButtons sharedText={text} buttonStyle={shareButtonStyle} />
    </div>
  </section>
}
const ShareSection = React.memo(ShareSectionBase)


const footerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  color: colors.GREY,
  padding: isMobileVersion ? '65px 30px 50px' : '80px 20px 20px',
}
const footerMenuStyle: React.CSSProperties = {
  alignItems: isMobileVersion ? undefined : 'center',
  display: 'flex',
  flexDirection: isMobileVersion ? 'column' : undefined,
  marginBottom: isMobileVersion ? 60 : 80,
}
const footerLogoStyle: React.CSSProperties = {
  display: 'block',
  filter: 'grayscale(1) brightness(100)',
  height: 35,
  marginBottom: 10,
}
const footerLinkStyle: React.CSSProperties = {
  color: '#fff',
  fontWeight: 600,
  margin: '10px 0',
  padding: '10px 20px 10px 0',
  textDecoration: 'none',
}
const finalFooterStyle: React.CSSProperties = {
  borderTop: 'solid 2px rgba(255, 255, 255, .1)',
  fontSize: isMobileVersion ? undefined : 13,
  paddingTop: 14,
}
const emFooterStyle: React.CSSProperties = {
  color: '#fff',
}


const FooterBase = (): React.ReactElement => {
  const {t} = useTranslation()
  return <footer style={footerStyle}>
    <div style={{margin: '0 auto', maxWidth: desktopMaxWidth}}>
      <div style={footerMenuStyle}>
        <div>
          <a href="https://www.bayesimpact.org" target="_blank" rel="noopener noreferrer">
            <img src={bayesLogoHorizontallImage} alt="Bayes Impact" style={footerLogoStyle} />
          </a>
          {t('Un service public citoyen développé par Bayes Impact')}
        </div>
        <div style={{flex: 1, minHeight: 50}} />
        <a
          href="mailto:contact@briserlachaine.org" style={footerLinkStyle} target="_blank"
          rel="noopener noreferrer">
          {t('Contact')}
        </a>
        <a href={Routes.TERMS} style={footerLinkStyle} target="_blank" rel="noopener noreferrer">
          {t('CGU')}
        </a>
        <a href={Routes.PRIVACY} style={footerLinkStyle} target="_blank" rel="noopener noreferrer">
          {t('Vie privée')}
        </a>
        <a
          href="https://www.bayesimpact.org" style={footerLinkStyle} target="_blank"
          rel="noopener noreferrer">
          {t('Qui sommes nous\u00A0?')}
        </a>
      </div>
      <Trans style={finalFooterStyle}>
        Ce site a été développé par <span style={emFooterStyle}>Bayes Impact</span>, une association
        loi 1901 dont la mission est de développer des <span style={emFooterStyle}>services publics
        citoyens</span>.
      </Trans>
    </div>
  </footer>
}
const Footer = React.memo(FooterBase)


function isTimestampInCookieBeforeNow(cookieName: string): boolean {
  const cookieValue = Storage.getItem(cookieName)
  if (!cookieValue) {
    return false
  }
  return new Date(Number.parseInt(cookieValue)) > new Date()
}


const cookieBannerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 30,
  bottom: 0,
  boxShadow: '0 0 20px 0 rgba(60, 128, 209, 0.3)',
  fontSize: 14,
  left: 0,
  margin: 20,
  maxWidth: isMobileVersion ? undefined : 255,
  padding: 25,
  position: 'fixed',
  right: isMobileVersion ? 0 : undefined,
}
const cookieBannerTitleStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 20,
  fontWeight: 800,
  lineHeight: 1.24,
  marginBottom: 20,
  textAlign: 'center',
}
const cookieBannerListItemStyle: React.CSSProperties = {
  margin: '10px 0 10px 15px',
  position: 'relative',
}
const cookieBannerBulletStyle: React.CSSProperties = {
  backgroundColor: colors.MINTY_GREEN,
  borderRadius: 5,
  display: 'inline-block',
  height: 5,
  margin: '4px 8px',
  position: 'absolute',
  right: '100%',
  top: 0,
  width: 5,
}
const cookieBannerButtonStyle: React.CSSProperties = {
  ...lightButtonStyle,
  border: `solid 1px ${colors.LIGHT_BLUE_GREY}`,
  color: 'inherit',
  fontFamily: 'Poppins',
  fontSize: 13,
  fontWeight: 800,
  marginTop: 25,
}
const cookieBannerLinkStyle: React.CSSProperties = {
  color: 'inherit',
  display: 'block',
  textAlign: 'center',
  textDecoration: 'none',
}


// Name of the cookie to accept cookies.
const ACCEPT_COOKIES_COOKIE_NAME = 'accept-cookies'


const CookieBannerBase = (): React.ReactElement|null => {
  const {t} = useTranslation()
  const [isShown, setIsShown] = useState(
    (): boolean => !isTimestampInCookieBeforeNow(ACCEPT_COOKIES_COOKIE_NAME),
  )
  const hide = useCallback((): void => {
    setIsShown(false)
    // 604800000 is the number of milliseconds in a week.
    Storage.setItem(ACCEPT_COOKIES_COOKIE_NAME, (new Date().getTime() + 604800000) + '')
  }, [])
  if (!isShown) {
    return null
  }
  return <div style={cookieBannerStyle}>
    <Trans style={cookieBannerTitleStyle}>
      Votre vie privée est notre priorité
    </Trans>
    <ul style={{listStyle: 'none', padding: 0}}>
      <li style={cookieBannerListItemStyle}>
        <span style={cookieBannerBulletStyle} />
        {t('Nous ne collectons aucune donnée personnelle')}
      </li>
      <li style={cookieBannerListItemStyle}>
        <span style={cookieBannerBulletStyle} />
        {t('Nous ne collectons aucune donnée de santé')}
      </li>
      <li style={cookieBannerListItemStyle}>
        <span style={cookieBannerBulletStyle} />
        {t('Tout ce que vous renseignez sur le site reste sur votre appareil')}
      </li>
      <li style={cookieBannerListItemStyle}>
        <span style={cookieBannerBulletStyle} />
        {t(
          "Nous utilisons des cookies de navigation pour améliorer l'expérience utilisateur et " +
          'aider les gens à briser les chaînes de contamination',
        )}
      </li>
    </ul>
    <div onClick={hide} style={cookieBannerButtonStyle}>{t("J'ai compris")}</div>
    <Link to={Routes.PRIVACY} style={cookieBannerLinkStyle}>
      {t('Politique de confidentialité')}
    </Link>
  </div>
}
const CookieBanner = React.memo(CookieBannerBase)


// This is a top level page and should never be nested in another one.
// TOP LEVEL PAGE
const SplashPage = (): React.ReactElement => {
  return <React.Fragment>
    {isMobileVersion ? <div style={{margin: '0 auto', maxWidth: mobileMaxWidth}}>
      <LandingSection />
      <FeaturesSection />
      <DoctorsSection />
    </div> : <React.Fragment>
      <LandingSection />
      <FeaturesSection />
      <DoctorsSection />
    </React.Fragment>}
    <FAQSection />
    <ShareSection />
    <Footer />
    <CookieBanner />
  </React.Fragment>
}


export default React.memo(SplashPage)
