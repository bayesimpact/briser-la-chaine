import React, {useEffect, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useSelector} from 'react-redux'
import {Redirect} from 'react-router-dom'
import DownloadFillIcon from 'remixicon-react/DownloadFillIcon'

import {useFastForward} from 'hooks/fast_forward'
import {usePDFDownloader} from 'hooks/pdf'
import {Routes} from 'store/url'

import {BottomDiv} from 'components/navigation'
import ShareButtons from 'components/share_buttons'
import heartFullCelebrationImage from 'images/heart-full-celebration.svg'
import pdfIcon from 'images/pdf-ico.svg'


const titleStyle: React.CSSProperties = {
  fontSize: 22,
  margin: '0 20px 20px',
}
const subTitleStyle: React.CSSProperties = {
  margin: '0 40px',
}
const bottomDivStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.WHITE_TWO,
  cursor: 'pointer',
  display: 'flex',
  padding: 20,
}
const downloadTextStyle: React.CSSProperties = {
  flex: 1,
  margin: '0 20px',
}
const contentStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '0 20px',
  textAlign: 'center',
}
const circleStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.ICE_BLUE,
  borderRadius: 165,
  display: 'flex',
  height: 165,
  justifyContent: 'center',
  marginBottom: 30,
  position: 'relative',
  width: 165,
}
const thankYouStyle: React.CSSProperties = {
  bottom: 15,
  fontSize: 32,
  fontWeight: 900,
  left: '50%',
  position: 'absolute',
  transform: 'translateX(-50%)',
  width: '100vw',
}

const FinalPageBase = (): React.ReactElement => {
  const {t} = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  // FIXME(sil): Fix this text
  const sharedText = t(
    '{{productName}} {{url}}',
    {productName: config.productName, url: config.canonicalUrl})
  useEffect(() => {
    const timeout = window.setTimeout((): void => setIsVisible(true), 300)
    return (): void => clearTimeout(timeout)
  }, [])
  useFastForward(undefined, undefined, Routes.SYMPTOMS_ONSET)
  const numAlertedPeople = useSelector(({alerts}: RootState): number => {
    return [...new Set(Object.keys(alerts))].length
  })
  const downloadPDF = usePDFDownloader()
  const thankYou = numAlertedPeople > 1 ? t('Merci pour eux') : t('Merci')
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    opacity: isVisible ? 1 : 0,
    transition: '800ms',
  }
  if (!numAlertedPeople) {
    return <Redirect to={Routes.ROOT} />
  }
  return <div style={containerStyle}>
    <div style={contentStyle}>
      <div style={circleStyle}>
        <img src={heartFullCelebrationImage} alt="" width={100} />
        <div style={thankYouStyle}>{thankYou}</div>
      </div>
      <Trans style={titleStyle} count={numAlertedPeople}>
        Grâce à vous nous avons pu prévenir <strong style={{color: colors.VIBRANT_GREEN}}>
          {{numAlert: numAlertedPeople}} personne
        </strong>&nbsp;!
      </Trans>
      {numAlertedPeople > 1 ? <Trans style={subTitleStyle}>
        Si elles appliquent le confinement c'est plus de <strong>
          {{numSaved: numAlertedPeople * numAlertedPeople}} personnes
        </strong> potentiellement non contaminées&nbsp;!
      </Trans> : null}
      <ShareButtons title={t('Partagez la nouvelle\u00A0:')} sharedText={sharedText} />
    </div>
    <BottomDiv>
      <div style={bottomDivStyle} onClick={downloadPDF}>
        <img src={pdfIcon} alt="" />
        <Trans style={downloadTextStyle} count={numAlertedPeople}>
          Télécharger le récapitulatif de la personne contactée
        </Trans>
        <DownloadFillIcon />
      </div>
    </BottomDiv>
  </div>
}
const FinalPage = React.memo(FinalPageBase)

export default FinalPage
