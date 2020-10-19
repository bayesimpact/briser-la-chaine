// The source of this file is in cas-contact-internal git repo:
// release/opengraph_redirect.ts
// and should be deployed using the release/deploy_lambda.sh script.

const diseaseName = 'COVID-19'

// TODO(cyrille): Make sure these are always in a translation file.
const ogElements = {
  'en-US': {
    description: "We're going to help you notify the people you've come into contact with during " +
      'your contagious period. It will just take a few minutes.',
    title: `Break the ${diseaseName} chains of transmission`,
  },
  'fr-FR': {
    description: 'Nous vous aidons à contacter les personnes croisées pendant votre ' +
      'période contagieuse en quelques minutes.',
    productName: 'BriserLaChaine.org',
    title: `Briser les chaînes de contamination du ${diseaseName}`,
  },
  'pt-BR': {
    description: 'Ajudaremos você a entrar em contato com as pessoas que cruzaram seu caminho ' +
      'durante seu período contagioso em poucos minutos.',
    title: `Rompendo as cadeias de contaminação da ${diseaseName}`,
  },
}

function isOpenGraphBot(userAgent) {
  return /facebot|facebookexternalhit|slackbot|twitterbot|linkedinbot/.test(
    userAgent.value.toLowerCase())
}

function getPageDescription(locale, pageUrl) {
  const {description, productName = 'Conotify.org', title} = ogElements[locale]
  const baseUrl = `https://www.${productName}`
  return {
    description,
    image: `${baseUrl}/assets/snippet.${locale}.png`,
    title: `${productName} \u2014 ${title}`,
    url: `${baseUrl}/${pageUrl}`,
  }
}

const localeParam = 'fb_locale='
const extractOGLocale = (pageUrl) => {
  const paramIndex = pageUrl.indexOf(localeParam)
  if (paramIndex < 0) {
    return 'fr-FR'
  }
  return pageUrl.
    slice(paramIndex + localeParam.length).
    split(/[#&]/)[0].
    replace('_', '-') || 'fr-FR'
}

function openGraphContent(pageUrl) {
  const locale = extractOGLocale(pageUrl)
  const {description, image, title, url} = getPageDescription(locale, pageUrl)
  return `<html>
    <head>
      <title>${title}</title>
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="pt_BR" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:url" content="${url}" />
      <meta property="og:image" content="${image}" />
      <meta property="fb:app_id" content="1576288225722008" />
    </head>
  </html>`
}

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request
  const userAgents = request.headers['user-agent'] || []
  if (!userAgents.some(isOpenGraphBot)) {
    request.uri = '/index.html'
    return callback(null, request)
  }

  const pageUrl = request.uri.slice(1)
  // eslint-disable-next-line no-console
  console.log('OpenGraph bot served for page: ' + request.uri)
  const response = {
    body: openGraphContent(pageUrl),
    headers: {
      'content-type': [{
        key: 'Content-Type',
        value: 'text/html; charset=UTF-8',
      }],
    },
    status: '200',
    statusDescription: 'OK',
  }
  callback(null, response)
}
