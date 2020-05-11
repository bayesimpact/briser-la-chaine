import ErrorWarningFillIcon from 'remixicon-react/ErrorWarningFillIcon'
import ShieldUserFillIcon from 'remixicon-react/ShieldUserFillIcon'
import ShieldCrossFillIcon from 'remixicon-react/ShieldCrossFillIcon'
import PinDistanceFillIcon from 'remixicon-react/PinDistanceFillIcon'
import LineChartLineIcon from 'remixicon-react/LineChartLineIcon'
import HandHeartFillIcon from 'remixicon-react/HandHeartFillIcon'
import HospitalFillIcon from 'remixicon-react/HospitalFillIcon'
import Number7Icon from 'remixicon-react/Number7Icon'
import SurveyLineIcon from 'remixicon-react/SurveyLineIcon'
import TempColdLineIcon from 'remixicon-react/TempColdLineIcon'
import AlarmWarningFillIcon from 'remixicon-react/AlarmWarningFillIcon'
import {RemixiconReactIconComponentType} from 'remixicon-react/dist/typings'
import React, {useCallback, useState} from 'react'
import {useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import {Trans, useTranslation} from 'react-i18next'

import {LocalizableString, prepareT} from 'store/i18n'
import {useSelector} from 'store/selections'
import {SORTED_SYMPTOMS} from 'store/symptoms'
import {Routes} from 'store/url'

import {darkButtonStyle} from 'components/buttons'
import {Modal, ModalConfig} from 'components/modal'
import PrivacyNote from 'components/privacy_note'
import Slider, {SliderChildProps} from 'components/slider'
import faceMask from 'images/face_mask.svg'


interface IconBoxProps {
  icon?: RemixiconReactIconComponentType
  image?: string
  text: string
}
const iconBoxStyle: React.CSSProperties = {
  alignItems: 'center',
  alignSelf: 'stretch',
  backgroundColor: colors.BRIGHT_SKY_BLUE,
  borderRadius: 20,
  display: 'flex',
  height: 100,
  justifyContent: 'center',
}
const iconBoxContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  fontSize: 13,
  justifyContent: 'center',
  margin: '0 7.5px',
  maxWidth: 195,
}
const IconBoxBase = ({icon, image, text}: IconBoxProps): React.ReactElement => {
  const {t: translate} = useTranslation()
  const Icon = icon
  return <div style={iconBoxContainerStyle}>
    <div style={iconBoxStyle}>
      {Icon ? <Icon size={36} color="#fff" /> : <img width={36} src={image} alt="" />}
    </div>
    <span style={{height: 60, marginTop: 20, maxWidth: 140, textAlign: 'center'}}>
      {translate(text)}
    </span>
  </div>
}
// TODO(pascal): Move to a component.
export const IconBox = React.memo(IconBoxBase)

const contentContainerStyle: React.CSSProperties = {
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  justifyContent: 'center',
}

const sliderCommonContent: readonly ScreenContent[] = [
  {
    content: <div style={contentContainerStyle}>
      <IconBox icon={ShieldUserFillIcon} text={prepareT('Pour protéger vos proches')} />
      <IconBox icon={ShieldCrossFillIcon} text={prepareT('Pour éviter la propagation du virus')} />
      <IconBox icon={Number7Icon} text={prepareT('Pendant au moins 7 jours')} />
    </div>,
    numImportantInstructions: 3,
    title: prepareT('Confinez-vous dès maintenant'),
  },
  {
    content: <div style={contentContainerStyle}>
      <IconBox icon={ErrorWarningFillIcon} text={prepareT('Toussez dans votre coude')} />
      <IconBox icon={PinDistanceFillIcon} text={prepareT('2 mètres de distance avec les autres')} />
      <IconBox
        image={faceMask}
        text={prepareT('Minimisez vos déplacements et portez un masque')} />
    </div>,
    numImportantInstructions: 3,
    title: prepareT('Pratiquez les gestes barrières'),
  },
  {
    content: <div style={contentContainerStyle}>
      <IconBox icon={SurveyLineIcon} text={prepareT('Vérifiez si vous êtes vraiment porteur')} />
      <IconBox icon={HospitalFillIcon} text={prepareT('Recevez un avis médical certifié')} />
    </div>,
    title: prepareT('Faites-vous dépister'),
  },
]
const sliderHighRiskContent: readonly ScreenContent[] = [
  {
    content: <div style={contentContainerStyle}>
      <IconBox
        icon={AlarmWarningFillIcon}
        text={prepareT('Appelez le 15 en cas de difficulté respiratoire')} />
    </div>,
    numImportantInstructions: 1,
    title: prepareT('Allez-voir un médecin'),
  },
  ...sliderCommonContent,
]

