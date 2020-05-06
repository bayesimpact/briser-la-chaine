import CalendarLineIcon from 'remixicon-react/CalendarLineIcon'
import DoubleQuotesLIcon from 'remixicon-react/DoubleQuotesLIcon'
import HomeHeartLineIcon from 'remixicon-react/HomeHeartLineIcon'
import LinksFillIcon from 'remixicon-react/LinksFillIcon'
import LockFillIcon from 'remixicon-react/LockFillIcon'
import MailLineIcon from 'remixicon-react/MailLineIcon'
import MessengerFillIcon from 'remixicon-react/MessengerFillIcon'
import PinDistanceLineIcon from 'remixicon-react/PinDistanceLineIcon'
import SpyFillIcon from 'remixicon-react/SpyFillIcon'
import TwitterFillIcon from 'remixicon-react/TwitterFillIcon'
import WhatsappFillIcon from 'remixicon-react/WhatsappFillIcon'
import React, {useCallback, useEffect} from 'react'
import ReactMarkdown from 'react-markdown'
import {Trans, useTranslation} from 'react-i18next'
import {useLocation} from 'react-router'
import {Link} from 'react-router-dom'

import {useFastForward} from 'hooks/fast_forward'
import {saveKnownRisk, useDispatch} from 'store/actions'
import {Routes} from 'store/url'

import {darkButtonStyle} from 'components/buttons'
import logoImage from 'images/logo.svg'
import bayesLogoImage from 'images/bayes-logo.svg'

import faqContent from './faq.txt'


const titleStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  fontSize: 36,
  fontWeight: 'bold',
  justifyContent: 'center',
  margin: '60px 30px',
  textAlign: 'left',
}
const riskyContactStyle: React.CSSProperties = {
  color: colors.TOMATO,
}
const lowRiskContactStyle: React.CSSProperties = {
  color: colors.ORANGE,
}
const landingTagStyle: React.CSSProperties = {
  backgroundColor: colors.MEDIUM_GREY,
  borderRadius: 5,
  bottom: '100%',
  color: colors.WARM_GREY,
  left: '50%',
  marginBottom: 20,
  padding: 10,
  position: 'absolute',
  transform: 'translate(-50%)',
}
const tagNotchStyle: React.CSSProperties = {
  borderLeft: 'solid 10px transparent',
  borderRight: 'solid 10px transparent',
  borderTop: `solid 5px ${landingTagStyle.backgroundColor}`,
  height: 1,
  left: '50%',
  position: 'absolute',
  top: '100%',
  transform: 'translate(-50%)',
  width: 1,
}
const discreetLink: React.CSSProperties = {
  color: 'inherit',
}
const bayesLinkStyle: React.CSSProperties = {
  display: 'block',
  margin: '35px 0',
}
const bayesLogoStyle: React.CSSProperties = {
  filter: 'grayscale(1) brightness(0)',
  opacity: .5,
  width: 130,
}


// NOTE: This is the top of our app and therefore the first text that we put here will be used by
// Google for its snippet. Make sure to order it as you think it should be.
const LandingSectionBase = (): React.ReactElement => {
  const {t} = useTranslation()
  const {pathname} = useLocation()
  const dispatch = useDispatch()
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
    t('Que dois je faire\u00A0?') : t('Briser la chaîne de contamination')
  return <section style={{padding: '60px 30px', textAlign: 'center'}}>
    <div style={{marginTop: 90, position: 'relative'}}>
      <h1 style={titleStyle}>
        <img src={logoImage} alt="" /> <span>{config.productName}</span>
      </h1>
      <div style={{color: colors.GREYISH_BROWN, fontWeight: 'bold', marginBottom: 20}}>
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
        </Trans> : t('Peut-être atteint(e) du COVID-19\u00A0?')}
      </div>
      <div style={{color: colors.WARM_GREY, padding: 15}}>
        {hasRisk ?
          t('Même sans symptôme, vous êtes peut-être contagieux(se) aussi') :
          t(
            'Nous vous aidons à contacter les personnes croisées pendant votre période ' +
            'contagieuse en quelques minutes.',
          )}
      </div>
      <div style={landingTagStyle}>
        {t('Nous sommes une ONG citoyenne')}
        <div style={tagNotchStyle} />
      </div>
    </div>
    <Link
      to={hasRisk ? Routes.DIAGNOSTIC : Routes.HEALTH_STATUS}
      style={{...darkButtonStyle, display: 'block', marginTop: 65}}>
      {callToAction}
    </Link>
    <Trans style={{color: colors.WARM_GREY, fontSize: 12, marginBottom: 15}}>
      En cliquant sur <strong>{{callToAction}}</strong> vous acceptez
      nos <a href={Routes.TERMS} style={discreetLink} target="_blank" rel="noopener noreferrer">
        Conditions Générales d'Utilisation
      </a>
    </Trans>
    <div style={{alignItems: 'center', display: 'flex', fontSize: 12, justifyContent: 'center'}}>
      <LockFillIcon size={16} />
      <span style={{margin: '0 5px'}}>
        {t('Nous ne collectons aucune donnée')}
      </span>
      <a href={Routes.PRIVACY} style={discreetLink} target="_blank" rel="noopener noreferrer">
        {t('En savoir plus')}
      </a>
    </div>
    <a
      href="https://www.bayesimpact.org" style={bayesLinkStyle} target="_blank"
      rel="noopener noreferrer">
      <img src={bayesLogoImage} alt="Bayes Impact" style={bayesLogoStyle} />
    </a>
  </section>
}
const LandingSection = React.memo(LandingSectionBase)


