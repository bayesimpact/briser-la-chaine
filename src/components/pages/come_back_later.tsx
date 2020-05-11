import React, {useCallback} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'
import FileList2FillIcon from 'remixicon-react/FileList2FillIcon'
import WindowFillIcon from 'remixicon-react/WindowFillIcon'

import {useFastForward} from 'hooks/fast_forward'

import {darkButtonStyle} from 'components/buttons'
import {BottomDiv} from 'components/navigation'
import {IconBox} from 'components/pages/follow_up'


const pageStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  margin: '0 auto',
  maxWidth: 700,
  minHeight: window.innerHeight,
}
const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 'bold',
  maxWidth: 250,
  textAlign: 'center',
}
const contentContainerStyle: React.CSSProperties = {
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  justifyContent: 'center',
  padding: '0 18px',
}
const mobileOnDesktopStyle: React.CSSProperties = {
  margin: 'auto',
  maxWidth: 420,
  padding: '0 20px',
}


// TOP LEVEL PAGE
const ComeBackLaterPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const history = useHistory()
  const goBack = useCallback((): void => {
    history.goBack()
  }, [history])
  useFastForward(goBack)
  return <div style={pageStyle}>
    <div />
    <Trans style={titleStyle}>
      Si des symptômes apparaissent, il est vital
      de <span style={{color: colors.VIBRANT_GREEN}}>prévenir vos contacts</span> à votre tour.
    </Trans>
    <div style={contentContainerStyle}>
      <IconBox
        icon={WindowFillIcon}
        text={t('Revenez sur le site pour faire votre diagnostic')} />
      <IconBox
        icon={FileList2FillIcon}
        text={t('Commencez à faire la liste des personnes que vous avez croisées')} />
    </div>
    <BottomDiv>
      <div style={mobileOnDesktopStyle}>
        <div style={darkButtonStyle} onClick={goBack}>
          {t('Précédent')}
        </div>
      </div>
    </BottomDiv>
  </div>
}


export default React.memo(ComeBackLaterPage)
