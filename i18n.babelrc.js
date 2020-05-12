const pluginOptions = {
  defaultContexts: [''],
  discardOldKeys: true,
  keySeparator: null,
  nsSeparator: null,
  outputPath: 'src/translations/{{locale}}/{{ns}}_i18next.json',
  tFunctionNames: ['prepareT', 't'],
  useI18nextDefaultValue: ['fr'],
}

module.exports = {
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-class-properties', {loose: false}],
    ['@babel/plugin-proposal-optional-chaining', {loose: false}],
    ['i18next-extract', pluginOptions],
  ],
  presets: [['@babel/env', {modules: false}], '@babel/react', '@babel/typescript'],
}
