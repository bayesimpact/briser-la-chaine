import AsteriskIcon from 'remixicon-react/AsteriskIcon'
import React, {useCallback} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'

import {Routes} from 'store/url'

import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import {PedagogyLayout} from 'components/navigation'


const hasShare = !!navigator.share


const ReferralPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const title = <Trans>
    Un(e) ami(e) malade du covid&nbsp;?<br />
    Brisez la chaîne&nbsp;
  </Trans>
  const subtitle = t(
    'Partagez ce site à vos proches atteints du covid-19, nous les aideront à y faire face\u00A0!',
  )
  // TODO(pascal): Make the text closer to "I've heard you might be sick".
  const text = t(
    "J'ai découvert un site créé par une ONG pour briser la chaîne de contamination du covid-19, " +
    "jettes-y un coup d'oeil\u00A0: {{url}}",
    {url: config.canonicalUrl},
  )
  const alertNotReady = useCallback((): void => {
    if (hasShare) {
      navigator.share?.({text, title: config.productName, url: config.canonicalUrl})
      return
    }
    window.open(
      `mailto:?subject=${encodeURIComponent(config.productName)}&` +
      `body=${encodeURIComponent(text)}`,
      '_blank')
  }, [text])
  return <PedagogyLayout title={title} subtitle={subtitle} icon={AsteriskIcon}>
    <div style={darkButtonStyle} onClick={alertNotReady}>
      Envoyer ce site à un(e) ami(e)
    </div>
    <Link to={Routes.HEALTH_STATUS} style={lightButtonStyle}>
      {t('Retour')}
    </Link>
  </PedagogyLayout>
}


export default React.memo(ReferralPage)
