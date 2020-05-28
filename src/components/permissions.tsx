import ArrowRightIcon from 'remixicon-react/ArrowRightLineIcon'
import {format as dateFormat} from 'date-fns'
import React, {useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {goToGoogleMapsHistoryAction, useDispatch} from 'store/actions'
import {useDateOption} from 'store/i18n'

import googleAgendaIcon from 'images/google-agenda-ico.png'
import googleMapIcon from 'images/google-map-ico.png'
import outlookIcon from 'images/outlook-ico.png'


interface BoxProps {
  hasBorder?: boolean
  icon: string
  isDone?: boolean
  onClick: () => void
  text: string
}


const boxStyle: React.CSSProperties = {
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
}
const borderStyle: React.CSSProperties = {
  borderTop: `solid 1px ${colors.MEDIUM_GREY}`,
  margin: '15px 0',
}

const iconStyle: React.CSSProperties = {
  height: 29,
  marginRight: 10,
  width: 29,
}

const PermissionBoxBase = (props: BoxProps): React.ReactElement => {
  const {hasBorder, icon, isDone, onClick, text} = props
  return <div style={boxStyle} onClick={isDone ? undefined : onClick}>
    <div style={{alignItems: 'center', display: 'flex'}}>
      <img src={icon} alt="" style={iconStyle} />
      {text}
      <div style={{flex: 1}} />
      <ArrowRightIcon size={11} color={colors.WARM_GREY} />
    </div>
    {hasBorder ? <div style={borderStyle} /> : null}
  </div>
}
const PermissionBox = React.memo(PermissionBoxBase)


interface PermissionsProps {
  date: Date
}

const Permissions = ({date}: PermissionsProps): React.ReactElement => {
  const {t} = useTranslation()
  const dateOption = useDateOption()
  const dispatch = useDispatch()
  const mapUrl = 'https://www.google.com/maps/timeline?pb=!1m2!1m1!1s' +
    `${dateFormat(date, 'yyyy-MM-dd', dateOption)}`

  // FIXME(pascal): Use the API instead.
  const [hasOutlookPermission, setHasOutlookPermission] = useState(false)
  const enableOutlookPermission = useCallback((): void => {
    setHasOutlookPermission(true)
    alert(t('Bientôt disponible…'))
  }, [t])

  // TODO(sil): Fix as this one is not a proper permission.
  const [hasGoogleMapPermission, setHasGoogleMapPermission] = useState(false)
  const enableGoogleMapPermission = useCallback((): void => {
    dispatch(goToGoogleMapsHistoryAction)
    setHasGoogleMapPermission(true)
    window.open(mapUrl, '_blank', 'noopener noreferrer')
  }, [dispatch, mapUrl])

  // FIXME(pascal): Use the API instead.
  const [hasGoogleAgendaPermission, setHasGoogleAgendaPermission] = useState(false)
  const enableGoogleAgendaPermission = useCallback((): void => {
    setHasGoogleAgendaPermission(true)
    alert(t('Bientôt disponible…'))
  }, [t])

  return <div>
    <div style={{flex: 1}} />
    <div style={{alignSelf: 'stretch'}}>
      <PermissionBox
        icon={googleAgendaIcon} hasBorder={true}
        onClick={enableGoogleAgendaPermission} isDone={hasGoogleAgendaPermission}
        text={t('Synchroniser Google Agenda')} />
      <PermissionBox
        icon={outlookIcon} hasBorder={true}
        onClick={enableOutlookPermission} isDone={hasOutlookPermission}
        text={t('Synchroniser Outlook')} />
      <PermissionBox
        icon={googleMapIcon}
        onClick={enableGoogleMapPermission} isDone={hasGoogleMapPermission}
        text={t('Voir mes trajets sur Google Maps')} />
    </div>
  </div>
}
export default React.memo(Permissions)
