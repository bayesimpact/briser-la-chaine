import AddLineIcon from 'remixicon-react/AddLineIcon'
import Emotion2FillIcon from 'remixicon-react/Emotion2FillIcon'
import CloseIcon from 'remixicon-react/CloseLineIcon'
import React, {useCallback, useMemo, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {components, OptionProps} from 'react-select'

import {createContact, createNewPerson, dropContact, useDispatch} from 'store/actions'
import {useContactIds, useSelector} from 'store/selections'

import {cancelButtonStyle, darkButtonStyle} from 'components/buttons'
import {Modal, ModalConfig} from 'components/modal'
import Select from 'components/select'


type DeleteModalProps = Omit<ModalConfig, 'children' | 'isShown' | 'style'> & {
  onCancel: () => void
  onConfirm: (person: bayes.casContact.Person) => void
  person?: bayes.casContact.Person
}
const deleteModalStyle: React.CSSProperties = {
  borderRadius: 5,
}
const DeleteUserConfirmationBase = (props: DeleteModalProps): React.ReactElement => {
  const {onCancel, onConfirm, person, ...modalProps} = props
  const {name} = person || {}
  const {t} = useTranslation()
  const textStyle: React.CSSProperties = {
    fontSize: 20,
    margin: '50px 30px 0',
    textAlign: 'center',
  }

  const handleConfirm = useCallback(
    (): void => person && onConfirm?.(person), [onConfirm, person])
  return <Modal style={deleteModalStyle} isShown={!!person} {...modalProps}>
    <Trans parent="header" style={textStyle}>
      Êtes-vous sûr(e) de vouloir supprimer {{name}} de votre liste&nbsp;?
    </Trans>
    <div style={{display: 'flex', justifyContent: 'center', margin: '45px 20px 50px'}}>
      <div style={{...cancelButtonStyle, flex: 1, marginRight: 9}} onClick={onCancel}>
        {t('Annuler')}
      </div>
      <div
        style={{...darkButtonStyle, flex: 1}}
        onClick={onConfirm && handleConfirm}>
        {t('Supprimer')}
      </div>
    </div>
  </Modal>
}
const DeleteUserConfirmation = React.memo(DeleteUserConfirmationBase)


const typedMemo: <T>(c: T) => T = React.memo


interface ContactDetailsProps {
  person: bayes.casContact.Person
  style?: React.CSSProperties
  onDelete: (person: bayes.casContact.Person) => void
}

const dropContactStyle: React.CSSProperties = {
  marginLeft: 11,
}

const ContactDetailsBase = (props: ContactDetailsProps): React.ReactElement => {
  const {onDelete, person, style} = props
  const {displayName, name} = person
  const containerStyle = {
    backgroundColor: '#fff',
    border: `1px solid ${colors.LIGHT_BLUE_GREY}`,
    borderRadius: 4,
    fontSize: 13,
    padding: '7px 10px',
    ...style,
  }
  const handleDeletion = useCallback((): void => onDelete?.(person), [onDelete, person])
  return <div style={containerStyle}>
    <div style={{alignItems: 'center', display: 'flex'}}>
      <div style={{flex: 1}}>{displayName || name}</div>
      <CloseIcon style={dropContactStyle} size={8} onClick={handleDeletion} />
    </div>
  </div>
}
const ContactDetails = React.memo(ContactDetailsBase)


const selectIconContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.PALE_GREY,
  borderRadius: 29,
  display: 'flex',
  flex: 'none',
  height: 29,
  justifyContent: 'center',
  marginRight: 15,
  width: 29,
}
const {Option} = components
const IconSelectOptionBase = <T extends Record<string, unknown>>(props: OptionProps<T>):
React.ReactElement => {
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


const reactSelectHeight = 60
const reactSelectStyles = {
  dropdownIndicator: (): React.CSSProperties => ({display: 'none'}),
  indicatorSeparator: (): React.CSSProperties => ({display: 'none'}),
} as const

const ContactsSearchBase = (): React.ReactElement|null => {
  const {t} = useTranslation()

  const [input, setInput] = useState('')
  const [contactToDelete, setContactToDelete] =
   useState<bayes.casContact.Person|undefined>(undefined)
  const [key, setKey] = useState(false)
  const noOptionsMessage = useCallback((): null => null, [])

  const contactedPeople = useContactIds()

  const contactPeople: PeopleState = useSelector(({people}) => people)
  const searchOptions = useMemo(() => {
    return input ? [
      {
        icon: true,
        name: t('Ajouter {{newPerson}} à la liste des personnes croisées', {newPerson: input}),
        value: {name: input, personId: ''},
      },
    ] : []
  }, [input, t])

  const peopleToShow = useMemo(
    (): readonly bayes.casContact.Person[] => contactPeople.
      filter(({personId}) => contactedPeople.has(personId)).
      map(person => ({...person})),
    [contactPeople, contactedPeople])

  const dispatch = useDispatch()
  // TODO(cyrille): Use input rather than select.
  const onSelect = useCallback(({name, personId}: bayes.casContact.Person): void => {
    setInput('')
    setKey(key => !key)
    const {personId: newPersonId} = personId ? {personId} : dispatch(createNewPerson(name))
    dispatch(createContact(newPersonId))
  }, [dispatch])
  const onSubmit = useCallback((event: React.SyntheticEvent): void => {
    event.preventDefault?.()
    onSelect({name: input, personId: ''})
  }, [input, onSelect])
  const deleteContact = useCallback(({personId}: bayes.casContact.Person): void => {
    dispatch(dropContact(personId))
    setContactToDelete(undefined)
  }, [dispatch])
  const openDeletionModal = useCallback((person: bayes.casContact.Person): void =>
    setContactToDelete(person), [])
  const closeDeletion = useCallback((): void => setContactToDelete(undefined), [])
  const headerStyle = {
    padding: reactSelectHeight / 4,
    position: 'relative',
    zIndex: 3,
  } as const
  const containerStyle = {
    backgroundColor: 'transparent',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
    zIndex: 0,
  } as const

  const contentStyle: React.CSSProperties = {
    marginTop: peopleToShow.length ? 20 : 25,
    padding: '0 30px',
    position: 'relative',
    top: -reactSelectHeight / 2,
  }
  const selectContainerStyle: React.CSSProperties = {
    cursor: 'pointer',
    position: 'relative',
  }
  const selectIconSize = 19
  const selectIconMargin = 10
  const inSelectIconContainerStyle: React.CSSProperties = {
    alignItems: 'center',
    borderRadius: selectIconSize,
    cursor: 'text',
    display: 'flex',
    left: 20,
    margin: `0 ${selectIconMargin}px`,
    position: 'absolute',
    transform: 'translateY(-50%)',
    width: selectIconSize,
    zIndex: 3,
  }
  const selectStyle: React.CSSProperties = {
    borderRadius: 20,
    bottom: reactSelectHeight / 2,
    height: reactSelectHeight,
    margin: '0 20px',
    position: 'relative',
    width: 'initial',
    zIndex: 2,
  }
  const plusSignStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: colors.MINTY_GREEN,
    borderRadius: 16,
    display: 'flex',
    height: 16,
    justifyContent: 'center',
    left: selectIconSize / 2,
    position: 'absolute',
    top: -(selectIconSize - 2) / 2,
    width: 16,
  }
  const contactDetailsMargin = 2.5
  const inDrawerTitleStyle: React.CSSProperties = {
    color: colors.DARK_GREY_BLUE,
    fontFamily: 'Lato, Helvetica',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 14 - contactDetailsMargin,
    marginLeft: contactDetailsMargin,
    textTransform: 'uppercase',
  }

  return <div style={containerStyle}>
    <div style={headerStyle} />
    <div style={{backgroundColor: colors.PALE_GREY}}>
      <div style={selectContainerStyle}>
        <div style={inSelectIconContainerStyle}>
          <div style={{position: 'relative'}}>
            <div style={plusSignStyle}><AddLineIcon size={16} /></div>
            <Emotion2FillIcon size={selectIconSize} />
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <Select<bayes.casContact.Person>
            // Key-hack to reset the selected value to undefined.
            key={`${key}`} style={selectStyle}
            placeholder={t('Ajouter une personne')}
            options={searchOptions} noOptionsMessage={noOptionsMessage}
            onInputChange={setInput} inputValue={input}
            components={{Option: IconSelectOption}}
            onChange={onSelect} value={undefined} styles={reactSelectStyles} />
        </form>
      </div>
      <div style={contentStyle}>
        <div>
          <div style={inDrawerTitleStyle}>
            {peopleToShow.length ? t('{{count}} personne croisée', {count: peopleToShow.length}) :
              t("Aucune personne ajoutée pour l'instant")}
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {peopleToShow.slice().reverse().map(
              (person: bayes.casContact.Person) => {
                return <ContactDetails
                  onDelete={openDeletionModal}
                  style={{margin: contactDetailsMargin}} key={person.personId} person={person} />
              })}
          </div>
        </div>
      </div>
    </div>
    <div style={{backgroundColor: colors.PALE_GREY, flex: 1, marginTop: -1}} />
    <DeleteUserConfirmation
      onCancel={closeDeletion} onConfirm={deleteContact} person={contactToDelete} />
  </div>
}


export default React.memo(ContactsSearchBase)
