import CheckLineIcon from 'remixicon-react/CheckLineIcon'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'

import {useFastForward} from 'hooks/fast_forward'
import {useNumPeopleToAlert} from 'store/selections'
import {Routes} from 'store/url'

import {PedagogyPage} from 'components/navigation'


const MemoryOutroPage = (): React.ReactElement => {
  const {t} = useTranslation()
  const history = useHistory()
  const totalContactsCount = useNumPeopleToAlert()
  const title = t('Félicitations\u00A0! ' +
    'Votre liste de contacts est prête')
  const subtitle = t(
    "Il ne vous reste plus qu'à alerter cette personne.", {count: totalContactsCount})
  const handleNext = useCallback((): void => {
    history.push(Routes.CONTACTS_LIST)
  }, [history])
  useFastForward(handleNext)
  return <PedagogyPage
    title={title} subtitle={subtitle} icon={CheckLineIcon}
    nextButton={t('La prévenir', {count: totalContactsCount})}
    onNext={handleNext}>
  </PedagogyPage>
}
const MemoPage = React.memo(MemoryOutroPage)

export default MemoPage
