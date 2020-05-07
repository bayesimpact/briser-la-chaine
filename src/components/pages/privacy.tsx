import React from 'react'
import ReactMarkdown from 'react-markdown'
import {useTranslation} from 'react-i18next'

import privacyContent from './privacy.txt'


const PrivacyPage = (props: {style?: React.CSSProperties}): React.ReactElement => {
  const {t: translate} = useTranslation()
  const {style = {padding: '40px 30px'}} = props
  return <div style={style}>
    <ReactMarkdown source={translate(privacyContent, {
      productName: config.productName,
    })} />
  </div>
}


export default React.memo(PrivacyPage)
