import CheckLineIcon from 'remixicon-react/CheckboxCircleFillIcon'
import React, {useCallback, useMemo} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'

import {useFastForward} from 'hooks/fast_forward'
import {finishMemoryAction, useDispatch} from 'store/actions'
import {useNumPeopleToAlert} from 'store/selections'
import {getPath} from 'store/url'

import {darkButtonStyle} from 'components/buttons'
import {BottomDiv, PedagogyLayout, mobileOnDesktopStyle} from 'components/navigation'
import TopBar from 'components/top_bar'


const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  margin: 'auto',
  maxWidth: 700,
  minHeight: window.innerHeight,
}


const MemoryOutroPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const dispatch = useDispatch()
  const history = useHistory()
  const totalContactsCount = useNumPeopleToAlert()
  const title = useMemo(() => <Trans style={{fontFamily: 'Poppins', fontSize: 22, fontWeight: 800}}>
    Félicitations&nbsp;!<br />
    Votre liste est prête
  </Trans>, [])
  const subtitle = t(
    "Il ne reste plus qu'à alerter cette personne.", {count: totalContactsCount})
  const handleNext = useCallback((): void => {
    dispatch(finishMemoryAction)
    history.push(getPath('CONTACTS_LIST', t))
  }, [dispatch, history, t])
  useFastForward(handleNext)
  return <div style={pageStyle}>
    <TopBar progress={2} />
    <PedagogyLayout
      title={title} subtitle={subtitle} icon={CheckLineIcon} iconColor={colors.MINTY_GREEN} />
    <BottomDiv defaultHeight={80}>
      <div style={{margin: 20}}>
        <div style={{...darkButtonStyle, ...mobileOnDesktopStyle}} onClick={handleNext}>
          {t('La prévenir', {count: totalContactsCount})}
        </div>
      </div>
    </BottomDiv>
  </div>
}
const MemoPage = React.memo(MemoryOutroPage)

export default MemoPage