const modalStyle: React.CSSProperties = {
  margin: 20,
  padding: 20,
}
type ModalProps = Omit<ModalConfig, 'children' | 'isShown' | 'onClose'>
// TODO(cyrille): Fix on desktop.
const SymptomsModalLinkBase = (props: ModalProps): React.ReactElement => {
  const {style, ...modalProps} = props
  const {t} = useTranslation()
  const [isShown, setShown] = useState(false)
  const toggleShown = useCallback((): void => setShown(wasShown => !wasShown), [])
  return <div style={style}>
    <Modal style={modalStyle} {...modalProps} isShown={isShown} onClose={toggleShown}>
      <h2>{t('Symptômes à surveiller')}</h2>
      <ul>{SORTED_SYMPTOMS.map(({name, value}) => <li key={value}>{name}</li>)}</ul>
    </Modal>
    <a href="#" style={{color: 'inherit'}} onClick={toggleShown}>
      {t('Quels sont les symptômes à surveiller')}
    </a>
  </div>
}
const SymptomsModalLink = React.memo(SymptomsModalLinkBase)

const sliderLowRiskContent: readonly ScreenContent[] = [
  ...sliderCommonContent,
  {
    content: <div>
      <SymptomsModalLink style={{marginBottom: 30}} />
      <div style={contentContainerStyle}>
        <IconBox
          icon={TempColdLineIcon} text={prepareT('Prenez votre température tous les jours')} />
        <IconBox
          icon={AlarmWarningFillIcon}
          text={prepareT('Appelez le 15 en cas de difficulté respiratoire')} />
      </div>
    </div>,
    numImportantInstructions: 2,
    title: prepareT('Surveillez vos symptômes pendant 14j'),
  },
]


interface ImportantInstructionsProps {
  numInstructions?: number
}


const instructionBoxStyle: React.CSSProperties = {
  alignItems: 'center',
  border: `solid 1px ${colors.MEDIUM_GREY}`,
  borderRadius: 20,
  display: 'flex',
  fontSize: 13,
  margin: '0 40px',
  padding: 20,
}
const hiddenInstructionsBoxStyle: React.CSSProperties = {
  opacity: 0,
}
const importantIconStyle: React.CSSProperties = {
  flex: 'none',
  marginRight: 8,
}
const instructionEmphasisStyle: React.CSSProperties = {
  fontWeight: 'bold',
  textDecoration: 'underline',
}
const ImportantInstructionsBase = (props: ImportantInstructionsProps): React.ReactElement => {
  const {numInstructions} = props
  return <div style={!numInstructions ? hiddenInstructionsBoxStyle : instructionBoxStyle}>
    <ErrorWarningFillIcon style={importantIconStyle} size={20} />
    <Trans count={numInstructions || 0}>
      Mesure à prendre <span style={instructionEmphasisStyle}>dès aujourd'hui</span> pour
      protéger vos proches.
    </Trans>
  </div>
}
const ImportantInstructions = React.memo(ImportantInstructionsBase)


interface StepProps {
  icon: RemixiconReactIconComponentType
  text: string
}
const iconContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.BRIGHT_SKY_BLUE,
  borderRadius: 17,
  display: 'flex',
  height: 30,
  justifyContent: 'center',
  marginRight: 15,
  width: 30,
}
const StepBase = ({icon, text}: StepProps): React.ReactElement => {
  const Icon = icon
  return <div style={{alignItems: 'center', display: 'flex', marginBottom: 30}}>
    <div style={iconContainerStyle}>
      <Icon size={18} color="#fff" />
    </div>
    {text}
  </div>
}
const Step = React.memo(StepBase)


