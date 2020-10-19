import CloseIcon from 'remixicon-react/CloseLineIcon'
import React, {useEffect, useRef, useState} from 'react'


interface DrawerContainerProps {
  children: React.ReactNode
  onTransitionEnd?: () => void
  drawer: React.ReactNode
  isOpen: boolean
  mainStyle?: React.CSSProperties
  margin?: number
  onClose?: () => void
  style?: React.CSSProperties
}


const transition = '450ms'


const topLevelStyle: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: 700,
}
const mainOpeningStyle: React.CSSProperties = {
  left: '50%',
  maxHeight: window.innerHeight,
  maxWidth: '100vw',
  overflow: 'hidden',
  position: 'absolute',
  top: 0,
  transform: 'translateX(-50%)',
  zIndex: 0,
}
const closeIconStyle: React.CSSProperties = {
  color: colors.ALMOST_BLACK,
  cursor: 'pointer',
  position: 'absolute',
  right: 15,
  top: 15,
  zIndex: 3,
} as const


// This is a top level page and should never be nested in another one.
// TOP LEVEL PAGE
const DrawerContainer = (props: DrawerContainerProps): React.ReactElement => {
  const {children, drawer, isOpen, mainStyle, margin = 0, onClose, style, ...otherProps} = props
  const [mainWidth, setMainWidth] = useState(0)
  const opaqueStyle: React.CSSProperties = {
    background: colors.ALMOST_BLACK,
    bottom: 0,
    left: 0,
    opacity: isOpen ? .5 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
    position: 'fixed',
    right: 0,
    top: 0,
    transition,
    zIndex: 1,
  }
  const drawerStyle: React.CSSProperties = {
    display: 'flex',
    marginTop: isOpen ? margin : 0,
    maxHeight: isOpen ? undefined : 0,
    minHeight: isOpen ? (window.innerHeight - margin) : 0,
    overflow: isOpen ? 'auto' : 'hidden',
    position: 'relative',
    transform: isOpen ? '' : `translateY(${window.innerHeight}px)`,
    transition,
    zIndex: 2,
  }
  const mainContainerRef = useRef<HTMLDivElement>(null)
  useEffect((): void => {
    window.scrollTo({behavior: 'smooth', top: 1})
    if (!isOpen && mainContainerRef.current) {
      setMainWidth(mainContainerRef.current.getBoundingClientRect().width)
    }
  }, [isOpen])
  return <div {...otherProps} style={{...topLevelStyle, ...style}}>
    <div ref={mainContainerRef} style={isOpen ? {
      ...mainOpeningStyle, width: mainWidth || undefined, ...mainStyle,
    } : mainStyle}>
      {children}
    </div>
    <div style={opaqueStyle} onClick={onClose} />
    <div style={drawerStyle}>
      {onClose ? <CloseIcon style={closeIconStyle} onClick={onClose} size={32} /> : null}
      {isOpen ? drawer : null}
    </div>
  </div>
}


export default React.memo(DrawerContainer)
