import React from 'react'
import ReactMarkdown from 'react-markdown'
import {useTranslation} from 'react-i18next'

import termsContent from './terms.txt'


const TermsPage = (): React.ReactElement => {
  const {t: translate} = useTranslation()
  return <div style={{padding: '40px 30px'}}>
    <ReactMarkdown source={translate(termsContent, {
      canonicalUrl: config.canonicalUrl,
      owner: 'Bayes Impact France'.toLocaleUpperCase(),
      productName: config.productName.toLocaleUpperCase(),
    })} />
  </div>
}


export default React.memo(TermsPage)