const featuresSectionStyle: React.CSSProperties = {
  backgroundColor: colors.WHITE_TWO,
  padding: '30px 35px',
  textAlign: 'center',
}
const featureCircleStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 90,
  display: 'flex',
  height: 90,
  justifyContent: 'center',
  marginBottom: 8,
  width: 90,
}
const featureContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: 'none',
  flexDirection: 'column',
  margin: 8,
  width: 140,
}

const FeaturesSectionBase = (): React.ReactElement => {
  const {t} = useTranslation()
  return <section style={featuresSectionStyle}>
    <Trans parent="h2">Votre vie privée et votre santé sont nos priorités</Trans>
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
      <div style={featureContainerStyle}>
        <div style={featureCircleStyle}>
          <CalendarLineIcon color={colors.VERY_LIGHT_PURPLE} size={40} />
        </div>
        {t('Basé sur votre mémoire')}
      </div>
      <div style={featureContainerStyle}>
        <div style={featureCircleStyle}>
          <PinDistanceLineIcon color={colors.PALE} size={40} />
        </div>
        {t('Sans traçage ni géolocalisation')}
      </div>
      <div style={featureContainerStyle}>
        <div style={featureCircleStyle}>
          <HomeHeartLineIcon color={colors.PALE} size={40} />
        </div>
        {t('Diagnostic et conseils')}
      </div>
      <div style={featureContainerStyle}>
        <div style={featureCircleStyle}>
          <SpyFillIcon color={colors.VERY_LIGHT_PURPLE} size={40} />
        </div>
        {t('Anonyme ou personnel')}
      </div>
    </div>
  </section>
}
const FeaturesSection = React.memo(FeaturesSectionBase)


const userFlowContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  marginTop: 40,
}
const userFlowBulletStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.GREYISH_BROWN,
  borderRadius: 20,
  color: '#fff',
  display: 'flex',
  fontSize: 12,
  height: 20,
  justifyContent: 'center',
  margin: 5,
  position: 'relative',
  width: 20,
}
const userFowLineStyle: React.CSSProperties = {
  backgroundColor: colors.MEDIUM_GREY,
  borderRadius: 2,
  flex: 1,
  height: 4,
  maxWidth: 150,
}
const stepTextStyle: React.CSSProperties = {
  color: colors.GREYISH_BROWN,
  fontSize: 14,
  left: '50%',
  marginTop: 10,
  position: 'absolute',
  top: '100%',
  transform: 'translateX(-50%)',
}


const UserFlowSectionBase = (): React.ReactElement => {
  return <section style={{padding: '90px 30px', textAlign: 'center'}}>
    <Trans parent="h2">Une experience vitale, pensée pour vous</Trans>
    <div style={userFlowContainerStyle}>
      <div style={userFlowBulletStyle}>
        1
        <Trans style={stepTextStyle}>
          Diagnostic
        </Trans>
      </div>
      <div style={userFowLineStyle} />
      <div style={userFlowBulletStyle}>
        2
        <Trans style={stepTextStyle}>
          Prévention
        </Trans>
      </div>
      <div style={userFowLineStyle} />
      <div style={userFlowBulletStyle}>
        3
        <Trans style={stepTextStyle}>
          Alerter
        </Trans>
      </div>
    </div>
  </section>
}
const UserFlowSection = React.memo(UserFlowSectionBase)


