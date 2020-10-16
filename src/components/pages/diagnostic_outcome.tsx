import ErrorWarningFillIcon from 'remixicon-react/ErrorWarningFillIcon'
import Search2LineIcon from 'remixicon-react/Search2LineIcon'
import ThumbUpFillIcon from 'remixicon-react/ThumbUpFillIcon'
import UserSearchFillIcon from 'remixicon-react/UserSearchFillIcon'
import React, {useCallback} from 'react'
import {useTranslation, Trans} from 'react-i18next'
import {useHistory} from 'react-router'
import {Link} from 'react-router-dom'

import {useFastForward} from 'hooks/fast_forward'
import {goToExternalDiagnosticAction, useDispatch, useSelector} from 'store/actions'
import {getPath} from 'store/url'

import {darkButtonStyle, lightButtonStyle} from 'components/buttons'
import {BottomDiv, PedagogyPage} from 'components/navigation'


const normalWeightStyle: React.CSSProperties = {
  fontWeight: 'normal',
}
const importantStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontWeight: 800,
}
const veryImportantStyle: React.CSSProperties = {
  color: colors.BARBIE_PINK,
  fontFamily: 'Poppins',
  fontWeight: 800,
}
const centeredTextStyle: React.CSSProperties = {
  textAlign: 'center',
}
const externalLinkStyle: React.CSSProperties = {
  ...lightButtonStyle,
  color: colors.ALMOST_BLACK,
  display: 'block',
  margin: '20px auto',
  maxWidth: 420,
}
const greenButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: colors.MINTY_GREEN,
  color: colors.ALMOST_BLACK,
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
const assistanceWarningStyle: React.CSSProperties = {
  alignItems: 'center',
  border: `solid 1px ${colors.SMOKEY_GREY}`,
  borderRadius: 10,
  display: 'flex',
  fontSize: 13,
  margin: '0 40px',
  padding: '12px 22px',
}
const assistanceWarningNowStyle: React.CSSProperties = {
  ...assistanceWarningStyle,
  backgroundColor: colors.BARBIE_PINK,
  border: 'none',
  color: '#fff',
}
const boldStyle: React.CSSProperties = {
  color: 'inherit',
  fontWeight: 600,
  textDecoration: 'underline',
}
const DiagnosticOutcomePageBase = (): React.ReactElement => {
  const {t} = useTranslation()
  const history = useHistory()
  const dispatch = useDispatch()
  const risk = useSelector(
    ({user: {contaminationRisk}}): ContaminationRisk|undefined => contaminationRisk)
  const hasKnownRisk = useSelector(
    ({user: {hasKnownRisk}}): boolean|undefined => hasKnownRisk)
  const isAssistanceRequiredNow = useSelector(
    ({user: {isAssistanceRequiredNow}}): boolean => !!isAssistanceRequiredNow,
  )
  // There are 4 possibilities:
  //   - user w/o known risk with symptoms ==> They go to the main slider: app instructions.
  //   - user w/o known risk w/o symptoms ==> End of journey they can re-check outside the app.
  //   - user with known risk with symptoms ==> They have specific slider: what to do.
  //   - user w/o known risk with symptoms ==> They have specific slider: keep in touch.
  const isNaiveHighRisk = risk === 'high' && !hasKnownRisk
  const isNaiveLowRisk = risk === 'low' && !hasKnownRisk
  const isReferralLowRisk = risk === 'low' && hasKnownRisk
  const handleNext = useCallback((): void => {
    if (isNaiveLowRisk) {
      return
    }
    if (isNaiveHighRisk) {
      history.push(getPath('SYMPTOMS_ONSET', t))
      return
    }
    history.push(getPath('FOLLOW_UP', t))
  }, [history, isNaiveLowRisk, isNaiveHighRisk, t])
  const handleDeeperDiagnostic = useCallback((): void => {
    dispatch(goToExternalDiagnosticAction)
  }, [dispatch])
  useFastForward(handleNext)

  if (isNaiveLowRisk) {
    const title = t(
      'Vos symptômes ne semblent pas être des symptômes principaux du {{diseaseName}}',
      {diseaseName: config.diseaseName},
    )
    return <PedagogyPage
      title={<span style={importantStyle}>{title}</span>} icon={ThumbUpFillIcon}
      subtitle={t("N'hésitez pas à consulter un médecin pour plus d'informations.")}>
      <BottomDiv style={centeredTextStyle}>
        <div style={{padding: '0 20px'}}>
          <Link to={getPath('SYMPTOMS_ONSET', t)} style={greenButtonStyle}>
            {t('Alerter mes contacts quand même')}
          </Link>
          <a
            style={externalLinkStyle} href={t('diagnosticWebsiteUrl')} target="_blank"
            rel="noopener noreferrer" onClick={handleDeeperDiagnostic}>
            {t('Passer un diagnostic approfondi')}</a>
        </div>
        {/* TODO(pascal): DRY with intro_pedagogy module. */}
        <div style={alertBottomDivStyle}>
          <ErrorWarningFillIcon style={warningIconStyle} />
          <Trans>
            En cas de difficultés respiratoires, contactez le 15 <strong>immédiatement</strong>
          </Trans>
        </div>
      </BottomDiv>
    </PedagogyPage>
  }

  if (isReferralLowRisk) {
    return <PedagogyPage
      title={<Trans style={normalWeightStyle}>
        Il est <span style={importantStyle}>trop tôt</span> pour savoir si vous êtes atteint(e).
        <br /><br />
        Il reste <span style={veryImportantStyle}>essentiel</span> que vous
        preniez toutes les précautions nécessaires.
      </Trans>} icon={Search2LineIcon}
      nextButton={t('Que dois-je faire\u00A0?')} onNext={handleNext} />
  }

  if (hasKnownRisk) {
    // Referral High Risk
    return <PedagogyPage
      title={<Trans style={normalWeightStyle}>
        Vos symptômes <span style={importantStyle}>pourraient provenir</span> du
        {' '}{{diseaseName: config.diseaseName}}.<br /><br />
        Il est <span style={veryImportantStyle}>indispensable</span> que vous brisiez la chaîne
        de contamination.
      </Trans>} icon={UserSearchFillIcon}
      nextButton={t('Que dois-je faire\u00A0?')} onNext={handleNext}
      nextButtonColor={colors.MINTY_GREEN} />
  }

  // Naive High Risk.
  return <PedagogyPage
    title={<Trans style={importantStyle}>
      Vos symptômes pourraient provenir du {{diseaseName: config.diseaseName}}.
    </Trans>}
    subtitle={t('Prenez vos précautions en contactant un médecin pour avoir son diagnostic.')}
    icon={Search2LineIcon} nextButton={t("J'ai pris mes précautions")} onNext={handleNext}>
    <div style={isAssistanceRequiredNow ? assistanceWarningNowStyle : assistanceWarningStyle}>
      <ErrorWarningFillIcon style={warningIconStyle} />
      {isAssistanceRequiredNow ? <Trans>
        Vous avez indiqué avoir des difficultés respiratoires. <a href="tel:15" style={boldStyle}>
          Contactez le 15
        </a> pour être pris(e) en charge rapidement.
      </Trans> : <Trans>
        En cas de difficultés respiratoires, <span style={boldStyle}>
          contactez le 15 immédiatement
        </span>.
      </Trans>}
    </div>
  </PedagogyPage>
}
const DiagnosticOutcomePage = React.memo(DiagnosticOutcomePageBase)

export default DiagnosticOutcomePage
