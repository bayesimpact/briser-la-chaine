import AddLineIcon from 'remixicon-react/AddLineIcon'
import {format as dateFormat, formatRelative} from 'date-fns'
import _groupBy from 'lodash/groupBy'
import CloseIcon from 'remixicon-react/CloseLineIcon'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import {components, OptionProps} from 'react-select'

import {createContact, createNewPerson, dropContact, getNextNoDate, noDate, saveContacts,
  updateContact, useDispatch, useSelector} from 'store/actions'
import {localizeOptions, prepareT, useDateOption} from 'store/i18n'
import {DISTANCE_OPTIONS, DURATION_OPTIONS} from 'store/options'

import {cancelButtonStyle, darkButtonStyle} from 'components/buttons'
import {Modal, ModalConfig} from 'components/modal'
import {BottomDiv} from 'components/navigation'
import Permissions from 'components/permissions'
import PrivacyNote from 'components/privacy_note'
import Select, {SelectOption} from 'components/select'
import Tabs from 'components/tabs'


const todayDate = new Date()

const MAIN_TIPS: readonly string[] = [
  prepareT('📞  Vos derniers appels'),
  prepareT('💬  Vos derniers SMS'),
  prepareT('💬  Vos réseaux sociaux'),
  prepareT('📆  Vos calendriers'),
  prepareT('📔  Vos stories Instagram, Facebook'),
]

const ADDITIONAL_TIPS: readonly string[] = [
  prepareT('Ai-je fait des **courses** ce jour\u00A0?'),
  prepareT('Ai-je pris les **transports en commun**\u00A0?'),
  prepareT('Suis-je allé(e) à la **banque**\u00A0? À la **Poste**\u00A0?'),
  prepareT('Ai-je fait du **sport**\u00A0?'),
  prepareT('Suis-je sorti(e) avec des **amis**\u00A0?'),
]

interface SectionProps {
  children: React.ReactNode
  title: string
  titleStyle?: React.CSSProperties
  style?: React.CSSProperties
}
const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 'bold',
  margin: '10px 0 0',
}

const SectionBase = ({children, title, titleStyle, style}: SectionProps): React.ReactElement => {
  return <div style={style}>
    <h1 style={{...sectionTitle, ...titleStyle}}>{title}</h1>
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
      {children}
    </div>
  </div>
}
const Section = React.memo(SectionBase)


type DeleteModalProps = Omit<ModalConfig, 'children'> & {
  onCancel: () => void
  onConfirm: (person: bayes.casContact.PersonContact) => void
  person: bayes.casContact.PersonContact
}
const deleteModalStyle: React.CSSProperties = {
  borderRadius: 5,
}
const DeleteUserConfirmationBase = (props: DeleteModalProps): React.ReactElement => {
  const {onCancel, onConfirm, person, ...modalProps} = props
  const {name} = person
  const {t} = useTranslation()
  const textStyle: React.CSSProperties = {
    fontSize: 20,
    margin: '50px 30px 0',
    textAlign: 'center',
  }

  const handleConfirm = useCallback(
    (): void => onConfirm?.(person), [onConfirm, person])
  return <Modal style={deleteModalStyle} {...modalProps}>
    <Trans parent="header" style={textStyle}>
      Êtes-vous sûr(e) de vouloir supprimer {{name: name}} de votre liste&nbsp;?
    </Trans>
    <div style={{display: 'flex', justifyContent: 'center', margin: '45px 20px 30px'}}>
      <div style={{...cancelButtonStyle, flex: 1, marginRight: 9}} onClick={onCancel}>
        {t('Annuler')}
      </div>
      <div style={{...darkButtonStyle, flex: 1}} onClick={onConfirm && handleConfirm}>
        {t('Supprimer')}
      </div>
    </div>
  </Modal>
}
const DeleteUserConfirmation = React.memo(DeleteUserConfirmationBase)

interface TipProps {
  icon?: React.ReactNode
  text: string
}
const TipBase = ({icon, text}: TipProps): React.ReactElement => {
  const containerStyle = {
    alignItems: 'center',
    backgroundColor: colors.ICE_BLUE,
    border: `solid 1px ${colors.AQUA_LIGHT_BLUE}`,
    borderRadius: 4,
    display: 'flex',
    marginBottom: 10,
    marginRight: 10,
    minHeight: 31,
    opacity: .8,
    padding: '0px 9px',
  } as const
  const textStyle: React.CSSProperties = {
    fontSize: 13,
    marginLeft: `${icon ? '5px' : 'initial'}`,
    whiteSpace: 'nowrap',
  }
  return <div style={containerStyle}>
    {icon ? icon : null}
    <span style={textStyle}>{text}</span>
  </div>
}
const Tip = React.memo(TipBase)

