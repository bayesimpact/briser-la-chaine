import React, {useCallback, useMemo, useState} from 'react'
import {useHistory, useRouteMatch} from 'react-router'
import {Swipeable} from 'react-swipeable'

import {BottomDiv} from 'components/navigation'
import Bullets from 'components/bullets'

import {ForwardFunc, useFastForward} from 'hooks/fast_forward'


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
  onFastForward?: ForwardFunc
  slideStyle?: React.CSSProperties
  transition?: string
}


interface SlideRouteParams {
  slide?: string
}


const pageStyle: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: 700,
  minHeight: window.innerHeight,
  overflow: 'hidden',
  position: 'relative',
}


function maybeParseInt(value: string|undefined, maxNumber: number): number {
  const numValue = Number.parseInt(value || '0', 10)
  if (Number.isNaN(numValue)) {
    return 0
  }
  return Math.min(Math.max(numValue, 0), maxNumber)
}


// This is a top level page and should never be nested in another one.
// TOP LEVEL PAGE
const Slider = (props: SliderProps): React.ReactElement => {
  const {arrowColor, borderColor, bottomComponent: BottomComponent, bulletColor,
    bulletSelectColor, children, onFastForward, slideStyle, transition = '1s'} = props
  const history = useHistory()
  const {path: route} = useRouteMatch()
  const selectSlide = useCallback((slide: number): void => {
    history.push(`${route}/${slide}`)
  }, [history, route])
  const match = useRouteMatch<SlideRouteParams>(`${route}/:slide?`)
  const numSlides = React.Children.count(children)
  const currentSlideIndex = maybeParseInt(match?.params.slide, numSlides - 1)
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
  }, [currentSlideIndex, onFastForward, selectSlide])
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
        arrowColor={arrowColor} borderColor={borderColor} />
    </BottomDiv>
  </div>
}


export default React.memo(Slider)
