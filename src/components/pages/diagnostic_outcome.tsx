import Search2LineIcon from 'remixicon-react/Search2LineIcon'
import ThumbUpFillIcon from 'remixicon-react/ThumbUpFillIcon'
import UserSearchFillIcon from 'remixicon-react/UserSearchFillIcon'
import React, {useCallback} from 'react'
import {useTranslation, Trans} from 'react-i18next'
import {useHistory} from 'react-router'

import {useFastForward} from 'hooks/fast_forward'
import {useSelector} from 'store/actions'
import {Routes} from 'store/url'

import {lightButtonStyle} from 'components/buttons'
import {BottomDiv, PedagogyLayout} from 'components/navigation'


const normalWeightStyle: React.CSSProperties = {
  fontWeight: 'normal',
}
const importantStyle: React.CSSProperties = {
  fontWeight: 'bold',
}
const veryImportantStyle: React.CSSProperties = {
  color: colors.SALMON,
  fontWeight: 'bold',
}
const centeredTextStyle: React.CSSProperties = {
  textAlign: 'center',
}
const externalLinkStyle: React.CSSProperties = {
  ...lightButtonStyle,
  display: 'inline-block',
  margin: '20px auto',
}
const DiagnosticOutcomePageBase = (): React.ReactElement => {
  const {t} = useTranslation()
  const history = useHistory()
  const risk = useSelector(
    ({user: {contaminationRisk}}): ContaminationRisk|undefined => contaminationRisk)
  const hasKnownRisk = useSelector(
    ({user: {hasKnownRisk}}): boolean|undefined => hasKnownRisk)
  // There are 4 possibilities:
  //   - user w/o known risk with symptoms ==> They go to the main slider: app instructions.
  //   - user w/o known risk w/o symptoms ==> End of journey they can re-check outside the app.
  //   - user with known risk with symptoms ==> They have specific slider: what to do.
  //   - user w/o known risk with symptoms ==> They have specific slider: keep in touch.
  const isNaiveHighRisk = risk === 'high' && !hasKnownRisk
  const isNaiveLowRisk = risk === 'low' && !hasKnownRisk
  const isReferralHighRisk = risk === 'high' && hasKnownRisk
  const isReferralLowRisk = risk === 'low' && hasKnownRisk
  const icon = isNaiveLowRisk ? ThumbUpFillIcon : isReferralLowRisk ? Search2LineIcon :
    UserSearchFillIcon
  const title = isReferralLowRisk ?
    <Trans style={normalWeightStyle}>
      Il est <span style={importantStyle}>trop tôt</span> pour savoir si vous êtes atteint(e).
      <br /><br />
      Il reste <span style={veryImportantStyle}>vital</span> que vous
      preniez toutes les précautions nécessaires.
    </Trans> : isNaiveHighRisk || isReferralHighRisk ? <Trans style={normalWeightStyle}>
      Vos symptômes <span style={importantStyle}>pourraient provenir</span> du covid-19.<br /><br />
      Il est <span style={veryImportantStyle}>vital</span> que vous brisiez la chaîne
      de contamination.
    </Trans> : t('Votre état ne semble pas préoccupant')
  const subtitle = isNaiveLowRisk ? t('Revenez si vous avez des symptômes') : ''
  const nextText = hasKnownRisk ?
    t('Que dois-je faire\u00A0?') : isNaiveHighRisk ? t('Briser la chaîne') : ''
  const handleNext = useCallback(
    (): void => isNaiveLowRisk ? void 0 : history.push(Routes.FOLLOW_UP),
    [history, isNaiveLowRisk])
  useFastForward(handleNext)
  const nextButtonColor = isReferralHighRisk || isNaiveHighRisk ? colors.VIBRANT_GREEN : undefined
  return <PedagogyLayout
    title={title} icon={icon} subtitle={subtitle}
    nextButton={nextText} onNext={handleNext} nextButtonColor={nextButtonColor}>
    {isNaiveLowRisk ? <BottomDiv style={centeredTextStyle}>
      <a style={externalLinkStyle} href="https://maladiecoronavirus.fr/">
        {t('Passer un diagnostic approfondi')}</a>
    </BottomDiv> : null}
  </PedagogyLayout>
}
const DiagnosticOutcomePage = React.memo(DiagnosticOutcomePageBase)

export default DiagnosticOutcomePage
