import React from 'react'
import ReactMarkdown from 'react-markdown'
import {useTranslation} from 'react-i18next'

import {STATIC_NAMESPACE, useFixedTranslation} from 'store/i18n'
import {getPath} from 'store/url'


// This is a top level page and should be nested only with caution.
// TOP LEVEL PAGE
const TermsPage = (props: {style?: React.CSSProperties}): React.ReactElement => {
  const {t} = useTranslation()
  const [translate] = useFixedTranslation(STATIC_NAMESPACE)
  const {style = {padding: '40px 30px'}} = props
  return <div style={style}>
    <ReactMarkdown source={translate('termsOfService', {
      canonicalUrl: t('canonicalUrl'),
      diseaseName: config.diseaseName,
      owner: 'Bayes Impact France'.toLocaleUpperCase(),
      privacyPageUrl: getPath('PRIVACY', t),
      productName: t('productName').toLocaleUpperCase(),
    })} />
  </div>
}


export default React.memo(TermsPage)
