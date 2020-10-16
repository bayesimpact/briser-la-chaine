import {TFunction} from 'i18next'

// TODO(cyrille): Make routes with several segments, rather than hyphenated names.
import Routes from 'translations/fr/url_i18next.json'
import MemorySteps from 'translations/en/memoryRouter_i18next.json'


export type Page = keyof typeof Routes
export type MemoryStep = keyof typeof MemorySteps


const pathCache: {[pathname: string]: Page} = {}


function getPath(page: Page, translate: TFunction): string {
  const path = '/' + translate(page, {ns: 'url'})
  pathCache[path] = page
  return path
}


// Find a page that matches a given pathname.
function getPage(pathname: string): Page|undefined {
  const page = pathCache[pathname]
  if (page) {
    return page
  }
  return undefined
}


const Params: {[varName: string]: string} = {
  DEPTH: 'p',
} as const


export {Params, getPage, getPath}
