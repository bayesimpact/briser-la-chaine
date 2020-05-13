import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'

import {useFastForward} from 'hooks/fast_forward'
import {Routes} from 'store/url'

import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import {PedagogyLayout} from 'components/navigation'
import VirusIconSrc from 'images/virus_icon.svg'


const titleStyle: React.CSSProperties = {
  fontSize: 28,
}
const VirusIcon = {
  alt: config.diseaseName,
  src: VirusIconSrc,
}

const HealthStatusPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const history = useHistory()
  const title = <div style={titleStyle}>{
    t('Pensez-vous être atteint(e) du {{diseaseName}}\u00A0?', {diseaseName: config.diseaseName})
  }</div>
  const subtitle = t('Ou avoir été atteint(e) dans le passé.')
  const goToStart = useCallback((): void => {
    history.push(Routes.PEDAGOGY_INTRO)
  }, [history])
  const goToDiagnostic = useCallback((): void => {
    history.push(Routes.DIAGNOSTIC)
  }, [history])
  const goToReferral = useCallback((): void => {
    history.push(Routes.REFERRAL)
  }, [history])
  useFastForward(goToDiagnostic)
  return <PedagogyLayout title={title} subtitle={subtitle} icon={VirusIcon}>
    <div style={{...darkButtonStyle, marginTop: 16}} onClick={goToStart}>
      {t("Oui, j'ai été diagnostiqué(e)")}
    </div>
    <div style={darkButtonStyle} onClick={goToDiagnostic}>
      {t('Je pense avoir des symptômes')}
    </div>
    <div style={lightButtonStyle} onClick={goToReferral}>
      {t('Non')}
    </div>
  </PedagogyLayout>
}
const MemoPage = React.memo(HealthStatusPage)

export {MemoPage as HealthStatusPage}
