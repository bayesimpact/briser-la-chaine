import React, {useCallback, useMemo, useState} from 'react'
import {Swipeable} from 'react-swipeable'

import {ForwardFunc, useFastForward} from 'hooks/fast_forward'
import {useRouteStepper} from 'hooks/stepper'

import {BottomDiv} from 'components/navigation'
import Bullets from 'components/bullets'


interface SlideProps {
  bottomDivSize?: number
  children: React.ReactNode
  index: number
  onSwipedLeft: () => void
  onSwipedRight: () => void
  style?: React.CSSProperties
  transition?: string
}


const Slide = (props: SlideProps): React.ReactElement => {
  const {bottomDivSize, children, index, style, transition, ...otherProps} = props
  // TODO(cyrille): Update on resize, since user might turn their phones.
  const screenWidth = Math.min(700, window.innerWidth)
  const slideStyle = useMemo((): React.CSSProperties => ({
    boxSizing: 'border-box',
    left: '50%',
    minHeight: window.innerHeight,
    opacity: index ? 0 : 1,
    paddingBottom: bottomDivSize,
    position: 'absolute',
    transform: `translateX(${index * screenWidth}px) translateX(-50%)`,
    transition: transition && `transform ${transition}, opacity ${transition}`,
    width: screenWidth,
    ...style,
  }), [bottomDivSize, index, screenWidth, style, transition])
  return <Swipeable className="no-scrollbars" style={slideStyle} {...otherProps}>
    {children}
  </Swipeable>
}


export interface SliderChildProps {
  goBack: () => void
  goForward: () => void
  isLastPage: boolean
}


interface SliderProps {
  arrowColor?: string
  borderColor?: string
  bottomComponent?: React.ComponentType<SliderChildProps>
  bulletColor?: string
  bulletSelectColor?: string
  children: readonly React.ReactNode[]
  chevronColor?: string
  onFastForward?: ForwardFunc
  slideStyle?: React.CSSProperties
  transition?: string
}


const pageStyle: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: 700,
  minHeight: window.innerHeight,
  overflow: 'hidden',
  position: 'relative',
}


// This is a top level page and should never be nested in another one.
// TOP LEVEL PAGE
const Slider = (props: SliderProps): React.ReactElement => {
  const {arrowColor, borderColor, bottomComponent: BottomComponent, bulletColor,
    bulletSelectColor, chevronColor, children, onFastForward, slideStyle, transition = '1s'} = props
  const numSlides = React.Children.count(children)
  const [currentSlideIndex, selectSlide] = useRouteStepper(numSlides)
  const goBack = useCallback((): void => {
    if (currentSlideIndex > 0) {
      selectSlide(currentSlideIndex - 1)
    }
  }, [currentSlideIndex, selectSlide])
  const goForward = useCallback((): void => {
    if (currentSlideIndex < numSlides - 1) {
      selectSlide(currentSlideIndex + 1)
    }
  }, [currentSlideIndex, numSlides, selectSlide])
  useFastForward((): boolean|undefined|void => {
    if (currentSlideIndex < numSlides - 1) {
      selectSlide(currentSlideIndex + 1)
      return
    }
    if (onFastForward) {
      return onFastForward()
    }
    return true
  }, [currentSlideIndex, numSlides, onFastForward, selectSlide])
  const [bottomDivSize, setBottomDivSize] = useState(0)
  return <div style={pageStyle}>
    {React.Children.map(children, (slide: React.ReactNode, index: number): React.ReactElement =>
      <Slide
        key={index} index={index - currentSlideIndex} onSwipedRight={goBack}
        onSwipedLeft={goForward} style={slideStyle} transition={transition}
        bottomDivSize={bottomDivSize}>
        {slide}
      </Slide>,
    )}
    <BottomDiv onHeightUpdated={setBottomDivSize}>
      {BottomComponent ? <BottomComponent
        isLastPage={currentSlideIndex === numSlides - 1} goForward={goForward} goBack={goBack} /> :
        null}
      <Bullets
        indexVisible={currentSlideIndex} numBullets={numSlides} onSelect={selectSlide}
        color={bulletColor} selectColor={bulletSelectColor} transition={transition}
        arrowColor={arrowColor} borderColor={borderColor} chevronColor={chevronColor} />
    </BottomDiv>
  </div>
}


export default React.memo(Slider)
