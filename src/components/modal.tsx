import CloseIcon from 'remixicon-react/CloseLineIcon'
import PropTypes from 'prop-types'
import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react'


export const SmoothTransitions: React.CSSProperties = {
  transition: 'all 450ms cubic-bezier(0.18, 0.71, 0.4, 0.82) 0ms',
}


let numModalsShown = 0

function show(): void {
  if (!numModalsShown++) {
    // Disable scroll on body.
    document.body.style.overflow = 'hidden'
  }
}

function hide(): void {
  if (!--numModalsShown) {
    // Re-enable scroll on body.
    document.body.style.overflow = 'visible'
  }
}


interface ReactHeightProps extends React.HTMLProps<HTMLDivElement> {
  onHeightReady: (height: number) => void
}


const ReactHeight = (props: ReactHeightProps): React.ReactElement => {
  const {children, onHeightReady, ...otherProps} = props
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  useEffect((): void => {
    if (!ref.current) {
      return
    }
    setHeight(ref.current.clientHeight)
  }, [children])
  useLayoutEffect((): void => {
    onHeightReady(height)
  }, [height, onHeightReady])
  return <div {...otherProps} ref={ref}>
    {children}
  </div>
}


export interface ModalConfig {
  backgroundCoverOpacity?: number
  children: React.ReactNode
  className?: string
  externalChildren?: React.ReactNode
  isShown?: boolean
  onClose?: () => void
  onHidden?: () => void
  style?: React.CSSProperties
  title?: React.ReactNode
  titleStyle?: React.CSSProperties
}

const closeIconStyle = {
  cursor: 'pointer',
  height: 32,
  position: 'absolute',
  right: 20,
  top: 20,
  width: 32,
  zIndex: 3,
} as const


// The different stages of a modal:
//  - fully shown (from the beginning or when no transition)
//  - fully hidden (we do not include the children in the DOM)
//  - showing up with a transition when isShown is changed from false to true:
//    - first rendering with the new props:
//        isShown = true, new children, isAlreadyInTransition = true, isFullyShown = false
//    - calling the effects (switch wasShown to true, isInTransition to true, lastVisibleChildren)
//    - rendering after the effects
//        isShown = true, new children, isAlreadyInTransition = true, isFullyShown = false
//    - end transition callback
//        switch isInTransition to false
//    - rendering after the callback
//        isShown = true, new children, isAlreadyInTransition = false, isFullyShown = true
//  - hiding with a transition:
//    - first rendering with the new props:
//        isShown = false, new children, isAlreadyInTransition = true, isContentShown = true
//    - calling the effects (switch wasShown to false, isInTransition to true)
//    - rendering after the effects
//        isShown = false, isAlreadyInTransition = true, isContentShown = true
//    - end transition callback
//        switch isInTransition to false and lastVisibleChildren to null
//    - rendering after the callback
//        isShown = false, new children, isAlreadyInTransition = false, isContentShown = false
// Note that we ignore cases where the hasTransition flag changes.


