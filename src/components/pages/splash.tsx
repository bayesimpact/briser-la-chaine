import LockFillIcon from 'remixicon-react/LockFillIcon'
import React, {useEffect} from 'react'
import ReactMarkdown from 'react-markdown'
import {Trans, useTranslation} from 'react-i18next'
import {useLocation} from 'react-router'
import {Link} from 'react-router-dom'

import {useFastForward} from 'hooks/fast_forward'
import {useDefaultShareText} from 'hooks/share'
import {saveKnownRisk, useDispatch} from 'store/actions'
import {Routes} from 'store/url'

import {darkButtonStyle} from 'components/buttons'
import ShareButtons from 'components/share_buttons'
import logoImage from 'images/logo.svg'
import bayesLogoHorizontallImage from 'images/bayes-logo-horizontal.svg'
import calendarLineImage from 'images/calendar-line-icon.svg'
import cecileMonteilImage from 'images/cecile-monteil.png'
import jeremyZeggaghImage from 'images/jeremy-zeggagh.png'
import liemBinhLuongNguyenImage from 'images/liem-binh-luong-nguyen.png'
import mapCrossedImage from 'images/map-crossed-icon.svg'
import spyFillImage from 'images/spy-fill-icon.svg'

import faqContent from './faq.txt'


const isMobileVersion = window.outerWidth < 800
const desktopMaxWidth = 960
const mobileMaxWidth = 700

const riskyContactStyle: React.CSSProperties = {
  color: colors.STRONG_PINK,
}
const lowRiskContactStyle: React.CSSProperties = {
  color: colors.STRONG_PINK,
}
const discreetLink: React.CSSProperties = {
  color: 'inherit',
}
const bayesHorizontalLogoStyle: React.CSSProperties = {
  filter: 'grayscale(1) brightness(0)',
  opacity: .3,
  width: 170,
}


interface StepsSectionProps {
  callToAction: string
  hasRisk: boolean
  style?: React.CSSProperties
  to: string
}


const StepsSectionBase = (props: StepsSectionProps): React.ReactElement => {
  const {callToAction, hasRisk, style, to} = props
  const {t} = useTranslation()
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
      {hasRisk ?
        t('Même sans symptôme, vous êtes peut-être contagieux(se) aussi.') :
        t(
          'Nous vous aidons à contacter les personnes croisées pendant votre période ' +
          'contagieuse en quelques minutes.',
        )}
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
  isModerateRisk: boolean
  isHighRisk: boolean
  style?: React.CSSProperties
}


// NOTE: This is the top of our app and therefore the first text that we put here will be used by
// Google for its snippet. Make sure to order it as you think it should be.
const TitleBase = (props: TitleProps): React.ReactElement => {
  const {isModerateRisk, isHighRisk, style} = props
  const hasRisk = isModerateRisk || isHighRisk
  const titleStyle: React.CSSProperties = {
    fontFamily: 'Poppins',
    fontSize: isMobileVersion ? hasRisk ? 20 : 38 : hasRisk ? 31 : 60,
    fontWeight: 800,
    lineHeight: hasRisk ? 1.35 : 1.11,
    margin: 0,
    ...style,
  }
  return <h1 style={titleStyle}>
    <img
      src={logoImage} alt={config.productName} width={200}
      style={isMobileVersion ? {display: 'block', marginBottom: 30} : {display: 'none'}} />
    {isHighRisk ? <Trans parent={null}>
      Un(e) proche atteint(e) du COVID-19 a indiqué vous
      avoir <span style={riskyContactStyle}>
        probablement contaminé(e)
      </span> pendant sa période contagieuse.
    </Trans> : isModerateRisk ? <Trans parent={null}>
      Un(e) proche atteint(e) du COVID-19 a indiqué vous
      avoir <span style={lowRiskContactStyle}>
        peut-être contaminé(e)
      </span> pendant sa période contagieuse.
    </Trans> : <Trans>
      Peut-être atteint(e) du <span style={{whiteSpace: 'nowrap'}}>COVID-19&nbsp;?</span>
    </Trans>}
    {isMobileVersion ? null : <React.Fragment>
      <img src={logoImage} alt="" style={{display: 'block', marginTop: 50, width: 285}} />
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


const LandingSectionBase = (): React.ReactElement => {
  const {t} = useTranslation()

  const dispatch = useDispatch()
  const {pathname} = useLocation()
  const isModerateRisk = pathname === Routes.MODERATE_RISK_SPLASH
  const isHighRisk = pathname === Routes.HIGH_RISK_SPLASH
  const hasRisk = isHighRisk || isModerateRisk

  useEffect((): void => {
    if (!hasRisk) {
      return
    }
    dispatch(saveKnownRisk)
  }, [dispatch, hasRisk])

  useFastForward(undefined, undefined, hasRisk ? Routes.DIAGNOSTIC : Routes.HEALTH_STATUS)

  const callToAction = hasRisk ?
    t('Que dois je faire\u00A0?') : t('Briser la chaîne')
  const nextPage = hasRisk ? Routes.DIAGNOSTIC : Routes.HEALTH_STATUS

  if (isMobileVersion) {
    return <section style={{borderTop: `solid 8px ${colors.MINTY_GREEN}`, padding: '45px 30px'}}>
      <Title isModerateRisk={isModerateRisk} isHighRisk={isHighRisk} />
      <div style={{marginTop: 30}}>
        <StepsSection
          callToAction={callToAction} to={nextPage} hasRisk={hasRisk} />
        <Notices style={{marginTop: 20}} callToAction={callToAction} />
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
      <Title isModerateRisk={isModerateRisk} isHighRisk={isHighRisk} style={{maxWidth: 450}} />
      <div style={{maxWidth: 385}}>
        <StepsSection
          style={innerStepsSectionStyle} callToAction={callToAction} to={nextPage}
          hasRisk={hasRisk} />
        <Notices style={{marginTop: 20}} callToAction={callToAction} />
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
      Un <span style={{color: colors.TURQUOISE_GREEN}}>geste civique</span>,<br />
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


const recommendedSectionStyle: React.CSSProperties = {
  backgroundColor: '#000',
  color: '#fff',
  padding: isMobileVersion ? '60px 30px 70px' : '80px 20px',
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
  return <section style={recommendedSectionStyle}>
    <Trans parent="h2" style={recommendedTitleStyle}>
      Créé en <span style={{color: colors.MINTY_GREEN}}>collaboration</span><br />
      avec&nbsp;des médecins
    </Trans>
    <div style={doctorsSectionContentStyle}>
      <div style={recommendationStyle}>
        <div style={isMobileVersion ? {} : {maxWidth: 250}}>
          <h3 style={doctorNameStyle}>
            D<sup>r</sup> Jérémy <div style={{color: colors.STRONG_PINK}}>Zeggagh</div>
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
            D<sup>r</sup> Cécile <div style={{color: colors.STRONG_PINK}}>Monteil</div>
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
            D<sup>r</sup> Liem Binh <div style={{color: colors.STRONG_PINK}}>Luong Nguyen</div>
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
  const {t: translate} = useTranslation()
  return <section style={{padding: '40px 30px'}}>
    <Trans parent="h2" style={{textAlign: 'center'}}>FAQ</Trans>

    <ReactMarkdown source={translate(faqContent, {
      privacyPageURL: Routes.PRIVACY,
      productName: config.productName,
    })} />
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
  fontWeight: 'bold',
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
  </React.Fragment>
}


export default React.memo(SplashPage)
