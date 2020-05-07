import ArrowLeftIcon from 'remixicon-react/ArrowLeftLineIcon'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import {RemixiconReactIconComponentType} from 'remixicon-react/dist/typings'

import BurgerMenu from 'components/burger_menu'
import {darkButtonStyle} from 'components/buttons'


interface BottomDivProps {
  children: React.ReactNode
  defaultHeight?: number
  marginSize?: number
  onClick?: () => void
  onHeightUpdated?: (height: number) => void
  style?: React.CSSProperties
}


const bottomFloatingStyle: React.CSSProperties = {
  bottom: 0,
  left: 0,
  margin: 'auto',
  maxWidth: 700,
  position: 'fixed',
  right: 0,
}


// A div that is floating at the bottom of the screen and that adds its own space at the end of the
// main flow so that scrolling can go to the bottom.
const BottomDivBase = (props: BottomDivProps): React.ReactElement|null => {
  const {children, defaultHeight = 80, marginSize = 0, onClick, onHeightUpdated, style} = props
  const bottomDiv = useRef<HTMLDivElement>(null)
  const [bottomDivSize, setBottomDivSize] = useState(defaultHeight)
  useEffect((): void => {
    const newBottomDivSize = bottomDiv.current?.getBoundingClientRect().height
    if (newBottomDivSize) {
      const newHeight = newBottomDivSize + 2 * marginSize
      setBottomDivSize(newHeight)
      onHeightUpdated?.(newHeight)
    }
  }, [children, marginSize, onHeightUpdated])
  return children ? <React.Fragment>
    <div
      style={style ? {...bottomFloatingStyle, ...style} : bottomFloatingStyle} ref={bottomDiv}
      onClick={onClick}>
      {children}
    </div>
    <div style={{height: bottomDivSize}} />
  </React.Fragment> : null
}
const BottomDiv = React.memo(BottomDivBase)


interface PageWithNavProps {
  backTo?: string
  children?: React.ReactNode
  nextButton?: React.ReactNode
  nextButtonColor?: string
  onNext?: () => void
  style?: React.CSSProperties
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  position: 'relative',
}
const contentStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  // TODO(cyrille): Consider dropping this.
  justifyContent: 'space-around',
  padding: '0 20px',
}
const backToLinkStyle: React.CSSProperties = {
  left: 0,
  padding: 20,
  position: 'absolute',
  top: 0,
}
const mobileOnDesktopStyle: React.CSSProperties = {
  margin: 'auto',
  maxWidth: 420,
}


const PageWithNav = (props: PageWithNavProps): React.ReactElement => {
  const {backTo, children, nextButton, nextButtonColor, onNext, style} = props
  const buttonStyle: React.CSSProperties = {
    ...darkButtonStyle,
    ...nextButtonColor ? {backgroundColor: nextButtonColor} : {},
    margin: 20,
  }
  return <div style={style ? {...containerStyle, ...style} : containerStyle}>
    <BurgerMenu />
    {backTo ? <Link style={backToLinkStyle} to={backTo}>
      <ArrowLeftIcon size={20} color={colors.BUTTON_GREY} />
    </Link> : null}
    <div style={contentStyle}>
      {children}
    </div>
    <BottomDiv defaultHeight={80}>
      {nextButton ? <div style={mobileOnDesktopStyle}>
        <div style={buttonStyle} onClick={onNext}>
          {nextButton}
        </div>
      </div> : null}
    </BottomDiv>
  </div>
}
const PageWithNavMemo = React.memo(PageWithNav)


interface StringIcon {
  alt: string
  src: string
}

const isStringIcon = (icon: StringIcon|RemixiconReactIconComponentType): icon is StringIcon =>
  !!(icon as StringIcon).alt


interface PedagogyLayoutProps extends PageWithNavProps {
  icon: StringIcon|RemixiconReactIconComponentType
  children?: React.ReactNode
  iconText?: string
  isDark?: boolean
  nextButton?: React.ReactNode
  onNext?: () => void
  subtitle?: React.ReactNode
  title: React.ReactNode
}

const headerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 30,
  textAlign: 'center',
}
const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 'bold',
  margin: '0 0 20px',
  padding: '0 10px',
}
const subtitleStyle: React.CSSProperties = {
  fontSize: 15,
  margin: 0,
  padding: '0 40px',
}
const pedagogyContentStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}
const IconTextStyle: React.CSSProperties = {
  fontSize: 20,
}
const darkStyle: React.CSSProperties = {
  backgroundColor: colors.BRIGHT_SKY_BLUE,
  color: '#fff',
}

const PedagogyLayout = (props: PedagogyLayoutProps): React.ReactElement => {
  const {icon: Icon, iconText, isDark, children, subtitle, title, ...otherProps} = props
  const iconImage = useMemo(
    (): React.ReactElement => isStringIcon(Icon) ?
      <img alt={Icon.alt} src={Icon.src} style={{width: 60}} /> : <Icon size={60} />,
    [Icon])
  const circleStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: isDark ? colors.AZURE : colors.ICE_BLUE,
    borderRadius: '50%',
    color: isDark ? '#fff' : colors.BRIGHT_SKY_BLUE,
    display: 'flex',
    flexDirection: 'column',
    height: 165,
    justifyContent: 'center',
    margin: '0 0 32px',
    width: 165,
  }
  return <PageWithNav style={isDark ? darkStyle : undefined} {...otherProps}>
    <div style={pedagogyContentStyle}>
      <div style={headerStyle}>
        {iconImage ? <div style={circleStyle}>
          {iconImage}
          {iconText ? <span style={IconTextStyle}>{iconText}</span> : null}
        </div> : null}
        <h1 style={titleStyle}>{title}</h1>
        {subtitle ? <div style={subtitleStyle}>{subtitle}</div> : null}
      </div>
      {children}
    </div>
  </PageWithNav>
}
const PedagogyLayoutMemo = React.memo(PedagogyLayout)


export {BottomDiv, PageWithNavMemo as PageWithNav, PedagogyLayoutMemo as PedagogyLayout}
