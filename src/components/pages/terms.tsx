import React from 'react'
import ReactMarkdown from 'react-markdown'
import {useTranslation} from 'react-i18next'

import termsContent from './terms.txt'


const TermsPage = (props: {style?: React.CSSProperties}): React.ReactElement => {
  const {t: translate} = useTranslation()
  const {style = {padding: '40px 30px'}} = props
  return <div style={style}>
    <ReactMarkdown source={translate(termsContent, {
      canonicalUrl: config.canonicalUrl,
      owner: 'Bayes Impact France'.toLocaleUpperCase(),
      productName: config.productName.toLocaleUpperCase(),
    })} />
  </div>
}


export default React.memo(TermsPage)
