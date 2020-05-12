import CloseIcon from 'remixicon-react/CloseLineIcon'
import React, {useEffect} from 'react'


interface DrawerContainerProps {
  children: React.ReactNode
  onTransitionEnd?: () => void
  drawer: React.ReactNode
  isOpen: boolean
  onClose?: () => void
  style?: React.CSSProperties
}


const transition = '450ms'


const topLevelStyle: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: 700,
}
const mainStyle: React.CSSProperties = {
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
  color: '#fff',
  cursor: 'pointer',
  position: 'absolute',
  right: 15,
  top: 15,
  zIndex: 3,
} as const


// This is a top level page and should never be nested in another one.
// TOP LEVEL PAGE
const DrawerContainer = (props: DrawerContainerProps): React.ReactElement => {
  const {children, drawer, isOpen, onClose, style, ...otherProps} = props
  const opaqueStyle: React.CSSProperties = {
    background: '#000',
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
    maxHeight: isOpen ? undefined : 0,
    minHeight: isOpen ? window.innerHeight : 0,
    overflow: isOpen ? 'auto' : 'hidden',
    position: 'relative',
    transform: isOpen ? '' : `translateY(${window.innerHeight}px)`,
    transition,
    zIndex: 2,
  }
  useEffect((): void => {
    window.scrollTo({behavior: 'smooth', top: 1})
  }, [isOpen])
  return <div {...otherProps} style={{...topLevelStyle, ...style}}>
    <div style={isOpen ? mainStyle : undefined}>
      {children}
    </div>
    <div style={opaqueStyle} onClick={onClose} />
    <div style={drawerStyle}>
      {onClose ? <CloseIcon style={closeIconStyle} onClick={onClose} /> : null}
      {isOpen ? drawer : null}
    </div>
  </div>
}


export default React.memo(DrawerContainer)
