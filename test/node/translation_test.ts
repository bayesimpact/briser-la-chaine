const {expect} = require('chai')
const glob = require('glob')
const path = require('path')

interface Translations {
  [key: string]: string
}

interface TranslationFile {
  key: string
  lang: string
  namespace: string
  resources: Translations
}

interface TranslationTree {
  [lang: string]: {
    [namespace: string]: Translations
  }
}

function getTranslationFiles(): readonly TranslationFile[] {
  const baseFolder = path.join(__dirname, '../../src/translations')
  const jsonFilePaths: readonly string[] = glob.sync(baseFolder + '/**/*_i18next.json')
  return jsonFilePaths.map((key: string): TranslationFile => {
    const relativePath = path.relative(baseFolder, key)
    const matches = relativePath.match(/^([^/]*)\/([^/]*)_i18next\.json/)
    if (!matches) {
      throw new Error(`${key} does not have a namespace or a language in its path`)
    }
    const [lang, namespace] = matches.slice(1)
    return {
      key: relativePath,
      lang,
      namespace,
      resources: require(key),
    }
  })
}

function getAllTranslationFiles(): [readonly TranslationFile[], TranslationTree] {
  const translationFiles = getTranslationFiles()

  const translationTree: TranslationTree = {}
  translationFiles.forEach(({lang, namespace, resources}): void => {
    translationTree[lang] = translationTree[lang] || {}
    translationTree[lang][namespace] = resources
  })

  return [translationFiles, translationTree]
}
const [translationFiles, translationTree] = getAllTranslationFiles()


const isExtractedFile = (file: TranslationFile): boolean => {
  const extractedLangs = new Set(['en'])
  return extractedLangs.has(file.lang)
}

const getExtractedFile = (file: TranslationFile): TranslationFile => {
  if (isExtractedFile(file)) {
    return file
  }
  const defaultLangFile = translationFiles.find((otherFile) =>
    otherFile.namespace === file.namespace && isExtractedFile(otherFile))
  expect(defaultLangFile, `${file.namespace}`).not.to.be.undefined
  if (!defaultLangFile) {
    throw new Error('the chai test above should have failed')
  }
  return defaultLangFile
}


const dropContext = (key: string): string => {
  const split = key.split('_')
  if (split.length === 1) {
    return key
  }
  return split.slice(0, -1).join('_')
}


describe('Translation files', (): void => {
  it('should be more than 1', (): void => {
    expect(translationFiles.length).to.be.greaterThan(1)
  })

  translationFiles.forEach((file: TranslationFile): void => {
    describe(file.key, (): void => {
      it('should not have empty translations', (): void => {
        for (const key in file.resources) {
          expect(file.resources[key], key).not.to.be.empty
        }
      })

      it("should not contain the hardcoded product's name", (): void => {
        for (const key in file.resources) {
          expect(key).not.to.contain('Bob')
          expect(file.resources[key]).not.to.contain('Bob')
        }
      })

      if (!isExtractedFile(file)) {
        it('should not need to translate to the same value as the key', () => {
          for (const key in file.resources) {
            expect(file.resources[key]).not.to.equal(key)
          }
        })

        it('should not have non-extracted keys', () => {
          const extractedFile = getExtractedFile(file)
          for (const key in file.resources) {
            expect(key, `Unused key "${key}" in "${file.key}"`).
              to.satisfy((key: string): boolean => !!extractedFile.resources[dropContext(key)])
          }
        })
      }

      it("should respect language's rule about blank spaces before punctuation", (): void => {
        for (const key in file.resources) {
          expect(key, 'French double punctuation mark must be preceded by a non breakable space').
            not.to.match(/[^!:?\u00A0](?!:\/\/)[!:?]/)
          if (file.lang.replace(/@.*$/, '') === 'fr') {
            expect(
              file.resources[key],
              'French double punctuation mark must be preceded by a non breakable space').
              not.to.match(/[^!:?\u00A0](?!:\/\/)[!:?]/)
          } else if (file.lang === 'en') {
            expect(
              file.resources[key], 'English double punctuation should not be preceded by a blank').
              not.to.match(/[ \u00A0][!:?]/)
          }
        }
      })
    })
  })

  it('should have a known translation', (): void => {
    expect(translationTree['en']['translation']['CGU']).to.eq('Terms of Use')
  })
})

// Populate if we have French sentences with silent plural.
const _NO_FRENCH_PLURAL: ReadonlySet<string> = new Set([])

describe('French translations', (): void => {
  // Assumes all strings have been extracted, e.g. if lint_and_test.sh is run.
  // TODO(cyrille): Handle fr@tu.
  const extractedFiles = translationFiles.filter(file => isExtractedFile(file))
  extractedFiles.forEach(({namespace, resources}): void => {
    const getFrTranslations = (): Translations => {
      expect(translationTree, 'Missing fr translations').
        to.include.all.keys('fr')
      expect(translationTree['fr'], 'Missing fr namespace translations').
        to.include.all.keys(namespace)
      return translationTree['fr'][namespace]
    }

    describe(`fr/${namespace}.json`, () => {


      it('should have a plural translation for all strings with an extracted plural', (): void => {
        for (const key in resources) {
          if (key.endsWith('_plural') && !_NO_FRENCH_PLURAL.has(key.slice(0, -7))) {
            expect(getFrTranslations()).to.include.keys(key)
          }
        }
      })
    })
  })
})

export {}
