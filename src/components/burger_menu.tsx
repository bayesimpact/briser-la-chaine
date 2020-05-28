import Storage from 'local-storage-fallback'
import React, {useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import ArrowLeftLineIcon from 'remixicon-react/ArrowLeftLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import Chat3FillIcon from 'remixicon-react/Chat3FillIcon'
import DeleteBin7FillIcon from 'remixicon-react/DeleteBin7FillIcon'
import FileList3FillIcon from 'remixicon-react/FileList3FillIcon'
import HomeFillIcon from 'remixicon-react/HomeFillIcon'
import InformationLineIcon from 'remixicon-react/InformationLineIcon'
import MenuLineIcon from 'remixicon-react/MenuLineIcon'
import ShareFillIcon from 'remixicon-react/ShareFillIcon'
import ShieldUserFillIcon from 'remixicon-react/ShieldUserFillIcon'
import {RemixiconReactIconComponentType} from 'remixicon-react/dist/typings'

import {useDefaultShareText} from 'hooks/share'
import {cleanStorage, useDispatch} from 'store/actions'
import {useHasCache} from 'store/selections'
import {Routes} from 'store/url'

import {Modal} from 'components/modal'
import Privacy from 'components/pages/privacy'
import Terms from 'components/pages/terms'
import ShareButtons from 'components/share_buttons'

interface MenuLinkProps extends React.HTMLProps<HTMLAnchorElement> {
  children: React.ReactNode
  icon: RemixiconReactIconComponentType
  style?: React.CSSProperties
}

const contactLink = `mailto:${config.followUpMail}`
const menuLinkStyle: React.CSSProperties = {
  alignItems: 'center',
  borderTop: `1px solid ${colors.MEDIUM_GREY}`,
  color: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  padding: '20px 0',
  textDecoration: 'none',
}
const iconContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.MINTY_GREEN,
  borderRadius: 38,
  color: '#fff',
  display: 'flex',
  height: 38,
  justifyContent: 'center',
  marginRight: 15,
  width: 38,
}
const firstMenuLinkStyle: React.CSSProperties = {
  borderTop: 'none',
}
const arrowRightStyle: React.CSSProperties = {
  opacity: .3,
}

const MenuLinkBase = (props: MenuLinkProps): React.ReactElement => {
  const {children, icon: Icon, style, ...otherProps} = props
  return <a
    {...otherProps} style={style ? {...menuLinkStyle, ...style} : menuLinkStyle}>
    <span style={iconContainerStyle}>
      <Icon size={20} />
    </span>
    <span style={{flex: 1}}>{children}</span>
    <ArrowRightSLineIcon size={21} color="#000" style={arrowRightStyle} />
  </a>
}
const MenuLink = React.memo(MenuLinkBase)

