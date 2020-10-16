// eslint-disable-next-line import/no-duplicates
import {format as dateFormat, formatDistance} from 'date-fns'
import {enUS as enDateLocale, es as esDateLocale, fr as frDateLocale,
// eslint-disable-next-line import/no-duplicates
  ptBR as ptBRDateLocale} from 'date-fns/locale'
import i18next, {InitOptions, ReadCallback, ResourceKey, Services, TFunction,
  TOptions, i18n} from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import _memoize from 'lodash/memoize'
import {useEffect, useMemo, useState} from 'react'
import {UseTranslationResponse, UseTranslationOptions, initReactI18next,
  useTranslation} from 'react-i18next'

import pngLogo from 'images/logo.png'
import pngLogoEn from 'images/logo-en.png'
import svgLogo from 'images/logo.svg'
import svgLogoEn from 'images/logo-en.svg'


// Backend for i18next to load resources for languages only when they are needed.
// It takes a backend config with a promise per language and per namespace.
class PromiseI18nBackend {
  public static type = 'backend' as const

  private importFunc: PromiseImportFunc|undefined

  public init(services: Services, backendOptions: PromiseImportFunc): void {
    this.importFunc = backendOptions
  }

  public read(language: string, namespace: string, callback: ReadCallback): void {
    if (!this.importFunc) {
      callback(null, {})
      return
    }
    this.importFunc(language, namespace).
      then((resources): void => callback(null, resources.default)).
      catch((): void => callback(null, {}))
  }
}

// Whether this is the international version (with locale detection) or the French one.
const isInternational = document.documentElement.getAttribute('lang') !== 'fr'

const updateDomLang = (lang: string): void => {
  document.documentElement.setAttribute('lang', lang)
}

// Third party module for i18next to update the "lang" attribute of the document's root element
// (usually html) so that it stays in sync with i18next language.
const UpdateDocumentElementLang = {
  init: (i18next: i18n): void => {
    updateDomLang(i18next.language)
    i18next.on('languageChanged', updateDomLang)
  },
  type: '3rdParty',
} as const

const whitelist = ['fr', 'en', 'es', 'pt', 'pt-BR'] as const
type LocaleKey = (typeof whitelist)[number]

const STATIC_NAMESPACE = 'static'
const importStatic = (lang: string): Promise<{default: ResourceKey}> => {
  const privacy = import(`translations/${lang}/privacy.txt`)
  const terms = import(`translations/${lang}/terms.txt`)
  return Promise.all([privacy, terms]).then(
    ([{default: privacy}, {default: termsOfService}]) => ({default: {privacy, termsOfService}}))
}

const init = (initOptions?: InitOptions): void => {
  i18next.
    use(initReactI18next).
    use(LanguageDetector).
    use(PromiseI18nBackend).
    use(UpdateDocumentElementLang).
    init({
      backend: (language: string, namespace: string): Promise<{default: ResourceKey}> =>
        namespace === STATIC_NAMESPACE ? importStatic(language) :
          import(`translations/${language}/${namespace}_i18next.json`),
      detection: {
        lookupQuerystring: 'hl',
        ...isInternational ? {} : {order: ['querystring']},
      },
      fallbackLng: isInternational ? 'en' : 'fr',
      interpolation: {
        escapeValue: false,
      },
      keySeparator: false,
      nsSeparator: false,
      react: {
        defaultTransParent: 'div',
      },
      saveMissing: false,
      // TODO(cyrille): Update i18next to allow readonly whitelist.
      whitelist: [...whitelist],
      ...initOptions,
    })
}


// Make sure that a given namespace for the current language is loaded.
// If it's not, a Suspense should catch this to wait for the loading to be complete.
const prepareNamespace = (ns: string): void => {
  if (i18next.hasResourceBundle(i18next.language, ns)) {
    return
  }
  // This should be caught by a Suspense.
  throw new Promise((resolve) => {
    i18next.loadNamespaces([ns], resolve)
  })
}


// This type is just a marker for a string that will be extracted for translation,
// so it should be translated.
interface Localizable {
  __unreachable?: never
}
export type LocalizableString<T extends string = string> = T & Localizable

