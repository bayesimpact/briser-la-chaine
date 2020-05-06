import React from 'react'
import ReactDOMServer from 'react-dom/server'

const description = `${config.productName} vous aide à retrouver et prévenir les contacts que ` +
  "vous avez eu. 100% gratuit, rapide et fait par l'ONG Bayes Impact"

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
      <meta property="og:title" content={config.productName} />
      <meta property="og:description" name="description" content={description} />
      {/* TODO(cyrille): add og:image and og:url properties*/}
      <meta property="fb:app_id" content={config.facebookSSOAppId} />
    </head>
    <body style={{margin: 0}}>
      <div id="app">{/* TODO(cyrille): Add a static element here. */}</div>
    </body>
  </html>)
