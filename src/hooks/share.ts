import {useTranslation} from 'react-i18next'


function useDefaultShareText(): string {
  const {t} = useTranslation()
  return t(
    "J'ai découvert un site créé par une ONG pour briser la chaîne de contamination du Covid-19. " +
    'Si vous avez des symptômes du virus, je vous le recommande vraiment\u00A0: {{url}} ' +
    "Il permet de prévenir les personnes qu'on a peut-être contaminées des mesures qu'il faut " +
    'prendre, sans aucun traçage de données\u00A0!',
    {url: config.canonicalUrl},
  )
}


export {useDefaultShareText}
