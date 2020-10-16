import _keyBy from 'lodash/keyBy'
import _sortBy from 'lodash/sortBy'
import {prepareT} from 'store/i18n'

type NamedValue<T> = Readonly<{name: string; potential: number; value: T}>

const SYMPTOMS: readonly NamedValue<bayes.casContact.Symptom>[] = [
  {
    name: prepareT('Difficultés respiratoires et/ou Essouflement'),
    potential: 3,
    value: 'SHORT_BREATH',
  },
  {name: prepareT('Fièvre (> 38°)'), potential: 3, value: 'FEVER'},
  {name: prepareT('Toux (sèche ou grasse)'), potential: 3, value: 'COUGH'},
  {name: prepareT('Crachat inhabituel'), potential: 2, value: 'SPEW'},
  {name: prepareT('Fatigue inhabituelle'), potential: 2, value: 'TIREDNESS'},
  {name: prepareT('Douleurs musculaires'), potential: 2, value: 'MUSCLE_PAIN'},
  {name: prepareT("Perte de l'odorat"), potential: 2, value: 'SMELL_LOSS'},
  {name: prepareT('Perte du goût'), potential: 2, value: 'TASTE_LOSS'},
  {name: prepareT('Nez qui coule'), potential: 1, value: 'RUNNY_NOSE'},
  {name: prepareT('Maux de tête'), potential: 1, value: 'HEADACHE'},
  {name: prepareT('Diarrhée'), potential: 1, value: 'DIARRHEA'},
  {name: prepareT('Vomissement'), potential: 1, value: 'VOMITING'},
  {name: prepareT('Douleurs thoraciques'), potential: 2, value: 'CHEST_PAIN'},
  {name: prepareT('Gorge irritée'), potential: 1, value: 'SORE_THROAT'},
  {name: prepareT('Aucun symptôme sur la liste'), potential: 0, value: 'NO_SYMPTOMS'},
]

const SYMPTOM_BY_VALUE = _keyBy(SYMPTOMS, 'value')

function isProbablySick(symptoms: readonly bayes.casContact.Symptom[]): ContaminationRisk {
  if (symptoms.includes('NO_SYMPTOMS')) {
    return 'low'
  }
  const score = symptoms.
    map(symptom => SYMPTOM_BY_VALUE[symptom].potential).
    // eslint-disable-next-line unicorn/no-reduce
    reduce((a, b) => a + b, 0)
  return score >= 3 ? 'high' : 'low'
}

function computeNeedsAssistanceNow(symptoms: readonly bayes.casContact.Symptom[]): boolean {
  return symptoms.includes('SHORT_BREATH')
}

const SORTED_SYMPTOMS = _sortBy(SYMPTOMS.filter(({potential}) => potential), 'potential')

export {SYMPTOMS, SORTED_SYMPTOMS, computeNeedsAssistanceNow, isProbablySick}
