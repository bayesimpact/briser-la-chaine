// eslint-disable-next-line import/no-duplicates
import {format as dateFormat, formatDistance} from 'date-fns'
// eslint-disable-next-line import/no-duplicates
import {enUS as enDateLocale, fr as frDateLocale} from 'date-fns/locale'
import i18next, {InitOptions, ReadCallback, ResourceKey, Services, TFunction, TOptions,
  i18n} from 'i18next'
import _memoize from 'lodash/memoize'
import {initReactI18next, useTranslation} from 'react-i18next'

import privacyContent from 'components/pages/privacy.txt'
import privacyContentEn from 'components/pages/privacy_en.txt'
import tosContent from 'components/pages/terms.txt'
import tosContentEn from 'components/pages/terms_en.txt'
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


const updateDomLang = (lang: string): void =>
  document.documentElement.setAttribute('lang', lang)


// Third party module for i18next to update the "lang" attribute of the document's root element
// (usually html) so that it stays in sync with i18next language.
const UpdateDocumentElementLang = {
  init: (i18next: i18n): void => {
    updateDomLang(i18next.language)
    i18next.on('languageChanged', updateDomLang)
  },
  type: '3rdParty',
} as const


const init = (initOptions?: InitOptions): void => {
  i18next.
    use(initReactI18next).
    use(PromiseI18nBackend).
    use(UpdateDocumentElementLang).
    init({
      backend: (language: string, namespace: string): Promise<{default: ResourceKey}> =>
        import(`translations/${language}/${namespace}_i18next.json`),
      fallbackLng: 'fr',
      interpolation: {
        escapeValue: false,
      },
      keySeparator: false,
      nsSeparator: false,
      react: {
        defaultTransParent: 'div',
      },
      saveMissing: false,
      whitelist: ['fr', 'en'],
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


const locales = {
  en: enDateLocale,
  fr: frDateLocale,
} as const


const formatRelativeLocale = {
  en: {
    lastWeek: "'last' eeee",
    nextWeek: "'next' eeee",
    today: "'today'",
    tomorrow: "'tomorrow''",
    yesterday: "'yesterday'",
  },
  fr: {
    lastWeek: "eeee 'dernier'",
    nextWeek: "eeee 'prochain'",
    today: "'aujourd''hui'",
    tomorrow: "'demain''",
    yesterday: "'hier'",
  },
} as const

type LocaleKey = keyof typeof locales

type Token = keyof typeof formatRelativeLocale['en'] | 'other'

type LocaleOption = {
  locale: typeof frDateLocale
}

// This is the date locale for date-fns i18n.
const createDateOption = _memoize((language: string): LocaleOption => ({
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
      return (formatRelativeLocale[language as LocaleKey] || formatRelativeLocale.fr)[token]
    },
  },
}))


function useDateOption(): LocaleOption {
  const {i18n} = useTranslation()
  return createDateOption(i18n.language)
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
const STATIC_NAMESPACE = 'static'
i18next.on('initialized', () => {
  i18next.addResourceBundle('en', IMAGE_NAMESPACE, {
    [pngLogo]: pngLogoEn,
    [svgLogo]: svgLogoEn,
  })
  i18next.addResourceBundle('fr', STATIC_NAMESPACE, {
    privacy: privacyContent,
    termsOfService: tosContent,
  })
  i18next.addResourceBundle('en', STATIC_NAMESPACE, {
    privacy: privacyContentEn,
    termsOfService: tosContentEn,
  })
})


export {init, useDateOption, getLanguage, joinDays, localizeOptions, prepareT, prepareNamespace,
  IMAGE_NAMESPACE, STATIC_NAMESPACE}
