import jsPDF from 'jspdf'
import {useCallback} from 'react'
import {useTranslation} from 'react-i18next'

import {useSelector} from 'store/selections'


function usePDFDownloader(): (() => void) {
  const state = useSelector((state: RootState): RootState => state)
  const {t} = useTranslation()
  return useCallback((): void => {
    const doc = new jsPDF()
    // FIXME(pascal): Use state.
    if (state) {
      doc.text(20, 20, 'Hello world.')
    }
    doc.save(t('Récapitulatif {{productName}}.pdf', {productName: config.productName}))
  }, [state, t])
}


export {usePDFDownloader}
