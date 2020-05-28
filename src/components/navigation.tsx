import React, {useEffect, useMemo, useRef, useState} from 'react'
import {RemixiconReactIconComponentType} from 'remixicon-react/dist/typings'

import BurgerMenu from 'components/burger_menu'
import {darkButtonStyle} from 'components/buttons'


// TODO(pascal): Split this file in smaller modules.


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
  children?: React.ReactNode
  nextButton?: React.ReactNode
  nextButtonColor?: string
  onNext?: () => void
  style?: React.CSSProperties
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: 700,
  minHeight: window.innerHeight,
  position: 'relative',
}
const contentStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  // TODO(cyrille): Consider dropping this.
  justifyContent: 'space-evenly',
  padding: '0 20px',
}
export const mobileOnDesktopStyle: React.CSSProperties = {
  margin: 'auto',
  maxWidth: 420,
}


// This is a top level page and should never be nested in another one.
// TOP LEVEL PAGE
const PageWithNav = (props: PageWithNavProps): React.ReactElement => {
  const {children, nextButton, nextButtonColor, onNext, style} = props
  const buttonStyle: React.CSSProperties = {
    ...darkButtonStyle,
    ...nextButtonColor ? {
      backgroundColor: nextButtonColor,
      // TODO(pascal): Clean up by creating a nextButtonStyle or any other strategy.
      color: nextButtonColor === colors.MINTY_GREEN ? '#000' : darkButtonStyle.color,
    } : {},
    fontFamily: 'Poppins',
    fontWeight: 800,
    margin: 20,
  }
  return <div style={style ? {...containerStyle, ...style} : containerStyle}>
    <BurgerMenu />
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


interface PedagogyLayoutProps {
  icon: StringIcon|RemixiconReactIconComponentType
  iconColor?: string
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
  fontSize: 21,
  lineHeight: 1.29,
  margin: '0 0 20px',
  padding: '0 10px',
}
const subtitleStyle: React.CSSProperties = {
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


const PedagogyLayout = (props: PedagogyLayoutProps): React.ReactElement => {
  const {icon: Icon, iconColor, iconText, isDark, children, subtitle, title} = props
  const iconImage = useMemo(
    (): React.ReactElement => isStringIcon(Icon) ?
      <img alt={Icon.alt} src={Icon.src} style={{width: 60}} /> : <Icon size={60} />,
    [Icon])
  const circleStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: isDark ? '#fff' : colors.PALE_GREY,
    borderRadius: '50%',
    color: iconColor || (isDark ? colors.MINTY_GREEN : '#000'),
    display: 'flex',
    flexDirection: 'column',
    height: 165,
    justifyContent: 'center',
    margin: '0 0 32px',
    width: 165,
  }
  return <div style={pedagogyContentStyle}>
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
}
const PedagogyLayoutMemo = React.memo(PedagogyLayout)


type PedagogyPageProps = PedagogyLayoutProps & PageWithNavProps


// This is a top level page and should never be nested in another one.
// TOP LEVEL PAGE
const PedagogyPage = (props: PedagogyPageProps): React.ReactElement => {
  const {icon, iconColor, iconText, isDark, children, subtitle, title, ...otherProps} = props
  return <PageWithNav {...otherProps}>
    <PedagogyLayout {...{children, icon, iconColor, iconText, isDark, subtitle, title}} />
  </PageWithNav>
}
const PedagogyPageMemo = React.memo(PedagogyPage)


export {
  BottomDiv,
  PageWithNavMemo as PageWithNav,
  PedagogyLayoutMemo as PedagogyLayout,
  PedagogyPageMemo as PedagogyPage,
}