const typedMemo: <T>(c: T) => T = React.memo

interface DetailChoiceElementProps<T> {
  isSelected: boolean
  onChange: (newValue: T) => void
  name: string
  style?: React.CSSProperties
  value: T
}

const DetailChoiceElementBase = <T extends {} = string>(props: DetailChoiceElementProps<T>):
React.ReactElement => {
  const {isSelected, onChange, name, style, value} = props
  const onClick = useCallback((): void => onChange(value), [onChange, value])
  const selectedStyle: React.CSSProperties = {
    backgroundColor: '#000',
    borderStyle: 'none',
    color: '#fff',
  }
  const containerStyle: React.CSSProperties = {
    borderColor: colors.SMOKEY_GREY,
    borderRadius: 4,
    borderStyle: 'solid',
    borderWidth: 1,
    cursor: 'pointer',
    flex: 1,
    padding: '12px 0',
    textAlign: 'center',
    ...isSelected ? selectedStyle : {},
    ...style,
  }
  return <div style={containerStyle} onClick={onClick}>{name}</div>
}
const DetailChoiceElement = typedMemo(DetailChoiceElementBase)

interface DetailChoiceProps<T> {
  isInvalid: boolean
  onChange: (newValue: T) => void
  options: readonly {name: string; value: T}[]
  title: string
  value?: T
}

const DetailChoiceBase = <T extends {}=string>(props: DetailChoiceProps<T>): React.ReactElement => {
  const {isInvalid, title, onChange, options, value} = props
  const {t} = useTranslation()
  const optionsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
  }
  const titleStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 'normal',
    margin: '15px 0 6px',
  }
  const missingFieldStyle: React.CSSProperties = {
    color: colors.SALMON,
    fontSize: 12,
    fontStyle: 'italic',
  }
  const firstChoiceStyle = useMemo(
    (): React.CSSProperties => isInvalid ? {borderColor: colors.SALMON} : {}, [isInvalid])
  const choiceStyle = useMemo(() => ({...firstChoiceStyle, marginLeft: 8}), [firstChoiceStyle])
  return <div>
    <h3 style={titleStyle}>{title}</h3>
    <div style={optionsStyle}>{options.map((option, index) =>
      <DetailChoiceElement<T>
        style={index ? choiceStyle : firstChoiceStyle}
        key={option.name} {...option} onChange={onChange} isSelected={value === option.value} />)}
    </div>
    {isInvalid ? <span style={missingFieldStyle}>* {t('champ obligatoire')}</span> : null}
  </div>
}
const DetailChoice = typedMemo(DetailChoiceBase)


interface ContactDetailsProps {
  isHighlighted: boolean
  isValidated: boolean
  person: bayes.casContact.PersonContact
  style?: React.CSSProperties
  onDelete: (person: bayes.casContact.PersonContact) => void
}

const dropContactStyle: React.CSSProperties = {
  backgroundColor: colors.MEDIUM_GREY,
  borderRadius: 16,
  cursor: 'pointer',
  padding: 5,
}

const ContactDetailsBase = (props: ContactDetailsProps): React.ReactElement => {
  const {isHighlighted, isValidated, onDelete, person, style} = props
  const {date, displayName, distance, duration, name, personId} = person
  const {t} = useTranslation()
  const [isForceExpoShown, setIsForceExpoShown] = useState(false)
  const [isExpoShown, setIsExpoShown] = useState(isForceExpoShown || !(distance && duration))
  useEffect((): void => setIsExpoShown(
    isForceExpoShown || !(distance && duration)), [distance, duration, isForceExpoShown])
  const containerStyle = {
    backgroundColor: isHighlighted ? colors.ICE_BLUE : 'initial',
    border: `1px solid ${colors.BUTTON_GREY}`,
    borderRadius: 5,
    fontSize: 15,
    padding: isExpoShown ? '20px 20px 50px' : 20,
    transition: '450ms',
    ...style,
  }
  const dispatch = useDispatch()
  const onDurationChange = useCallback((duration: number): void => {
    dispatch(updateContact({date, duration, personId}))
  }, [date, dispatch, personId])
  const onDistanceChange = useCallback((distance: bayes.casContact.Distance): void => {
    dispatch(updateContact({date, distance, personId}))
  }, [date, dispatch, personId])
  const onNameClick = useCallback((): void => {
    if (distance && duration) {
      setIsForceExpoShown(!isForceExpoShown)
    }
  }, [distance, duration, isForceExpoShown])
  const handleDeletion = useCallback((): void => onDelete?.(person), [onDelete, person])
  // TODO(cyrille): Add a smooth transitions here.
  return <div style={containerStyle}>
    <div style={{alignItems: 'center', display: 'flex'}}>
      <div onClick={onNameClick} style={{cursor: 'pointer', flex: 1, fontWeight: 'bold'}}>
        {displayName || name}
      </div>
      <CloseIcon style={dropContactStyle} size={8} onClick={handleDeletion} />
    </div>
    {isExpoShown ? <React.Fragment>
      <DetailChoice<number>
        title={t('Durée du contact')} options={localizeOptions(t, DURATION_OPTIONS)}
        isInvalid={isValidated && !duration} value={duration} onChange={onDurationChange} />
      <DetailChoice<bayes.casContact.Distance>
        title={t('Distance de contact')} options={localizeOptions(t, DISTANCE_OPTIONS)}
        isInvalid={isValidated && !distance} value={distance} onChange={onDistanceChange} />
    </React.Fragment> : null}
  </div>
}
const ContactDetails = React.memo(ContactDetailsBase)