const recommendedSectionStyle: React.CSSProperties = {
  backgroundColor: colors.WHITE_TWO,
  padding: '60px 35px',
  textAlign: 'center',
}
const recommendationStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  marginTop: 16,
  padding: 16,
  textAlign: 'left',
}
const authorPictureStyle: React.CSSProperties = {
  backgroundColor: colors.WARM_GREY,
  borderRadius: 40,
  height: 40,
  marginRight: 8,
  width: 40,
}
const authorContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  marginTop: 16,
}
const authorNameStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 'bold',
}
const authorTitleStyle: React.CSSProperties = {
  color: colors.WARM_GREY,
  fontSize: 12,
}


const RecommendedSectionBase = (): React.ReactElement => {
  const {t} = useTranslation()
  // FIXME(pascal): Add real recommendations.
  return <section style={recommendedSectionStyle}>
    <Trans parent="h2">
      Les médecins nous recommandent&nbsp;!
    </Trans>
    <div style={recommendationStyle}>
      <DoubleQuotesLIcon color={colors.PALE} /><br />
      Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
      ipsum Lorem ipsum Lorem ipsum
      <div style={authorContainerStyle}>
        <div style={authorPictureStyle} />
        <div>
          <div style={authorNameStyle}>Rob Ford</div>
          <div style={authorTitleStyle}>{t('Good doctor')}</div>
        </div>
      </div>
    </div>
    <div style={recommendationStyle}>
      <DoubleQuotesLIcon color={colors.VERY_LIGHT_PURPLE} /><br />
      Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
      ipsum Lorem ipsum Lorem ipsum
      <div style={authorContainerStyle}>
        <div style={authorPictureStyle} />
        <div style={{fontSize: 12}}>
          <div style={authorNameStyle}>Jérémie</div>
          <div style={authorTitleStyle}>{t('Another good doctor')}</div>
        </div>
      </div>
    </div>
  </section>
}
const RecommendedSection = React.memo(RecommendedSectionBase)


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


const shareButtonStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.WARM_GREY,
  borderRadius: 40,
  cursor: 'pointer',
  display: 'flex',
  height: 40,
  justifyContent: 'center',
  margin: 8,
  width: 40,
}


const ShareSectionBase = (): React.ReactElement => {
  const {t} = useTranslation()
  const share = useCallback((): void => {
    if (navigator.share) {
      navigator.share({text: config.productName, url: config.canonicalUrl})
    } else {
      // FIXME(pascal): Make those buttons actually do something on Desktop.
      alert(t('Bientôt disponible…'))
    }
  }, [t])
  return <section style={{padding: '60px 0', textAlign: 'center'}}>
    <Trans parent="h2">À partager sans gêne</Trans>
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <div style={shareButtonStyle} aria-label={t('Partager sur Messenger')} onClick={share}>
        <MessengerFillIcon />
      </div>
      <div style={shareButtonStyle} aria-label={t('Partager sur WhatsApp')} onClick={share}>
        <WhatsappFillIcon />
      </div>
      <div
        style={shareButtonStyle} aria-label={t('Copier le lien dans le presse-papier')}
        onClick={share}>
        <LinksFillIcon />
      </div>
      <div style={shareButtonStyle} aria-label={t('Envoyer par email')} onClick={share}>
        <MailLineIcon />
      </div>
      <div style={shareButtonStyle} aria-label={t('Partager sur Twitter')} onClick={share}>
        <TwitterFillIcon />
      </div>
    </div>
  </section>
}
const ShareSection = React.memo(ShareSectionBase)


const footerStyle: React.CSSProperties = {
  backgroundColor: colors.WHITE_TWO,
  fontWeight: 'bold',
  padding: '45px 60px',
  textAlign: 'center',
}
const veryDiscreetLinkStyle: React.CSSProperties = {
  ...discreetLink,
  textDecoration: 'none',
}


const FooterBase = (): React.ReactElement => {
  return <Trans parent="footer" style={footerStyle}>
    Une initiative sociale de l'ONG <a
      href="https://www.bayesimpact.org" target="_blank" rel="noopener noreferrer"
      style={veryDiscreetLinkStyle}>
      Bayes Impact
    </a>
  </Trans>
}
const Footer = React.memo(FooterBase)


const SplashPage = (): React.ReactElement => {
  return <React.Fragment>
    <LandingSection />
    <FeaturesSection />
    <UserFlowSection />
    <RecommendedSection />
    <FAQSection />
    <ShareSection />
    <Footer />
  </React.Fragment>
}


export default React.memo(SplashPage)
