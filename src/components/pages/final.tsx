import HomeHeartLineIcon from 'remixicon-react/HomeHeartLineIcon'
import React, {useEffect, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useSelector} from 'react-redux'
import {Redirect} from 'react-router-dom'

import {useFastForward} from 'hooks/fast_forward'
import {usePDFDownloader} from 'hooks/pdf'
import {useKeyListener} from 'hooks/shortkey'
import {Routes} from 'store/url'

import {PedagogyLayout} from 'components/navigation'


const titleStyle: React.CSSProperties = {
  fontWeight: 'normal',
  textAlign: 'left',
}

const FinalPageBase = (): React.ReactElement => {
  const {t} = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const timeout = window.setTimeout((): void => setIsVisible(true), 300)
    return (): void => clearTimeout(timeout)
  }, [])
  useFastForward(undefined, undefined, Routes.SYMPTOMS_ONSET)
  const numAlertedPeople = useSelector(({alerts}: RootState): number => {
    return [...new Set(Object.keys(alerts))].length
  })
  const downloadPDF = usePDFDownloader()
  // FIXME(pascal): Use the download callback in a visible button.
  useKeyListener('KeyD', downloadPDF, {ctrl: true, shift: true})
  const subtitle = numAlertedPeople > 1 ? t(
    "Si elles appliquent le confinement c'est plus de {{numSaved}} personnes " +
    'potentiellement non contaminées\u00A0!', {numSaved: numAlertedPeople * numAlertedPeople}) : ''
  const iconText = numAlertedPeople > 1 ? t('Merci pour eux') : t('Merci')
  const containerStyle: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transition: '800ms',
  }
  if (!numAlertedPeople) {
    return <Redirect to={Routes.ROOT} />
  }
  return <div style={containerStyle}><PedagogyLayout
    title={<Trans style={titleStyle} count={numAlertedPeople}>
      Grâce à vous nous avons pu prévenir {{numAlert: numAlertedPeople}} personne&nbsp;!
    </Trans>}
    subtitle={<div style={titleStyle}>{subtitle}</div>}
    icon={HomeHeartLineIcon} iconText={iconText} /></div>
}
const FinalPage = React.memo(FinalPageBase)

export default FinalPage
