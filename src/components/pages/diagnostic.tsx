import React, {useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router'

import {useFastForward} from 'hooks/fast_forward'
import {diagnose, useDispatch} from 'store/actions'
import {localizeOptions} from 'store/i18n'
import {SYMPTOMS} from 'store/symptoms'
import {Routes} from 'store/url'

import {darkButtonStyle} from 'components/buttons'
import CheckboxList from 'components/checkbox_list'
import {BottomDiv, PageWithNav} from 'components/navigation'


const boldStyle: React.CSSProperties = {fontWeight: 'bold'}
// TODO(pascal): Factorize this style somewhere.
const mobileOnDesktopStyle: React.CSSProperties = {
  margin: 'auto',
  maxWidth: 420,
}


const DiagnosticPageBase = (): React.ReactElement => {
  const {t} = useTranslation()
  const [selectedOptions, setSelected] = useState<readonly bayes.casContact.Symptom[]>([])
  const hasSelection = !!selectedOptions.length
  const history = useHistory()
  const dispatch = useDispatch()

  const onNext = useCallback((): void => {
    if (!hasSelection) {
      return
    }
    dispatch(diagnose(selectedOptions))
    history.push(Routes.DIAGNOSTIC_OUTCOME)
  }, [dispatch, hasSelection, history, selectedOptions])
  useFastForward((): void => {
    if (!hasSelection) {
      setSelected(['SHORT_BREATH'])
      return
    }
    onNext()
  }, [hasSelection, onNext])
  const updateSelected = useCallback((newSelection: readonly bayes.casContact.Symptom[]): void => {
    setSelected((previousSelected: readonly bayes.casContact.Symptom[]) => {
      const hadNoSymptoms = previousSelected.includes('NO_SYMPTOMS')
      const hasNoSymptoms = newSelection.includes('NO_SYMPTOMS')
      // Unselect "NO_SYMPTOMS" if user selects another symptoms.
      if (hadNoSymptoms && newSelection.length !== 1 && hasNoSymptoms) {
        return newSelection.filter((symptom): boolean => symptom !== 'NO_SYMPTOMS')
      }
      // Unselect all other symptoms if user selects "NO_SYMPTOMS".
      if (!hadNoSymptoms && hasNoSymptoms) {
        return ['NO_SYMPTOMS']
      }
      return newSelection
    })
  }, [])
  const buttonContainerStyle: React.CSSProperties = {
    ...mobileOnDesktopStyle,
    opacity: hasSelection ? 1 : 0,
    pointerEvents: hasSelection ? undefined : 'none',
    transition: '200ms',
  }
  return <PageWithNav>
    <section style={{alignSelf: 'stretch'}}>
      <header style={{marginBottom: 20}}>
        <h2>{t('Quels sont vos symptômes\u00A0?')}</h2>
        {t('Cochez les symptômes que vous avez')}
      </header>
      <CheckboxList
        options={localizeOptions(t, SYMPTOMS)}
        selectedCheckboxStyle={boldStyle}
        values={selectedOptions} onChange={updateSelected} />
    </section>
    <BottomDiv>
      <div style={buttonContainerStyle}>
        <div style={darkButtonStyle} onClick={onNext}>
          {t('Continuer')}
        </div>
      </div>
    </BottomDiv>
  </PageWithNav>
}
const DiagnosticPage = React.memo(DiagnosticPageBase)

export default DiagnosticPage