const mobileOnDesktopStyle: React.CSSProperties = {
  margin: 'auto',
  maxWidth: 420,
}


const BottomButtonBase = (props: SliderChildProps): React.ReactElement|null => {
  const {isLastPage} = props
  const {t} = useTranslation()
  const history = useHistory()
  const isHighRisk = useSelector(({user: {contaminationRisk}}) => contaminationRisk === 'high')
  const handleNextButton = useCallback((): void => {
    history.push(Routes.PEDAGOGY_INTRO)
  }, [history])
  if (!isHighRisk) {
    return null
  }
  return <div style={{margin: '0 20px', opacity: isLastPage ? 1 : 0, transition: '1s'}}>
    <div onClick={handleNextButton} style={{...mobileOnDesktopStyle, ...darkButtonStyle}}>
      {t('Briser la chaîne')}
    </div>
  </div>
}
const BottomButton = React.memo(BottomButtonBase)


interface ScreenContent {
  content?: React.ReactNode
  numImportantInstructions?: number
  title: LocalizableString
}

const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 'bold',
  maxWidth: 175,
  textAlign: 'center',
}

const slideStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
}

const veryDiscreetLinkStyle: React.CSSProperties = {
  color: 'inherit',
  textDecoration: 'none',
}

// This is a top level page and should never be nested in another one.
// TOP LEVEL PAGE
const FollowUpPageBase = (): React.ReactElement => {
  const isHighRisk = useSelector(({user: {contaminationRisk}}) => contaminationRisk === 'high')
  const history = useHistory()
  const {t: translate} = useTranslation()
  const mailText = translate(
    'Bonjour, Je souhaite être suivi(e) pendant 14 jours. Merci. Bien à vous')
  const handleNextButton = useCallback((): void => {
    if (isHighRisk) {
      history.push(Routes.PEDAGOGY_INTRO)
      return
    }
    window.open(
      `mailto:?to=${config.followUpMail}&subject=Suivi&` +
      `body=${mailText}`,
      '_blank',
      'noopener,noreferrer')
  }, [isHighRisk, history, mailText])
  return <Slider
    bulletColor={colors.MEDIUM_GREY} bulletSelectColor="#000" slideStyle={slideStyle}
    onFastForward={handleNextButton} bottomComponent={BottomButton}>
    {(isHighRisk ? sliderHighRiskContent : sliderLowRiskContent).map(
      ({content, numImportantInstructions, title}, index) => <React.Fragment key={index}>
        <div style={titleStyle}>{translate(title)}</div>
        {content}
        <ImportantInstructions numInstructions={numImportantInstructions} />
      </React.Fragment>,
    )}
    <React.Fragment key="last-screen">
      {isHighRisk ? <React.Fragment>
        <Trans style={{fontSize: 25, fontWeight: 'bold', margin: '0 30px', textAlign: 'center'}}>
          Maintenant que vous avez pris vos précautions, il
          est vital de <span style={{color: colors.FOREST_GREEN}}>notifier vos contacts</span> à
          votre tour.
        </Trans>
      </React.Fragment> : <React.Fragment>
        <div style={titleStyle}>{translate('On vous accompagne de bout en bout')}</div>
        <div style={{margin: '0 20px'}}>
          <div>
            <Step
              icon={LineChartLineIcon}
              text={translate('Diagnostic régulier de vos symptômes')} />
            <Step
              icon={ShieldCrossFillIcon}
              text={translate('Suivi(e) au premier signe de covid-19')} />
            <Step
              icon={HandHeartFillIcon}
              text={translate('100% gratuit et anonyme')} />
          </div>
          <div style={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
            <div
              onClick={handleNextButton}
              style={{...darkButtonStyle, marginTop: 40}}>
              {translate('Être suivi(e) pendant 14j')}
            </div>
            <PrivacyNote text={translate('Nous ne partagerons aucune information')} />
            <Link to={Routes.COME_BACK_LATER} style={veryDiscreetLinkStyle}>
              {translate('Non merci')}
            </Link>
          </div>
        </div>
      </React.Fragment>
      }
    </React.Fragment>
  </Slider>
}
const FollowUpPage = React.memo(FollowUpPageBase)

export default FollowUpPage
