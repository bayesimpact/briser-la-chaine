import React from 'react'
import ReactMarkdown from 'react-markdown'
import {useTranslation} from 'react-i18next'

import {STATIC_NAMESPACE, useFixedTranslation} from 'store/i18n'


// This is a top level page and should be nested only with caution.
// TOP LEVEL PAGE
const PrivacyPage = (props: {style?: React.CSSProperties}): React.ReactElement => {
  const {t} = useTranslation()
  const [translate] = useFixedTranslation(STATIC_NAMESPACE)
  const {style = {padding: '40px 30px'}} = props
  return <div style={style}>
    <ReactMarkdown source={translate('privacy', {
      diseaseName: config.diseaseName,
      productName: t('productName'),
    })} />
  </div>
}


export default React.memo(PrivacyPage)
