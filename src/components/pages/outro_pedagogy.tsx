import UserSearchFillIcon from 'remixicon-react/UserSearchFillIcon'
import React, {useCallback} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'

import {useFastForward} from 'hooks/fast_forward'
import {Routes} from 'store/url'

import {PedagogyPage} from 'components/navigation'


const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 'normal',
}
const subTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 'normal',
}
const strongStyle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontWeight: 800,
}

const PedagogyOutroPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const history = useHistory()
  useFastForward(undefined, undefined, Routes.SYMPTOMS_ONSET)
  const handleNext = useCallback(() => history.push(Routes.SYMPTOMS_ONSET), [history])
  return <PedagogyPage
    title={<Trans style={titleStyle}>
      Retrouvons toutes les personnes croisées pendant votre <strong style={strongStyle}>
        période contagieuse
      </strong>.
    </Trans>}
    subtitle={<div style={subTitleStyle}>{t(
      'Ne vous inquiétez pas, nous allons vous aider à les retrouver, puis à les contacter.',
    )}</div>}
    icon={UserSearchFillIcon} nextButtonColor={colors.MINTY_GREEN}
    onNext={handleNext} nextButton={t('Calculer ma période contagieuse')} />
}


export default React.memo(PedagogyOutroPage)
