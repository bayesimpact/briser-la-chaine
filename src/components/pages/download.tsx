import React, {useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'

import {useFastForward} from 'hooks/fast_forward'
import {usePDFDownloader} from 'hooks/pdf'
import {getPath} from 'store/url'
import {usePeopleToAlert, useSelector} from 'store/selections'

import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import {PedagogyPage} from 'components/navigation'
import celebration from 'images/celebration.svg'


const buttonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  margin: 'auto',
  maxWidth: 420,
}
// This is a top level page and should never be nested in another one.
// TOP LEVEL PAGE
const DownloadPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const history = useHistory()
  const people = usePeopleToAlert()
  const alerts = useSelector(({alerts}): AlertsState => alerts)
  const hasAlertedViaPhysician = people.some(
    ({personId}): boolean => alerts[personId]?.lastSender === 'physician')
  const onNext = useCallback(() => history.push(getPath('FINAL', t)), [history, t])
  useFastForward(onNext)
  const downloadPDF = usePDFDownloader()
  const icon = useMemo(() => ({
    alt: t('bravo'),
    src: celebration,
  }), [t])
  const subtitle = hasAlertedViaPhysician ?
    t("Envoyez ce document à votre médecin pour qu'il(elle) contacte les personnes restantes.") :
    t('Ce document pourrait par exemple être utile à votre médecin.')
  // TODO(pascal): Limit the button width to 420px.
  return <PedagogyPage
    title={t('Téléchargez votre récapitulatif')}
    subtitle={subtitle}
    icon={icon} iconSize={100}
    nextButtonStyle={lightButtonStyle} nextButton={t('Suivant')} onNext={onNext}
    hasNav={false}>
    <div style={{alignSelf: 'stretch'}}>
      <div onClick={downloadPDF} style={buttonStyle}>{t('Télécharger au format PDF')}</div>
    </div>
  </PedagogyPage>
}

export default React.memo(DownloadPage)
