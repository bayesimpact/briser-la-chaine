import React from 'react'
import ReactMarkdown from 'react-markdown'
import {useTranslation} from 'react-i18next'

import {Routes} from 'store/url'

import termsContent from './terms.txt'


// This is a top level page and should be nested only with caution.
// TOP LEVEL PAGE
const TermsPage = (props: {style?: React.CSSProperties}): React.ReactElement => {
  const {t: translate} = useTranslation()
  const {style = {padding: '40px 30px'}} = props
  return <div style={style}>
    <ReactMarkdown source={translate(termsContent, {
      canonicalUrl: config.canonicalUrl,
      diseaseName: config.diseaseName,
      owner: 'Bayes Impact France'.toLocaleUpperCase(),
      privacyPageUrl: Routes.PRIVACY,
      productName: config.productName.toLocaleUpperCase(),
    })} />
  </div>
}


export default React.memo(TermsPage)