const modalTitleStyle: React.CSSProperties = {
  alignItems: 'center',
  color: '#000',
  display: 'flex',
  fontFamily: 'Poppins',
  fontSize: 18,
  fontWeight: 800,
  margin: '0 0 20px',
}
const modalMargin = 40
const modalStyle: React.CSSProperties = {
  borderRadius: 23,
  display: 'flex',
  flexDirection: 'column',
  fontSize: 16,
  fontWeight: 'normal',
  height: window.innerHeight - 2 * modalMargin,
  margin: modalMargin,
  maxWidth: 400,
  overflow: 'auto',
  padding: '25px 25px 0',
  position: 'relative',
  width: `calc(100vw - ${2 * modalMargin}px`,
}
const disclaimerStyle: React.CSSProperties = {
  backgroundColor: colors.PALE_GREY,
  borderRadius: '0 0 23px 23px',
  fontSize: 13,
  margin: '20px -25px 0',
  padding: 22,
  textAlign: 'center',
}
const backButtonStyle: React.CSSProperties = {
  cursor: 'pointer',
  marginRight: 10,
}
const textContentStyle: React.CSSProperties = {
  paddingBottom: 20,
}
const burgerStyleBase: React.CSSProperties = {
  color: colors.MEDIUM_GREY,
  position: 'absolute',
  right: 15,
  top: 15,
}
const BurgerMenu = ({color}: {color?: string}): React.ReactElement => {
  const {t} = useTranslation()
  const shareText = useDefaultShareText()
  const dispatch = useDispatch()
  const history = useHistory()
  const [isShown, setShown] = useState(false)
  const showMenu = useCallback((): void => setShown(true), [])
  const [page, setPage] = useState<'menu'|'privacy'|'terms'|'share'>('menu')
  const closeMenu = useCallback((): void => {
    setShown(false)
    setPage('menu')
  }, [])
  const hasCache = useHasCache() || !!Object.keys(Storage).length
  const setMenu = useCallback((): void => setPage('menu'), [])
  const setPrivacy = useCallback((): void => setPage('privacy'), [])
  const setTerms = useCallback((): void => setPage('terms'), [])
  const setShare = useCallback((): void => setPage('share'), [])
  const goHome = useCallback(() => history.push(Routes.SPLASH), [history])
  const [isClearCacheValidating, setIsClearCacheValidating] = useState(false)
  const clearStorage = useCallback((): void => {
    if (!isClearCacheValidating) {
      setIsClearCacheValidating(true)
      return
    }
    dispatch(cleanStorage())
    goHome()
  }, [dispatch, goHome, isClearCacheValidating])
  const cancelClearCache = useCallback((event: React.SyntheticEvent): void => {
    event.stopPropagation()
    setIsClearCacheValidating(false)
  }, [])
  const burgerStyle = useMemo((): React.CSSProperties => ({
    ...burgerStyleBase,
    color,
  }), [color])
  const backArrow = <ArrowLeftLineIcon style={backButtonStyle} onClick={setMenu} size={25} />
  return <React.Fragment>
    <Modal className="no-scrollbars" style={modalStyle} onClose={closeMenu} isShown={isShown}>
      {page === 'menu' ? <React.Fragment>
        <h3 style={modalTitleStyle}>{t('Menu')}</h3>
        <MenuLink style={firstMenuLinkStyle} onClick={goHome} icon={HomeFillIcon}>
          {t('Accueil')}
        </MenuLink>
        <MenuLink
          onClick={setPrivacy} icon={ShieldUserFillIcon}>{t('Vie privée')}</MenuLink>
        <MenuLink onClick={setTerms} icon={FileList3FillIcon}>{t('CGU')}</MenuLink>
        <MenuLink onClick={setShare} icon={ShareFillIcon}>{t('Partager')}</MenuLink>
        {hasCache ? <MenuLink onClick={clearStorage} icon={DeleteBin7FillIcon}>
          {isClearCacheValidating ? <React.Fragment>
            {t('Supprimer toutes vos données\u00A0?')}{' '}
            {t('Oui')} / <span onClick={cancelClearCache}>{t('Non')}</span>
          </React.Fragment> : t('Vider votre cache')}
        </MenuLink> : null}
        <MenuLink href={contactLink} rel="noopener noreferrer" target="_blank" icon={Chat3FillIcon}>
          {t('Nous contacter')}
        </MenuLink>
        <div style={{flex: 1}} />
        <div style={disclaimerStyle}>
          <InformationLineIcon size={12} />
          <span style={{marginLeft: 8}}>{t('Nous ne collectons aucune donnée')}</span>
        </div>
      </React.Fragment> : page === 'privacy' ? <React.Fragment>
        <h3 style={modalTitleStyle}>{backArrow} {t('Vie privée')}</h3>
        <Privacy style={textContentStyle} />
      </React.Fragment> : page === 'terms' ? <React.Fragment>
        <h3 style={modalTitleStyle}>{backArrow} {t('CGU')}</h3>
        <Terms style={textContentStyle} />
      </React.Fragment> : <React.Fragment>
        <h3 style={modalTitleStyle}>{backArrow} {t('Partager')}</h3>
        <ShareButtons sharedText={shareText} />
      </React.Fragment>}
    </Modal>
    <MenuLineIcon style={burgerStyle} size={24} onClick={showMenu} />
  </React.Fragment>
}

export default React.memo(BurgerMenu)
