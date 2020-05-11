// TODO(cyrille): Consider using protos.

declare namespace bayes {
  namespace casContact {

    interface AlertMedium {
      medium: 'email' | 'SMS'
      value: string
    }

    interface Person {
      readonly displayName?: string
      readonly name: string
      readonly personId: string
    }

    type Distance = 'close' | 'far'

    interface Contact {
      readonly date: Date
      readonly duration?: number
      readonly distance?: Distance
      readonly personId: string
    }

    interface DayContacts {
      readonly isDayConfirmed?: true
      readonly contacts?: readonly Contact[]
    }

    type PersonContact = Person & Contact

    // FIXME(cyrille): Keep consistent space when alerting through both channels.
    interface AlertPersonState {
      alertMediums?: readonly AlertMedium[]
      isAlertedAnonymously?: boolean
    }

    type Symptom =
      | 'CHEST_PAIN'
      | 'COUGH'
      | 'DIARRHEA'
      | 'FEVER'
      | 'HEADACHE'
      | 'MUSCLE_PAIN'
      | 'NO_SYMPTOMS'
      | 'RUNNY_NOSE'
      | 'SHORT_BREATH'
      | 'SMELL_LOSS'
      | 'SORE_THROAT'
      | 'SPEW'
      | 'TASTE_LOSS'
      | 'TIREDNESS'
      | 'VOMITING'
  }
}

type ContaminationRisk = 'high' | 'low'

type UserState = {
  contagiousPeriodEnd?: Date
  contagiousPeriodStart?: Date
  contaminationRisk?: ContaminationRisk
  hasKnownRisk?: true
  symptomsOnsetDate?: Date
}

type ContactState = {
  // TODO(cyrille): Investigate how to put a ? after the dynamic property.
  readonly [date: string]: bayes.casContact.DayContacts
}
type PeopleState = readonly bayes.casContact.Person[]

interface AlertsState {
  readonly [personId: string]: bayes.casContact.AlertPersonState
}

interface RootState {
  alerts: AlertsState
  contacts: ContactState
  people: PeopleState
  user: UserState
}
