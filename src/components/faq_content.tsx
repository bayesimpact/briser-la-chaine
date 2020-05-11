import React from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'

import {Routes} from 'store/url'


interface FAQParagraphProps {
  content: React.ReactElement
  isMobileVersion: boolean
  title: string
}
const titleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
}
const contentStyle: React.CSSProperties = {
  fontSize: 16,
  lineHeight: '1.38em',
  marginBottom: 40,
}

const FAQParagraphBase = (props: FAQParagraphProps): React.ReactElement => {
  const {content, isMobileVersion, title} = props
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    marginRight: isMobileVersion ? 0 : 80,
  }
  return <div style={containerStyle}>
    <div style={titleStyle}>{title}</div>
    <div style={contentStyle}>{content}</div>
  </div>
}
const FAQParagraph = React.memo(FAQParagraphBase)


interface FAQContentProps {
  isMobileVersion: boolean
}
const discreetLinkStyle: React.CSSProperties = {
  color: 'inherit',
}
const FAQContent = ({isMobileVersion}: FAQContentProps): React.ReactElement => {
  const {t} = useTranslation()
  return <div style={{display: 'flex', flexDirection: 'column', marginTop: 0}}>
    <Trans parent="h2" style={{fontSize: 40, fontWeight: 'bold'}}>FAQ</Trans>
    <div style={{columnCount: isMobileVersion ? 1 : 2}}>
      <FAQParagraph
        isMobileVersion={isMobileVersion}
        title={t("Qui est à l'origine de {{productName}}\u00A0?",
          {productName: config.productName})}
        content={<Trans>
          Ce site web à été conçu par l'ONG <a
            href="https://www.bayesimpact.org" target="_blank" rel="noopener noreferrer"
            style={discreetLinkStyle}>
            Bayes Impact
          </a>.
        </Trans>} />
      <FAQParagraph
        isMobileVersion={isMobileVersion}
        title={t('Pourquoi prévenir mes proches si je suis malade\u00A0?')}
        content={<Trans>
          Le covid-19 est un virus facilement transmissible. Même si vous ne ressentez vos
          symptômes que maintenant, vous avez peut-être déjà commencé à contaminer des personnes
          dans les jours passés. Les prévenir, c'est leur permettre d'être plus attentifs à leur
          état de santé et à leurs proches. Les prévenir, c'est également ralentir la contamination
          et éviter une deuxième vague d'infection.
        </Trans>} />
      <FAQParagraph
        isMobileVersion={isMobileVersion}
        title={t('Comment nous vous aidons à briser la chaine de contamination\u00A0?')}
        content={<Trans>
          Nous vérifions d'abord vos symptômes afin d'évaluer votre niveau de contamination. Puis
          nous vous aidons à vous souvenir pas à pas des personnes que vous avez pu croiser
          durant votre période de contagiosité. Enfin, nous vous proposons des façons de contacter
          ces personnes, anonyment ou non, selon votre choix.
        </Trans>} />
      <FAQParagraph
        isMobileVersion={isMobileVersion}
        title={t('Comment nous protégeons votre vie privée\u00A0?')}
        content={<Trans>
          Pour nous, votre vie privée est aussi importante que votre santé. Nous ne conservons ni
          ne transmettons vos données personnelles. Nous n'installons aucun traçage GPS ou
          bluetooth.
          Plus d'information par <Link style={discreetLinkStyle} to={Routes.PRIVACY}>ici</Link>.
        </Trans>} />
      <FAQParagraph
        isMobileVersion={isMobileVersion}
        title={t(
          'Comment nous vous aidons à savoir si vous êtes atteint(e) du coronavirus\u00A0?')}
        content={<Trans>
          Nous vous permettons de bien évaluer vos symptômes pour mieux comprendre votre
          situation. Si nous pensons que vous n'êtes pas atteint(e) du coronavirus, vous pourrez
          revenir à tout moment si de nouveaux symptômes apparaissent.
        </Trans>} />
    </div>
  </div>
}
export default React.memo(FAQContent)
