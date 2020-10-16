import React from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useSelector} from 'react-redux'
import {Redirect} from 'react-router-dom'

import {useFastForward} from 'hooks/fast_forward'
import {getPath} from 'store/url'

import ShareButtons from 'components/share_buttons'
import heartFullCelebrationImage from 'images/heart-full-celebration.svg'


const titleStyle: React.CSSProperties = {
  fontSize: 22,
  margin: '0 20px 20px',
}
const containerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  margin: '0 auto',
  maxWidth: 700,
  minHeight: window.innerHeight,
  padding: '0 20px',
  textAlign: 'center',
  transition: '800ms',
}
const circleStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.PALE_GREY,
  borderRadius: 165,
  display: 'flex',
  height: 165,
  justifyContent: 'center',
  marginBottom: 40,
  position: 'relative',
  width: 165,
}
const thankYouStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 20,
}

// This is a top level page and should never be nested in another one.
// TOP LEVEL PAGE
const FinalPageBase = (): React.ReactElement => {
  const {t} = useTranslation()
  const numAlertedPeople = useSelector(({alerts}: RootState): number => {
    return [...new Set(Object.keys(alerts))].length
  })
  const sharedText = t(
    'Je viens de briser ma chaîne de contamination en prévenant {{count}} personne de prendre ' +
    'les précautions nécessaires pour se protéger et protéger son entourage\u00A0! 💪\n\nSi vous ' +
    "avez des symptômes du {{diseaseName}}, je vous recommande d'utiliser ce site gratuit et " +
    "anonyme qui m'a été très utile\u00A0: {{url}}.\n\n(Site créé par une ONG, il n'y a aucun " +
    'traçage de données\u00A0!)',
    {count: numAlertedPeople, diseaseName: config.diseaseName, url: t('canonicalUrl')},
  )
  useFastForward(undefined, undefined, getPath('SYMPTOMS_ONSET', t))
  const thankYou = numAlertedPeople > 1 ? t('Merci pour eux') : t('Merci')
  if (!numAlertedPeople) {
    return <Redirect to={getPath('ROOT', t)} />
  }
  return <div style={containerStyle}>
    <div style={circleStyle}>
      <img src={heartFullCelebrationImage} alt="" width={100} />
    </div>
    <div style={thankYouStyle}>{thankYou}</div>
    <Trans style={titleStyle} count={numAlertedPeople}>
      Grâce à vous, <strong style={{color: colors.SEAWEED}}>
        {{numAlert: numAlertedPeople}} personne
      </strong> va pouvoir se protéger et briser la chaîne à son tour&nbsp;!
    </Trans>
    <ShareButtons
      title={t('Partagez la nouvelle\u00A0:')} sharedText={sharedText} visualElement="thank-you" />
  </div>
}
const FinalPage = React.memo(FinalPageBase)

export default FinalPage
