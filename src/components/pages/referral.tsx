import TeamFillIcon from 'remixicon-react/TeamFillIcon'
import React, {useCallback} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'

import {useDefaultShareText} from 'hooks/share'
import {Routes} from 'store/url'

import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import {PedagogyLayout} from 'components/navigation'


const hasShare = !!navigator.share
const buttonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: colors.VIBRANT_GREEN,
}


const ReferralPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const title = <Trans>
    Un(e) ami(e) malade du {{diseaseName: config.diseaseName}}&nbsp;?<br />
    Brisez la chaîne&nbsp;!
  </Trans>
  const subtitle = t(
    'Partagez ce site à vos proches atteints du {{diseaseName}}, nous les aiderons à y faire ' +
    'face\u00A0!',
    {diseaseName: config.diseaseName},
  )
  const text = useDefaultShareText()
  const share = useCallback((): void => {
    if (hasShare) {
      navigator.share?.({text, title: config.productName, url: config.canonicalUrl})
      return
    }
    window.open(
      `mailto:?subject=${encodeURIComponent(config.productName)}&` +
      `body=${encodeURIComponent(text)}`,
      '_blank')
  }, [text])
  return <PedagogyLayout title={title} subtitle={subtitle} icon={TeamFillIcon}>
    <div style={buttonStyle} onClick={share}>
      {t('Partager {{productName}}', {productName: config.productName})}
    </div>
    <Link to={Routes.HEALTH_STATUS} style={lightButtonStyle}>
      {t('Retour')}
    </Link>
  </PedagogyLayout>
}


export default React.memo(ReferralPage)
