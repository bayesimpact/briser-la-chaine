import {prepareT} from 'store/i18n'


export const DURATION_OPTIONS = [
  {name: prepareT('0-15min'), value: 5},
  {name: prepareT('+15min'), value: 30},
]


export const DISTANCE_OPTIONS: readonly {name: string; value: bayes.casContact.Distance}[] = [
  {name: prepareT('+ 2 mètres'), value: 'far'},
  {name: prepareT('- 2 mètres'), value: 'close'},
]
