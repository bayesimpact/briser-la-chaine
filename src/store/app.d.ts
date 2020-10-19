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
      readonly personId: string
    }

    interface DayContacts {
      readonly contacts?: readonly Contact[]
    }

    type Sender =
      // User has told us that they were not able to alert the contact.
      | 'none'
      // User wants their physician to alert the contact.
      | 'physician'
      // User wants us to alert the contact.
      | 'product'
      // User has alerted the contact themselves.
      | 'user'

    // TODO(cyrille): Keep consistent state when alerting through both channels.
    interface AlertPersonState {
      alertMediums?: readonly AlertMedium[]
      // Note that anonymous is only available for the sender 'product' although 'product' can also
      // alert non anonymously.
      isAlertedAnonymously?: boolean
      lastSender?: Sender
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
  // Number of users in the chain **before** this user.
  chainDepth?: number
  contagiousPeriodEnd?: Date
  contagiousPeriodStart?: Date
  contaminationRisk?: ContaminationRisk
  hasKnownRisk?: true
  hasFinishedMemorySteps?: boolean
  isAssistanceRequiredNow?: boolean
  symptomsOnsetDate?: Date
  userName?: string
}

type ContactState = readonly string[]
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
