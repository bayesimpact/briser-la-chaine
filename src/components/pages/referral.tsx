import TeamFillIcon from 'remixicon-react/TeamFillIcon'
import React, {useCallback} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'

import {useDefaultShareText} from 'hooks/share'
import {shareApp, useDispatch} from 'store/actions'
import {getPath} from 'store/url'

import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import {BottomDiv, PedagogyPage} from 'components/navigation'


const hasShare = !!navigator.share
const buttonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: colors.MINTY_GREEN,
  border: `solid 1px ${colors.MINTY_GREEN}`,
  color: colors.ALMOST_BLACK,
  marginBottom: 20,
}
const strongStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontWeight: 800,
}
const backButtonStyle: React.CSSProperties = {
  ...lightButtonStyle,
  marginBottom: 20,
}

const ReferralPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const title = <Trans>
    Un(e) ami(e) malade du <span style={{whiteSpace: 'nowrap'}}>
      {{diseaseName: config.diseaseName}}&nbsp;?
    </span>
    <div style={strongStyle}>Brisez la chaîne&nbsp;!</div>
  </Trans>
  const subtitle = t(
    'Partagez ce site à vos proches atteints du {{diseaseName}}, nous les aiderons à y faire ' +
    'face\u00A0!',
    {diseaseName: config.diseaseName},
  )
  const text = useDefaultShareText()
  const dispatch = useDispatch()
  const share = useCallback((): void => {
    const visualElement = 'referral'
    if (hasShare) {
      dispatch(shareApp('native', visualElement))
      navigator.share?.({text})
      return
    }
    dispatch(shareApp('email', visualElement))
    window.open(
      `mailto:?subject=${encodeURIComponent(t('productName') as string)}&` +
      `body=${encodeURIComponent(text)}`,
      '_blank')
  }, [dispatch, text, t])
  return <PedagogyPage title={title} subtitle={subtitle} icon={TeamFillIcon}>
    <BottomDiv style={{padding: '0 20px'}}>
      <div style={{display: 'flex', flexDirection: 'column', margin: '0 auto', maxWidth: 420}}>
        <div style={buttonStyle} onClick={share}>
          {t('Partager {{productName}}', {productName: t('productName')})}
        </div>
        <Link to={getPath('HEALTH_STATUS', t)} style={backButtonStyle}>
          {t('Retour')}
        </Link>
      </div>
    </BottomDiv>
  </PedagogyPage>
}


export default React.memo(ReferralPage)
