import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'

import {useFastForward} from 'hooks/fast_forward'
import {getPath} from 'store/url'

import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import {PedagogyPage} from 'components/navigation'
import VirusIconSrc from 'images/virus_icon.svg'


const titleStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 26,
  fontWeight: 800,
}
const VirusIcon = {
  alt: config.diseaseName,
  src: VirusIconSrc,
}

// TODO(sil): Fix top spacing now that the top bar is here.
const HealthStatusPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const history = useHistory()
  const title = <div style={titleStyle}>{
    t('Pensez-vous être atteint(e) du {{diseaseName}}\u00A0?', {diseaseName: config.diseaseName})
  }</div>
  const subtitle = t('Ou avoir été atteint(e) dans le passé.')
  const goToStart = useCallback((): void => {
    history.push(getPath('SYMPTOMS_ONSET', t))
  }, [history, t])
  const goToDiagnostic = useCallback((): void => {
    history.push(getPath('DIAGNOSTIC', t))
  }, [history, t])
  const goToReferral = useCallback((): void => {
    history.push(getPath('REFERRAL', t))
  }, [history, t])
  useFastForward(goToDiagnostic)
  return <PedagogyPage title={title} subtitle={subtitle} icon={VirusIcon}>
    <div style={{...darkButtonStyle, margin: '16px 0 10px'}} onClick={goToStart}>
      {t("Oui, j'ai été diagnostiqué(e)")}
    </div>
    <div style={{...darkButtonStyle, margin: '0 0 10px'}} onClick={goToDiagnostic}>
      {t('Je pense avoir des symptômes')}
    </div>
    <div style={{...lightButtonStyle, marginBottom: 20}} onClick={goToReferral}>
      {t('Non')}
    </div>
  </PedagogyPage>
}


export default React.memo(HealthStatusPage)