const ModalBase = (props: ModalConfig): React.ReactElement => {
  const {backgroundCoverOpacity = .5, children, className, externalChildren, isShown, onClose,
    onHidden, style, title} = props
  const [closeButtonHeight, setCloseButtonHeight] = useState(0)
  const [isTooBigToBeCentered, setIsTooBigToBeCentered] = useState(false)
  const [modalHeight, setModalHeight] = useState(0)

  // Effect to prevent page scrolling when there's at least one modal.
  useEffect((): (() => void)|void => {
    if (isShown) {
      show()
      return hide
    }
  }, [isShown])

  const hasTransition = !style || style.transition !== 'none'

  const [wasShown, setWasShown] = useState(isShown)
  const [isInTransition, setIsInTransition] = useState(false)
  const [lastVisibleChildren, setLastVisibleChildren] = useState(children)

  useEffect(() => {
    if (isShown === wasShown) {
      return
    }
    setWasShown(isShown)
    if (!hasTransition) {
      !isShown && onHidden && onHidden()
      return
    }
    setIsInTransition(true)
  }, [isShown, hasTransition, onHidden, wasShown])

  useEffect(() => {
    if (isShown) {
      setLastVisibleChildren(children)
    }
  }, [children, isShown])

  const page = useRef<HTMLDivElement>(null)

  const handleTransitionEnd = useCallback((): void => {
    if (!hasTransition) {
      // Weird cases.
      return
    }
    setIsInTransition(false)
    if (!isShown) {
      // Reset the scroll inside the modal.
      if (page.current) {
        page.current.scrollTop = 1
      }
      onHidden && onHidden()
      setLastVisibleChildren(null)
    }
  }, [hasTransition, isShown, onHidden])

  const hasOnClose = !!onClose

  const handleUpdatedHeight = useCallback((newHeight: number): void => {
    const newCloseButtonHeight = hasOnClose ? 30 : 0
    const maxHeight = window.innerHeight - newCloseButtonHeight
    setCloseButtonHeight(newCloseButtonHeight)
    setIsTooBigToBeCentered(!!newHeight && newHeight > maxHeight)
    setModalHeight(newHeight)
  }, [hasOnClose])

  const isAlreadyInTransition = isInTransition || (isShown !== wasShown)
  const isFullyShown = isShown && !isAlreadyInTransition
  const isContentShown = isShown || isAlreadyInTransition
  const finalChildren = ((): React.ReactNode => {
    if (!isContentShown) {
      // The modal is completely hidden, no children.
      return null
    }
    if (isShown) {
      // The modal is shown, pick up the latest children.
      return children
    }
    // The modal is going into hiding, it's possible the children are gone, make sure to show the
    // last visible ones.
    return lastVisibleChildren
  })()

  const pageStyle: React.CSSProperties = {
    alignItems: 'center',
    display: isTooBigToBeCentered ? 'block' : 'flex',
    fontFamily: style && style.fontFamily || 'inherit',
    height: isContentShown ? '100vh' : '0',
    justifyContent: 'center',
    left: 0,
    opacity: isContentShown ? 1 : 0,
    overflow: isTooBigToBeCentered ? 'scroll' : 'hidden',
    position: 'fixed',
    right: 0,
    textAlign: isTooBigToBeCentered ? 'center' : 'initial',
    top: 0,
    zIndex: 2,
  }
  const modalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 10,
    boxShadow: '0 0 25px 0 rgba(0, 0, 0, 0.2)',
    color: colors.DARK_TWO,
    display: isTooBigToBeCentered ? 'inline-block' : 'block',
    fontSize: 15,
    // TODO(cyrille): Ensure margins on mobile if too big to be centered.
    margin: isTooBigToBeCentered ? `${closeButtonHeight}px auto` : '0 20px',
    opacity: isShown ? 1 : 0,
    position: 'relative',
    textAlign: 'left',
    // The transform property creates a new local coordinate system which
    // breaks nested modals or other properties using "fixed" so we get rid
    // of it as soon as the transition is over.
    // https://www.w3.org/TR/css-transforms-1/#transform-rendering
    transform: isFullyShown ? 'initial' : (
      'translate(0, ' + (isShown ? '0px' : '-40px') + ')'),
    transition: 'all 450ms',
    ...style,
  }
  const backgroundStyle: React.CSSProperties = {
    backgroundColor: colors.ALMOST_BLACK,
    bottom: isTooBigToBeCentered ? 'initial' : 0,
    height: isTooBigToBeCentered ? (modalHeight + 2 * closeButtonHeight) : '100vh',
    left: 0,
    opacity: isShown ? backgroundCoverOpacity : 0,
    position: 'absolute',
    right: 0,
    top: 0,
    transition: modalStyle.transition,
    zIndex: 0,
  }
  const titleStyle: React.CSSProperties = {
    borderBottom: `solid 2px ${colors.MEDIUM_GREY}`,
    color: colors.DARK_TWO,
    fontSize: 18,
    fontWeight: 600,
    margin: '40px 50px 0',
    paddingBottom: 30,
    textAlign: 'center',
    ...props.titleStyle,
  }
  return <div ref={page} style={pageStyle}>
    <div style={backgroundStyle} />
    {externalChildren}
    <ReactHeight
      onHeightReady={handleUpdatedHeight} style={modalStyle} className={className}
      onTransitionEnd={handleTransitionEnd}>
      {title ? <div style={titleStyle}>{title}</div> : null}
      {onClose ? <CloseIcon style={closeIconStyle} onClick={onClose} /> : null}
      {finalChildren}
    </ReactHeight>
  </div>
}
ModalBase.propTypes = {
  // Opacity of the black cover on the backround.
  backgroundCoverOpacity: PropTypes.number,
  // Content of the modal box.
  children: PropTypes.node,
  // Children to set on top of the semi-opaque background but outside of the
  // modal box.
  externalChildren: PropTypes.node,
  // Whether the modal is shown.
  isShown: PropTypes.bool,
  // Callback when the modal is closed (X button is clicked).
  // X button will only be displayed if this function is provided.
  onClose: PropTypes.func,
  // Callback when the modals finishes the hide transition.
  onHidden: PropTypes.func,
  // Additional styling for the modal box.
  style: PropTypes.object,
  title: PropTypes.node,
  // Additionl styling for the title.
  titleStyle: PropTypes.object,
}
const Modal = React.memo(ModalBase)

export {Modal}
