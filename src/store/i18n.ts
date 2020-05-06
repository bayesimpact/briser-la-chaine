// eslint-disable-next-line import/no-duplicates
import {formatDistance} from 'date-fns'
// eslint-disable-next-line import/no-duplicates
import {fr as frDateLocale} from 'date-fns/locale'
import i18next, {InitOptions, ReadCallback, ResourceKey, Services, TFunction, TOptions,
  i18n} from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import {initReactI18next} from 'react-i18next'

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
    use(LanguageDetector).
    use(PromiseI18nBackend).
    use(UpdateDocumentElementLang).
    init({
      backend: (language: string, namespace: string): Promise<{default: ResourceKey}> =>
        import(`translations/${language}/${namespace}_i18next.json`),
      detection: {
        lookupQuerystring: 'hl',
      },
      fallbackLng: 'fr',
      interpolation: {
        escapeValue: false,
      },
      keySeparator: false,
      nsSeparator: false,
      react: {
        defaultTransParent: 'div',
      },
      whitelist: ['fr'],
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


const formatRelativeLocale = {
  lastWeek: "eeee 'dernier'",
  nextWeek: "eeee 'prochain'",
  today: "'aujourd''hui'",
  tomorrow: "'demain''",
  yesterday: "'hier'",
} as const

type Token = keyof typeof formatRelativeLocale | 'other'

// This is the date locale for date-fns i18n.
const dateOption = {locale: {
  ...frDateLocale,
  formatRelative: (token: Token, date: Date|number, baseDate: Date|number): string => {
    if (token === 'other') {
      return `'${formatDistance(date, baseDate, {addSuffix: true, locale: frDateLocale})}'`
    }
    return formatRelativeLocale[token]
  },
}}


export {init, dateOption, getLanguage, localizeOptions, prepareT, prepareNamespace}
