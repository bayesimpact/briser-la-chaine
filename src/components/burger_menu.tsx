import React, {useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import ArrowRightLineIcon from 'remixicon-react/ArrowRightLineIcon'
import ArrowLeftLineIcon from 'remixicon-react/ArrowLeftLineIcon'
import MenuLineIcon from 'remixicon-react/MenuLineIcon'
import LightbulbFillIcon from 'remixicon-react/LightbulbFillIcon'

import {Routes} from 'store/url'

import {Modal} from 'components/modal'
import Privacy from 'components/pages/privacy'
import Terms from 'components/pages/terms'

interface MenuLinkProps extends React.HTMLProps<HTMLAnchorElement> {
  children: React.ReactNode
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
const firstMenuLinkStyle: React.CSSProperties = {
  borderTop: 'none',
}

const MenuLinkBase = ({children, style, ...props}: MenuLinkProps): React.ReactElement => <a
  {...props} style={style ? {...menuLinkStyle, ...style} : menuLinkStyle}>
  <span style={{flex: 1}}>{children}</span>
  <ArrowRightLineIcon size={15} />
</a>
const MenuLink = React.memo(MenuLinkBase)

const modalTitleStyle: React.CSSProperties = {
  fontSize: 19,
  margin: '36px 0 20px',
  textAlign: 'center',
}
const modalMargin = 40
const modalStyle: React.CSSProperties = {
  borderRadius: 5,
  display: 'flex',
  flexDirection: 'column',
  fontWeight: 'normal',
  height: window.innerHeight - 2 * modalMargin,
  margin: modalMargin,
  maxWidth: 400,
  overflow: 'auto',
  padding: '0 20px',
  position: 'relative',
  width: `calc(100vw - ${2 * modalMargin}px`,
}
const disclaimerStyle: React.CSSProperties = {
  backgroundColor: colors.MEDIUM_GREY,
  margin: '20px -20px 0',
  padding: 17,
  textAlign: 'center',
}
const backButtonStyle: React.CSSProperties = {
  cursor: 'pointer',
  left: 15,
  position: 'absolute',
  top: 15,
}
const textContentStyle: React.CSSProperties = {
  paddingBottom: 20,
}
const burgerStyle: React.CSSProperties = {
  position: 'absolute',
  right: 15,
  top: 15,
}
const BurgerMenu = (): React.ReactElement => {
  const {t} = useTranslation()
  const [isShown, setShown] = useState(false)
  const showMenu = useCallback((): void => setShown(true), [])
  const [page, setPage] = useState<'menu'|'privacy'|'terms'>('menu')
  const closeMenu = useCallback((): void => {
    setShown(false)
    setPage('menu')
  }, [])
  const setMenu = useCallback((): void => setPage('menu'), [])
  const setPrivacy = useCallback((): void => setPage('privacy'), [])
  const setTerms = useCallback((): void => setPage('terms'), [])
  const history = useHistory()
  const goHome = useCallback(() => history.push(Routes.SPLASH), [history])
  return <React.Fragment>
    <Modal className="no-scrollbars" style={modalStyle} onClose={closeMenu} isShown={isShown}>
      {page === 'menu' ? null :
        <ArrowLeftLineIcon style={backButtonStyle} onClick={setMenu} size={15} />}
      {page === 'menu' ? <React.Fragment>
        <h3 style={modalTitleStyle}>{t('Menu')}</h3>
        <MenuLink style={firstMenuLinkStyle} onClick={goHome}>{t('Accueil')}</MenuLink>
        <MenuLink onClick={setPrivacy}>{t('Vie privée')}</MenuLink>
        <MenuLink onClick={setTerms}>{t('CGU')}</MenuLink>
        <MenuLink href={contactLink} rel="noopener noreferrer" target="_blank">
          {t('Nous contacter')}
        </MenuLink>
        <div style={{flex: 1}} />
        <div style={disclaimerStyle}>
          <LightbulbFillIcon size={12} />
          <span style={{marginLeft: 8}}>{t('Nous ne collectons aucune donnée')}</span>
        </div>
      </React.Fragment> : page === 'privacy' ? <React.Fragment>
        <h3 style={modalTitleStyle}>{t('Vie privée')}</h3>
        <Privacy style={textContentStyle} />
      </React.Fragment> : <React.Fragment>
        <h3 style={modalTitleStyle}>{t('CGU')}</h3>
        <Terms style={textContentStyle} />
      </React.Fragment>}
    </Modal>
    <MenuLineIcon style={burgerStyle} size={24} onClick={showMenu} />
  </React.Fragment>
}

export default React.memo(BurgerMenu)