export interface WithLocalizableName<T extends string = string> {
  readonly name: LocalizableString<T>
}

function localizeOptions<T extends WithLocalizableName>(
  translate: TFunction, options: readonly T[], tOptions?: TOptions):
  readonly (Omit<T, 'name'> & {name: string})[] {
  return options.map(({name, ...other}) => ({name: translate(name, tOptions), ...other}))
}

// Marker for string to be extracted for translation.
function prepareT<T extends string = string>(str: T, unusedOptions?: TOptions):
LocalizableString<T> {
  return str as LocalizableString<T>
}


// Returns the language currently in use, without dialect markers.
// For example, if locale is fr@tu, will return fr.
const getLanguage = (locale?: string): string =>
  (locale || i18next?.languages?.[0] || 'fr').replace(/@.*$/, '')


type PromiseImportFunc = (language: string, namespace: string) => Promise<{default: ResourceKey}>


const locales: {[K in LocaleKey]: typeof enDateLocale} = {
  'en': enDateLocale,
  'es': esDateLocale,
  'fr': frDateLocale,
  'pt': ptBRDateLocale,
  'pt-BR': ptBRDateLocale,
} as const

interface RelativeLocale {
  lastWeek: string
  nextWeek: string
  today: string
  tomorrow: string
  yesterday: string
}

const formatRelativeLocale = (t: TFunction): RelativeLocale => ({
  lastWeek: t("{{dayOfWeek}} 'dernier'", {dayOfWeek: 'eeee'}),
  nextWeek: t("{{dayOfWeek}} 'prochain'", {dayOfWeek: 'eeee'}),
  today: t("'aujourd''hui'"),
  tomorrow: t("'demain''"),
  yesterday: t("'hier'"),
})

type Token = keyof RelativeLocale | 'other'

export type LocaleOption = {
  locale: typeof frDateLocale
}

// This is the date locale for date-fns i18n.
const createDateOption = (t: TFunction, language: string): LocaleOption => ({
  locale: {
    ...(locales[language as LocaleKey] || locales.fr),
    formatRelative: (token: Token, date: Date|number, baseDate: Date|number): string => {
      if (token === 'other') {
        return `'${formatDistance(
          date, baseDate, {
            addSuffix: true,
            locale: locales[language as LocaleKey] || locales.fr,
          },
        )}'`
      }
      return formatRelativeLocale(t)[token]
    },
  },
})


function useDateOption(): LocaleOption {
  const {t, i18n} = useTranslation()
  return useMemo(() => createDateOption(t, i18n.language), [i18n, t])
}


const extractSeparator = _memoize((listString: string): readonly [string, string] => {
  const parts = listString.split(/<\d><\/\d>/)
  if (parts.length !== 4) {
    return [', ', ' et ']
  }
  return parts.slice(1, 3) as [string, string]
})


function joinDays(
  days: readonly Date[], format: string, t: TFunction, dateOption: LocaleOption): string {
  const [separator, lastSeparator] = extractSeparator(t('<0></0>, <1></1> et <2></2>'))
  const formattedDays = days.map((day: Date): string => dateFormat(day, format, dateOption))
  if (formattedDays.length <= 1) {
    return formattedDays.join(lastSeparator)
  }
  return formattedDays.slice(0, -1).join(separator) + lastSeparator + formattedDays.slice(-1)[0]
}

const IMAGE_NAMESPACE = 'image'
i18next.on('initialized', () => {
  i18next.addResourceBundle('en', IMAGE_NAMESPACE, {
    [pngLogo]: pngLogoEn,
    [svgLogo]: svgLogoEn,
  })
})


// TODO(cyrille): Fix useTranslation in react-i18next.
const useFixedTranslation = (ns: string | string[] | undefined, options?: UseTranslationOptions):
UseTranslationResponse => {
  const translation = useTranslation(ns, {...options, useSuspense: false})
  const refresh = useState({})[1]
  useEffect(() => refresh({}), [translation.ready, refresh])
  return translation
}

export {init, useDateOption, getLanguage, joinDays, localizeOptions, prepareT, prepareNamespace,
  IMAGE_NAMESPACE, STATIC_NAMESPACE, useFixedTranslation}
