import React from 'react'
import ReactMarkdown from 'react-markdown'
import {useTranslation} from 'react-i18next'

import privacyContent from './privacy.txt'


const PrivacyPage = (): React.ReactElement => {
  const {t: translate} = useTranslation()
  return <div style={{padding: '40px 30px'}}>
    <ReactMarkdown source={translate(privacyContent, {
      productName: config.productName,
    })} />
  </div>
}


export default React.memo(PrivacyPage)
