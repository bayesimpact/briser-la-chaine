import ErrorWarningFillIcon from 'remixicon-react/ErrorWarningFillIcon'
import Search2LineIcon from 'remixicon-react/Search2LineIcon'
import ThumbUpFillIcon from 'remixicon-react/ThumbUpFillIcon'
import UserSearchFillIcon from 'remixicon-react/UserSearchFillIcon'
import React, {useCallback} from 'react'
import {useTranslation, Trans} from 'react-i18next'
import {useHistory} from 'react-router'
import {Link} from 'react-router-dom'

import {useFastForward} from 'hooks/fast_forward'
import {useSelector} from 'store/actions'
import {Routes} from 'store/url'

import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
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
  color: '#000',
  display: 'block',
  margin: '20px auto',
  maxWidth: 420,
}
const greenButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: colors.VIBRANT_GREEN,
  display: 'block',
  margin: '20px auto',
  maxWidth: 420,
}
const alertBottomDivStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.WHITE_TWO,
  display: 'flex',
  fontSize: 13,
  justifyContent: 'center',
  padding: '20px 70px',
  textAlign: 'left',
}
const warningIconStyle: React.CSSProperties = {
  flex: 'none',
  marginRight: 15,
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
      Il est <span style={veryImportantStyle}>indispensable</span> que vous brisiez la chaîne
      de contamination.
    </Trans> : t('Vos symptômes ne semblent pas être des symptômes principaux du Covid-19')
  const subtitle = isNaiveLowRisk ?
    t("N'hésitez pas à consulter un médecin pour plus d'informations") : ''
  const nextText = hasKnownRisk ?
    t('Que dois-je faire\u00A0?') : isNaiveHighRisk ? t('Briser la chaîne') : ''
  const handleNext = useCallback((): void => {
    if (isNaiveLowRisk) {
      return
    }
    if (isNaiveHighRisk) {
      history.push(Routes.PEDAGOGY_INTRO)
      return
    }
    history.push(Routes.FOLLOW_UP)
  }, [history, isNaiveLowRisk, isNaiveHighRisk])
  useFastForward(handleNext)
  const nextButtonColor = isReferralHighRisk || isNaiveHighRisk ? colors.VIBRANT_GREEN : undefined
  return <PedagogyLayout
    title={title} icon={icon} subtitle={subtitle}
    nextButton={nextText} onNext={handleNext} nextButtonColor={nextButtonColor}>
    {isNaiveLowRisk ? <BottomDiv style={centeredTextStyle}>
      <div style={{padding: '0 20px'}}>
        <Link to={Routes.PEDAGOGY_INTRO} style={greenButtonStyle}>
          {t('Alerter mes contacts quand même')}
        </Link>
        <a style={externalLinkStyle} href="https://maladiecoronavirus.fr/">
          {t('Passer un diagnostic approfondi')}</a>
      </div>
      {/* TODO(pascal): DRY with intro_pedagogy module. */}
      <div style={alertBottomDivStyle}>
        <ErrorWarningFillIcon style={warningIconStyle} />
        <Trans>
          En cas de difficultés respiratoires, contactez le 15 <strong>immédiatement</strong>
        </Trans>
      </div>
    </BottomDiv> : null}
  </PedagogyLayout>
}
const DiagnosticOutcomePage = React.memo(DiagnosticOutcomePageBase)

export default DiagnosticOutcomePage
