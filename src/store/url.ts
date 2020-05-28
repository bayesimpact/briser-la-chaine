// TODO(cyrille): Move to store.
const Routes: {[varName: string]: string} = {
  ROOT: '/',
}

// TODO(cyrille): Make routes with several segments, rather than hyphenated names.
Routes.CALENDAR = Routes.ROOT + 'calendrier'
Routes.COME_BACK_LATER = Routes.ROOT + 'plus-tard'
Routes.CONTACTS_LIST = Routes.ROOT + 'liste-contacts'
Routes.CONTACTS_SEARCH = Routes.ROOT + 'recherche-contacts'
Routes.DIAGNOSED_SPLASH = Routes.ROOT + 'positif'
Routes.DIAGNOSTIC = Routes.ROOT + 'symptomes'
Routes.DIAGNOSTIC_OUTCOME = Routes.ROOT + 'resultat-diagnostic'
Routes.FINAL = Routes.ROOT + 'merci'
Routes.FOLLOW_UP = Routes.ROOT + 'suivi'
Routes.HEALTH_STATUS = Routes.ROOT + 'statut'
Routes.HIGH_RISK_SPLASH = Routes.ROOT + 'probablement'
Routes.MEMORY_OUTRO = Routes.ROOT + 'validation-contacts'
Routes.MODERATE_RISK_SPLASH = Routes.ROOT + 'peut-etre'
Routes.PEDAGOGY_INTRO = Routes.ROOT + 'intro'
Routes.PEDAGOGY_OUTRO = Routes.ROOT + 'intro-recherche-contacts'
Routes.PRIVACY = Routes.ROOT + 'confidentialite'
Routes.REFERRAL = Routes.ROOT + 'envoi-ami'
Routes.SPLASH = Routes.ROOT + 'accueil'
Routes.SYMPTOMS_ONSET = Routes.ROOT + 'debut-symptomes'
Routes.TERMS = Routes.ROOT + 'cgu'


const Params: {[varName: string]: string} = {
  DEPTH: 'p',
} as const


export {Params, Routes}