interface ValidationProps {
  count: number
  isForADay: boolean
  onClick: () => void
}

const DayValidationButtonBase = (props: ValidationProps): React.ReactElement => {
  const {count, isForADay, onClick} = props
  const {t} = useTranslation()
  const style: React.CSSProperties = {
    backgroundColor: colors.VIBRANT_GREEN,
    borderRadius: 25,
    color: '#fff',
    cursor: 'pointer',
    margin: 20,
    padding: 15,
    textAlign: 'center',
  }
  const dayValidation = count ? t('Valider cette journée') + ' ' +
    t('+{{count}} personne', {count}) : t("Je n'ai croisé personne ce jour")
  return <div style={style} onClick={onClick}>
    {isForADay ? dayValidation : t('Ajouter {{count}} personne', {count})}
  </div>
}
const DayValidationButton = React.memo(DayValidationButtonBase)


interface MemoryHelpSectionProps {
  date: Date
}
const privacyNoteStyle: React.CSSProperties = {
  margin: '4px 0 27px',
}
const tabsStyle: React.CSSProperties = {
  margin: '0 20px 20px',
}
// FIXME(sil): Update permissions UI.
const MemoryHelpSectionBase = ({date}: MemoryHelpSectionProps): React.ReactElement => {
  const {t} = useTranslation()
  const dateOption = useDateOption()
  const dateText = dateFormat(date, 'd MMMM', dateOption)
  const shortDateText = dateFormat(date, 'd MMM', dateOption)
  const [isGeneric, setIsGeneric] = useState(false)
  const handleChangeTab = useCallback(
    () => setIsGeneric(!isGeneric), [isGeneric])
  const tabs = useMemo((): readonly string[] => [
    t('Infos du {{date}}', {date: shortDateText}),
    t('Aide-mémoires'),
  ], [shortDateText, t])
  return <React.Fragment>
    <Tabs
      style={tabsStyle} tabSelected={isGeneric ? 1 : 0} onChangeTab={handleChangeTab}
      tabs={tabs} />
    {isGeneric ? <React.Fragment>
      <Section
        title={t('Pensez à regarder\u00A0:')} titleStyle={{marginBottom: 15}}
        style={{padding: '0 20px'}}>
        {MAIN_TIPS.map(
          (text: string, index: number) => <Tip text={text} key={`main-${index}`} />)}
      </Section>
      <Section title={t('À vérifier aussi\u00A0:')} style={{padding: 20}}>
        <ul style={{margin: 0, paddingLeft: 20}}>{ADDITIONAL_TIPS.map(
          (text: string, index: number) => <li key={`add-${index}`}>
            <ReactMarkdown source={text} /></li>)}
        </ul>
      </Section></React.Fragment> : <div style={{padding: 20}}>
      <div style={sectionTitle}>
        {t('Ce que vous avez fait le {{date}}\u00A0:', {date: dateText})}
      </div>
      <PrivacyNote style={privacyNoteStyle} text={t('Nous ne stockons aucune de vos données.')} />
      <Permissions date={date} />
    </div>}
  </React.Fragment>
}
const MemoryHelpSection = React.memo(MemoryHelpSectionBase)


const selectIconContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.ICE_BLUE,
  borderRadius: 29,
  color: colors.AZURE,
  display: 'flex',
  flex: 'none',
  height: 29,
  justifyContent: 'center',
  marginRight: 15,
  width: 29,
}
const {Option} = components
const IconSelectOptionBase = <T extends {}>(props: OptionProps<T>): React.ReactElement => {
  const {data: {icon = false, label = '', name = ''} = {}} = props
  return <Option {...props}>
    {label}
    <div style={{alignItems: 'center', display: 'flex'}}>
      {icon ? <span style={selectIconContainerStyle}><AddLineIcon /></span> : null}
      {name}
    </div>
  </Option>
}
const IconSelectOption = typedMemo(IconSelectOptionBase)


interface ContactsSearchProps extends Omit<ModalConfig, 'children'> {
  date: Date
}

const reactSelectHeight = 55
const reactSelectStyles = {
  dropdownIndicator: (): React.CSSProperties => ({display: 'none'}),
  indicatorSeparator: (): React.CSSProperties => ({display: 'none'}),
} as const

const getPersonOption = (person: bayes.casContact.Person): SelectOption<bayes.casContact.Person> =>
  ({name: person.displayName || person.name, value: person})

const ContactsSearchBase = (props: ContactsSearchProps): React.ReactElement|null => {
  const {date, onClose} = props
  const {t} = useTranslation()
  const dateOption = useDateOption()
  const [input, setInput] = useState('')
  const [contactToDelete, setContactToDelete] =
   useState<bayes.casContact.PersonContact|undefined>(undefined)
  const [key, setKey] = useState(false)
  const [isValidated, setValidated] = useState(false)
  const [isNewContactAdded, setIsNewContactAdded] = useState(false)
  const noOptionsMessage = useCallback(
    (): null => null, [])
  const contactPeople: PeopleState = useSelector(({people}) => people)
  const hasNoDate = date === noDate
  // TODO(cyrille): Use local state and get rid of NO_DATE chenanigans.
  const noDateSaveName = useSelector(({contacts}) => getNextNoDate(contacts))
  const savedDate = hasNoDate ? noDateSaveName : date.toISOString()

  // Build the list of people suggest.
  const [todayContacts, otherDaysPeople]:
  [readonly bayes.casContact.Contact[], ReadonlySet<string>] =
    useSelector(({contacts: {[savedDate]: contactDay, ...otherDates}}) => {
      const personIds: Set<string> = new Set()
      Object.values(otherDates).forEach(({contacts}) => contacts?.forEach(({personId}) => {
        personIds.add(personId)
      }))
      return [
        contactDay?.contacts || [],
        personIds,
      ]
    })
  const {alreadyContactedToday = [], notContacted = [], alreadyContacted = []} = useMemo(() => {
    const datePersonIds = new Set(todayContacts.map(({personId}) => personId))
    return _groupBy(contactPeople, ({personId}): string => datePersonIds.has(personId) ?
      'alreadyContactedToday' : otherDaysPeople.has(personId) ?
        'alreadyContacted' : 'notContacted')
  }, [contactPeople, todayContacts, otherDaysPeople])
  const searchOptions = useMemo(() => {
    const alreadyContactedOptions = alreadyContacted.map(getPersonOption)
    const notContactedOptions = notContacted.map(getPersonOption)
    return input ? [
      ...(hasNoDate ? [] : alreadyContactedOptions),
      ...notContactedOptions,
      {
        icon: true,
        name: t('Ajouter {{newPerson}} à la liste des personnes croisées', {newPerson: input}),
        value: {name: input, personId: ''},
      },
    ] : hasNoDate ? [] : alreadyContacted.length ? [
      {
        label: t('Personne déjà croisée', {count: alreadyContacted.length}),
        options: alreadyContactedOptions,
      },
      {
        label: t('Autre contact', {count: notContacted.length}),
        options: notContactedOptions,
      },
    ] : notContactedOptions
  }, [alreadyContacted, hasNoDate, input, notContacted, t])

  const peopleToShow = useMemo((): readonly bayes.casContact.PersonContact[] =>
    todayContacts.map(contact => ({
      ...contact,
      ...alreadyContactedToday.find(({personId}) => personId === contact.personId) ||
        {name: t('Inconnu')},
    })),
  [alreadyContactedToday, todayContacts, t])

  const dispatch = useDispatch()
  const onSelect = useCallback(({name, personId}: bayes.casContact.Person): void => {
    setInput('')
    setValidated(false)
    setIsNewContactAdded(true)
    setKey(key => !key)
    const {personId: newPersonId} = personId ? {personId} : dispatch(createNewPerson(name))
    dispatch(createContact(newPersonId, date))
  }, [date, dispatch])
  const arePeopleShown = !!peopleToShow.length
  const [areTipsShown, setTipsShown] = useState(!arePeopleShown && !hasNoDate)
  useEffect((): (() => void) => {
    if (!isNewContactAdded) {
      return (): void => void 0
    }
    const timeout = window.setTimeout((): void => setIsNewContactAdded(false), 300)
    return (): void => clearTimeout(timeout)
  }, [isNewContactAdded])
  useEffect((): void => setTipsShown(!arePeopleShown && !hasNoDate), [arePeopleShown, hasNoDate])
  const showTips = useCallback((): void => setTipsShown(true), [])
  const validateAndClose = useCallback((): void => {
    if (peopleToShow.some(({distance, duration}) => !distance || !duration)) {
      setValidated(true)
      return
    }
    dispatch(saveContacts(date))
    onClose?.()
  }, [date, dispatch, onClose, peopleToShow])
  const deleteContact = useCallback((person: bayes.casContact.PersonContact): void => {
    const {date, personId} = person
    dispatch(dropContact({date, personId}))
    setContactToDelete(undefined)
  }, [dispatch])
  const openDeletionModal = useCallback((person: bayes.casContact.PersonContact): void =>
    setContactToDelete(person), [])
  const closeDeletion = useCallback((): void => setContactToDelete(undefined), [])
  const headerStyle = {
    backgroundColor: colors.BRIGHT_SKY_BLUE,
    color: '#fff',
    padding: '20px 20px 30px',
    position: 'relative',
  } as const
  const selectStyle = {
    bottom: reactSelectHeight / 2,
    height: reactSelectHeight,
    margin: '0 20px',
    position: 'relative',
    width: 'initial',
    zIndex: 2,
  } as const
  const containerStyle = {
    backgroundColor: '#fff',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  } as const
  const dateString = hasNoDate ? undefined : dateFormat(date, 'EEEE d MMMM', dateOption)
  const tipsButtonStyle: React.CSSProperties = {
    alignItems: 'center',
    border: `1px solid ${colors.MEDIUM_GREY}`,
    borderRadius: 5,
    cursor: 'pointer',
    margin: '25px 20px',
    padding: 15,
    textAlign: 'center',
  }

  return <div style={containerStyle}>
    <div style={headerStyle}>
      {hasNoDate ? null : <strong style={{fontSize: 12, textTransform: 'uppercase'}}>
        {formatRelative(date, todayDate, dateOption)}</strong>}
      <h1 style={{fontSize: 20, fontWeight: 'bold'}}>
        {dateString ? t("{{dateString}} j'ai croisé\u00A0:", {dateString}) :
          t('Ajouter un contact')}
      </h1>
    </div>
    <Select<bayes.casContact.Person>
      // Key-hack to reset the selected value to undefined.
      key={`${key}`} style={selectStyle}
      placeholder={t("Entrez le prénom d'une personne")}
      options={searchOptions} noOptionsMessage={noOptionsMessage}
      onInputChange={setInput} inputValue={input}
      components={{Option: IconSelectOption}}
      onChange={onSelect} value={undefined} styles={reactSelectStyles} />
    <div style={{marginTop: 10, position: 'relative', top: -reactSelectHeight / 2}}>
      {peopleToShow.length ? <div style={{padding: 20}}>
        {hasNoDate ? null : <h2 style={{margin: '10px 0 0'}}>
          {t('{{count}} personne croisée ce jour', {count: peopleToShow.length})}
        </h2>}
        {contactToDelete ? <DeleteUserConfirmation
          onCancel={closeDeletion} onConfirm={deleteContact} isShown={!!contactToDelete}
          person={contactToDelete} /> : null}
        {peopleToShow.slice().reverse().map(
          (person: bayes.casContact.PersonContact, index: number) => {
            return <ContactDetails
              isHighlighted={!index && isNewContactAdded}
              isValidated={isValidated} onDelete={openDeletionModal} style={{margin: '20px 0'}}
              key={person.personId} person={person} />
          })}
      </div> : null}
      {areTipsShown ? <MemoryHelpSection date={date} /> : hasNoDate ? null :
        <div onClick={showTips} style={tipsButtonStyle}>
          + {t('Afficher les aide-mémoires')}
        </div>}
    </div>
    <div style={{flex: 1}} />
    <BottomDiv defaultHeight={60}>
      <DayValidationButton
        count={peopleToShow.length} onClick={validateAndClose} isForADay={!hasNoDate} />
    </BottomDiv>
  </div>
}


export default React.memo(ContactsSearchBase)
