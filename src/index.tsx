import React from 'react'
import ReactDOMServer from 'react-dom/server'

import faviconImage from 'images/favicon.png'
import snippetImage from 'images/snippet.png'

const description = 'Nous vous aidons à contacter les personnes croisées pendant votre période ' +
  'contagieuse en quelques minutes.'

export default (): string => '<!doctype html>' + ReactDOMServer.renderToString(
  <html lang="fr">
    <head>
      <meta charSet="utf-8" />
      <title>{config.productName}</title>
      <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        id="viewport" />
      <meta property="og:type" content="website" />
      <meta
        property="og:title"
        content={`Briser la chaîne de contamination du ${config.diseaseName}`} />
      <meta property="og:description" name="description" content={description} />
      <meta property="og:image" content={`https://${config.canonicalUrl}${snippetImage}`} />
      <meta property="og:url" content={`https://${config.canonicalUrl}`} />
      <meta property="fb:app_id" content={config.facebookSSOAppId} />
      <link rel="icon" href={faviconImage} type="image/png" />
    </head>
    <body style={{margin: 0}}>
      <div id="app">{/* TODO(cyrille): Add a static element here. */}</div>
    </body>
  </html>)
